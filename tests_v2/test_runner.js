/**
 * Simple Test Runner for Mimid
 * Organizes and executes test scripts in the browser console or node environment.
 */
const TestRunner = {
    tests: [],

    add(name, fn) {
        this.tests.push({ name, fn });
    },

    async run() {
        console.log("%c Starting Mimid Test Suite... ", "background: #222; color: #bada55; font-size: 1.2rem;");
        let passed = 0;
        let failed = 0;

        for (const test of this.tests) {
            try {
                console.log(`%c [RUNNING] %c ${test.name}`, "color: #3b82f6; font-weight: bold;", "color: inherit;");
                await test.fn();
                console.log(`%c [PASSED] %c ${test.name}`, "color: #10b981; font-weight: bold;", "color: inherit;");
                passed++;
            } catch (e) {
                console.error(`%c [FAILED] %c ${test.name}`, "color: #ef4444; font-weight: bold;", "color: inherit;");
                console.error(e);
                failed++;
            }
        }

        console.log(`%c Test Results: ${passed} Passed, ${failed} Failed `, "background: #333; color: white; padding: 4px; border-radius: 4px;");
    },

    assert(condition, message) {
        if (!condition) throw new Error(`Assertion Failed: ${message}`);
    }
};

window.TestRunner = TestRunner;
