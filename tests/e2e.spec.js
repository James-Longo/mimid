const { test, expect } = require('@playwright/test');

test('mimid e2e flow', async ({ page }) => {
    page.on('console', msg => console.log(`BROWSER LOG: ${msg.text()}`));
    // 1. Load the page (static site mocked via http-server)
    await page.goto('/');

    // Check title
    await expect(page).toHaveTitle(/mimid/);

    // 2. Select region (Country)
    const countryInput = page.locator('#globalCountry');
    await countryInput.fill('United States');

    // 3. Select vocalization type (Song/Call)
    const typeSelect = page.locator('#globalType');
    await typeSelect.selectOption('song');

    // 4. Select species/families (Add a family)
    // Wait for species list to load (API call in init)
    const speciesSearch = page.locator('#speciesSearch');
    await speciesSearch.fill('Northern Cardinal');
    // Click the first result
    await page.locator('.dropdown-item').first().click();
    // await familySelect.selectOption({ label: 'Storks (Ciconiidae)' }); // Valid family from json

    // 5. Create session
    const createSessionBtn = page.locator('#createSessionBtn');
    await createSessionBtn.click();

    // Wait for session to load
    const startBtn = page.locator('#startBtn');
    await expect(startBtn).toBeVisible({ timeout: 30000 });

    // 6. Start quiz
    await startBtn.click();

    // 7. Interact with flashcards
    const revealBtn = page.locator('#revealBtn');
    await expect(revealBtn).toBeVisible();

    // Click reveal
    await revealBtn.click();

    // Check if rating buttons appear
    const ratingButtons = page.locator('#ratingButtons');
    await expect(ratingButtons).toBeVisible();

    // Click a rating button (e.g., Easy)
    const easyBtn = page.locator('.rating-btn.easy');
    await expect(easyBtn).toBeVisible();
    await easyBtn.click();

    // Verify next card is loaded (reveal button should be back or we see a new card)
    // For now, just checking if we can click it is enough to prove interactivity.
    // If the bug is "can't respond", the click might not trigger anything or the buttons might not be reachable.
    await expect(revealBtn).toBeVisible();
});
