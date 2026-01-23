const { test, expect } = require('@playwright/test');

test('mimid reactive species list and maine warblers', async ({ page }) => {
    page.on('console', msg => console.log(`BROWSER LOG: ${msg.text()}`));
    await page.goto('/');

    // 1. Initially, species list summary is hidden
    const summaryDiv = page.locator('#speciesListSummary');
    await expect(summaryDiv).toBeHidden();

    // 2. Select Family: New World Warblers (Parulidae)
    const familySelect = page.locator('#familySelect');
    await familySelect.selectOption('New World Warblers (Parulidae)');

    // 3. Species list should now be visible and showing a large number (many warblers globally)
    await expect(summaryDiv).toBeVisible();
    const countBadge = page.locator('#speciesCountBadge');
    let initialCount = await countBadge.innerText();
    console.log(`Initial Global Warblers Count: ${initialCount}`);
    expect(parseInt(initialCount)).toBeGreaterThan(100);

    // 4. Select Region: US State -> Maine
    const regionSource = page.locator('#regionSource');
    await regionSource.selectOption('us-states');

    const regionSearch = page.locator('#regionSearch');
    await regionSearch.fill('Maine');
    await page.locator('.dropdown-item:has-text("Maine")').first().click();

    // 5. Wait for regional fetch and intersection
    // The count should drop significantly as it filters global warblers by Maine presence
    await expect(async () => {
        const currentCount = await countBadge.innerText();
        console.log(`Current Count during fetch: ${currentCount}`);
        expect(currentCount).not.toBe("...");
        expect(parseInt(currentCount)).toBeLessThan(parseInt(initialCount));
    }).toPass({ timeout: 10000 });

    const maineWarblersCount = await countBadge.innerText();
    console.log(`Maine Warblers Count: ${maineWarblersCount}`);
    expect(parseInt(maineWarblersCount)).toBeGreaterThan(20);
    expect(parseInt(maineWarblersCount)).toBeLessThan(60);

    // 6. Verify "Masked Yellowthroat" is NOT in the preview
    const previewPara = page.locator('#speciesListPreview');
    await expect(previewPara).not.toContainText('Masked Yellowthroat');

    // 7. Create Session
    const createSessionBtn = page.locator('#createSessionBtn');
    await createSessionBtn.click();

    // 8. Verify session creation
    const poolStatus = page.locator('#poolStatus');
    await expect(poolStatus).toContainText(/Session Ready/, { timeout: 60000 });
});
