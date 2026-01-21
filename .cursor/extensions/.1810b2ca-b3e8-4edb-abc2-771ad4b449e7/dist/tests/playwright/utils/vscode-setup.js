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
exports.setupVSCode = setupVSCode;
const node_path_1 = __importDefault(require("node:path"));
const test_electron_1 = require("@vscode/test-electron");
const test_1 = require("@playwright/test");
function setupVSCode(options) {
    return __awaiter(this, void 0, void 0, function* () {
        const { rootPath, testWorkspace, disableExtensions = true, timeout = 30000 } = options;
        const executablePath = yield (0, test_electron_1.downloadAndUnzipVSCode)();
        const args = [
            '--extensionDevelopmentPath=' + rootPath,
            ...(disableExtensions ? ['--disable-extensions'] : []),
            '--disable-workspace-trust',
            '--skip-welcome',
            '--skip-release-notes',
            '--no-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--user-data-dir=' + node_path_1.default.join(__dirname, '../tmp/user-data'),
            '--wait',
            testWorkspace,
        ];
        const electronApp = yield test_1._electron.launch({
            executablePath,
            args,
            timeout,
        });
        return electronApp;
    });
}
//# sourceMappingURL=vscode-setup.js.map