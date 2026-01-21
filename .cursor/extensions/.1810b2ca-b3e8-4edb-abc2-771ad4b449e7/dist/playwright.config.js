"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const test_1 = require("@playwright/test");
exports.default = (0, test_1.defineConfig)({
    testDir: './tests/playwright',
    timeout: process.env.CI ? 120000 : 60000, // Longer timeout for CI
    fullyParallel: false,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: 1, // Run tests sequentially for VS Code
    reporter: process.env.CI ? [['github'], ['html']] : 'html',
    use: {
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
    },
    projects: [
        {
            name: 'vscode-extension',
            use: Object.assign({}, test_1.devices['Desktop Chrome']),
        },
    ],
});
//# sourceMappingURL=playwright.config.js.map