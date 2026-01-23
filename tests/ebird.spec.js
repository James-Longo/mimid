const { test, expect } = require('@playwright/test');

test('mimid ebird region filtering', async ({ page }) => {
    page.on('console', msg => console.log(`BROWSER LOG: ${msg.text()}`));
    await page.goto('/');

    // 1. Select Region Source
    const regionSource = page.locator('#regionSource');
    await regionSource.selectOption('us-states');

    // 2. Search and select region (New York)
    const regionSearch = page.locator('#regionSearch');
    await regionSearch.fill('New York');
    await page.locator('.dropdown-item').first().click();

    // 3. Select Vocalization Type
    const typeSelect = page.locator('#globalType');
    await typeSelect.selectOption('song');

    // 4. Create Session
    const createSessionBtn = page.locator('#createSessionBtn');
    await createSessionBtn.click();

    // 5. Verify session creation
    const loadingStatus = page.locator('#loadingStatus');
    await expect(loadingStatus).toContainText(/Fetching eBird species list/);

    // Wait for session to load
    const startBtn = page.locator('#startBtn');
    await expect(startBtn).toBeVisible({ timeout: 60000 });

    // 6. Start quiz
    await startBtn.click();

    // 7. Interact with flashcards
    const revealBtn = page.locator('#revealBtn');
    await expect(revealBtn).toBeVisible();
});
