TestRunner.add("Config initialization and overrides", async () => {
    // 1. Clear existing config data for clean test
    localStorage.removeItem('mimid_xc_key');
    localStorage.removeItem('mimid_ebird_key');

    // 2. Initialize Config
    await Config.init();

    // 3. Test set/get from localStorage
    Config.setXCKey('test-xc-key');
    TestRunner.assert(localStorage.getItem('mimid_xc_key') === 'test-xc-key', "XC key should be saved to localStorage");

    // 4. Test masking/status (Note: this depends on whether config.json exists in environment)
    console.log("Current Config Status:", Config.status);
    TestRunner.assert(Config.status !== 'Checking...', "Status should be updated after init");
});

TestRunner.add("Species database loading", async () => {
    TestRunner.assert(Array.isArray(SPECIES_LIST), "SPECIES_LIST should be an array");
    TestRunner.assert(SPECIES_LIST.length > 0, "SPECIES_LIST should not be empty");

    const cardinal = SPECIES_LIST.find(s => s.en === 'Northern Cardinal');
    TestRunner.assert(!!cardinal, "Should be able to find Northern Cardinal in DB");
});

TestRunner.add("Proxy routing logic", async () => {
    const originalProxy = Config.proxyUrl;

    // Test: Set a mock proxy URL
    Config.setProxyUrl("https://test-proxy.workers.dev/");
    TestRunner.assert(Config.proxyUrl === "https://test-proxy.workers.dev/", "Proxy URL should be saved and loaded");

    // Test: Verify internal status update
    console.log("Proxy Status:", Config.status);
    TestRunner.assert(Config.status.includes("Proxy"), "Status should reflect proxy usage");

    // Restore original state (Cleanup)
    if (originalProxy) Config.setProxyUrl(originalProxy);
    else localStorage.removeItem('mimid_proxy_url');
    await Config.init();
});
