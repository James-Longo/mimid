const { test, expect } = require('@playwright/test');

test('mimid ux overhaul unified search and view transition', async ({ page }) => {
    page.on('console', msg => console.log(`BROWSER LOG: ${msg.text()}`));
    await page.goto('/');

    // 1. Verify Setup View is visible and Study View is hidden
    await expect(page.locator('#setupView')).toBeVisible();
    await expect(page.locator('#studyView')).toBeHidden();

    // Mock eBird API to return a predefined list of species for New York
    await page.route('**/*ebird.org/**', async route => {
        const json = ["magwar", "amered"]; // Mock data (Magnolia Warbler, American Redstart)
        await route.fulfill({ json });
    });

    // Mock Taxonomy Mapping
    await page.route('**/ebird_to_sci.json', async route => {
        const json = { "magwar": "Setophaga magnolia", "amered": "Setophaga ruticilla" };
        await route.fulfill({ json });
    });

    // Mock Species Database
    await page.route('**/all_species.json', async route => {
        const json = [
            { "sci": "Setophaga magnolia", "en": "Magnolia Warbler", "family": "New World Warblers" },
            { "sci": "Setophaga ruticilla", "en": "American Redstart", "family": "New World Warblers" }
        ];
        await route.fulfill({ json });
    });

    // 2. Verify Unified Region Search
    const regionSearch = page.locator('#regionSearch');
    await regionSearch.fill('New York');

    // Expect "New York" with "(US State)"
    const nyResult = page.locator('.dropdown-item').filter({ hasText: 'New York' }).first();
    await expect(nyResult).toBeVisible();
    await expect(nyResult).toContainText('US State');
    await nyResult.click();

    // 3. Verify selection triggers eBird fetch (Species List should appear)
    const speciesSummary = page.locator('#speciesListSummary');
    await expect(speciesSummary).toBeVisible({ timeout: 10000 });

    // Wait for the fetch to complete
    const countBadge = page.locator('#speciesCountBadge');
    await expect(countBadge).not.toHaveText('...', { timeout: 15000 });

    // DEBUG: Check what the count actually is
    const count = await countBadge.innerText();
    console.log(`BROWSER LOG: Species Count Badge says: ${count}`);

    // If mapping works, it should be 2. If it's 0, mapping failed.
    await expect(countBadge).toHaveText('2', { timeout: 5000 });

    // 4. Create Session
    const createBtn = page.locator('#createSessionBtn');
    await createBtn.click();

    // 5. Verify View Transition
    await expect(page.locator('#setupView')).toBeHidden();
    await expect(page.locator('#studyView')).toBeVisible();

    // 6. Verify Study Session is active
    await expect(page.locator('#cardContainer')).toBeVisible();

    // 7. Verify "End Session" returns to Setup
    const endBtn = page.locator('#endSessionBtn');

    // Handle confirm dialog
    page.on('dialog', dialog => dialog.accept());

    await endBtn.click();
    await expect(page.locator('#setupView')).toBeVisible();
    await expect(page.locator('#studyView')).toBeHidden();
});
