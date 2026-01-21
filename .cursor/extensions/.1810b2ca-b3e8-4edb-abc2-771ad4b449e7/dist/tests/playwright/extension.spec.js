"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_path_1 = __importDefault(require("node:path"));
const test_1 = require("@playwright/test");
const vscode_setup_1 = require("./utils/vscode-setup");
const page_helper_1 = require("./utils/page-helper");
const constants_1 = require("./utils/constants");
let electronApp;
const rootPath = node_path_1.default.resolve(__dirname, '../../');
const testWorkspace = node_path_1.default.join(__dirname, '../fixtures/test-workspace');
test_1.test.beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
    electronApp = yield (0, vscode_setup_1.setupVSCode)({
        rootPath,
        testWorkspace,
        disableExtensions: true,
        timeout: constants_1.TIMEOUTS.VSCODE_LAUNCH,
    });
}));
(0, test_1.test)('launches VS Code with Prisma extension', () => __awaiter(void 0, void 0, void 0, function* () {
    yield page_helper_1.VSCodePageHelper.create(electronApp);
}));
(0, test_1.test)('can execute Prisma: Launch Prisma Studio command', () => __awaiter(void 0, void 0, void 0, function* () {
    const helper = yield page_helper_1.VSCodePageHelper.create(electronApp);
    // Execute the command with a fake database URL
    yield helper.executeCommandWithInput(constants_1.COMMANDS.LAUNCH_PRISMA_STUDIO, constants_1.TEST_DATA.FAKE_DATABASE_URL);
    // Wait for Studio tab to open
    const studioTabOpened = yield helper.waitForStudioTab();
    (0, test_1.expect)(studioTabOpened).toBe(true);
    // Verify that the Studio tab is actually present
    const hasStudioTab = yield helper.checkForStudioTab();
    (0, test_1.expect)(hasStudioTab).toBe(true);
    // Verify that there's a webview element (Studio runs in a webview)
    const hasWebview = yield helper.checkForWebview();
    (0, test_1.expect)(hasWebview).toBe(true);
}));
(0, test_1.test)('loads Prisma schema file in workspace', () => __awaiter(void 0, void 0, void 0, function* () {
    const helper = yield page_helper_1.VSCodePageHelper.create(electronApp);
    yield helper.openFile('schema.prisma');
    const cleanContent = yield helper.getCleanEditorContent();
    // Check for key Prisma schema elements using regex for flexible matching
    (0, test_1.expect)(cleanContent).toMatch(/generator\s+client/);
    (0, test_1.expect)(cleanContent).toMatch(/datasource\s+db/);
    (0, test_1.expect)(cleanContent).toMatch(/model\s+User/);
    (0, test_1.expect)(cleanContent).toMatch(/model\s+Post/);
}));
test_1.test.afterEach(() => __awaiter(void 0, void 0, void 0, function* () {
    if (electronApp) {
        yield electronApp.close();
    }
}));
//# sourceMappingURL=extension.spec.js.map