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
Object.defineProperty(exports, "__esModule", { value: true });
exports.VSCodePageHelper = void 0;
const constants_1 = require("./constants");
class VSCodePageHelper {
    constructor(page, timeouts = {}) {
        this.page = page;
        this.timeouts = {
            workbench: timeouts.workbench || constants_1.TIMEOUTS.DEFAULT_WORKBENCH,
            commandPalette: timeouts.commandPalette || constants_1.TIMEOUTS.DEFAULT_COMMAND_PALETTE,
            fileExplorer: timeouts.fileExplorer || constants_1.TIMEOUTS.DEFAULT_FILE_EXPLORER,
            editor: timeouts.editor || constants_1.TIMEOUTS.DEFAULT_EDITOR,
        };
    }
    static create(electronApp, timeouts) {
        return __awaiter(this, void 0, void 0, function* () {
            const page = yield electronApp.firstWindow();
            const helper = new VSCodePageHelper(page, timeouts);
            yield helper.waitForWorkbench();
            return helper;
        });
    }
    waitForWorkbench() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.page.waitForLoadState('domcontentloaded');
            yield this.page.waitForTimeout(constants_1.WAIT_TIMES.DOM_LOAD);
            yield this.page.waitForSelector(constants_1.SELECTORS.WORKBENCH, { timeout: this.timeouts.workbench });
        });
    }
    openCommandPalette() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.page.keyboard.press(constants_1.KEYBOARD_SHORTCUTS.COMMAND_PALETTE);
            yield this.page.waitForSelector(constants_1.SELECTORS.COMMAND_PALETTE, { timeout: this.timeouts.commandPalette });
        });
    }
    executeCommand(commandName) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.openCommandPalette();
            yield this.page.keyboard.type(commandName);
            yield this.page.waitForTimeout(constants_1.WAIT_TIMES.COMMAND_APPEAR);
            const commandItems = yield this.page.$$(constants_1.SELECTORS.COMMAND_ITEM);
            if (commandItems.length === 0) {
                throw new Error(`No commands found for: ${commandName}`);
            }
            const firstCommand = yield commandItems[0].textContent();
            if (!(firstCommand === null || firstCommand === void 0 ? void 0 : firstCommand.includes(commandName))) {
                throw new Error(`Expected command "${commandName}" but found "${firstCommand}"`);
            }
            yield this.page.keyboard.press('Enter');
            yield this.page.waitForTimeout(constants_1.WAIT_TIMES.COMMAND_EXECUTION);
        });
    }
    executeCommandWithInput(commandName, inputValue) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.executeCommand(commandName);
            // Wait for input dialog to appear
            yield this.page.waitForSelector(constants_1.SELECTORS.INPUT_BOX, { timeout: this.timeouts.commandPalette });
            // Type the input value
            yield this.page.fill(constants_1.SELECTORS.INPUT_BOX, inputValue);
            yield this.page.waitForTimeout(constants_1.WAIT_TIMES.INPUT_RESPONSE);
            // Press Enter to submit
            yield this.page.keyboard.press(constants_1.KEYBOARD_SHORTCUTS.ENTER);
            yield this.page.waitForTimeout(constants_1.WAIT_TIMES.STUDIO_LAUNCH);
        });
    }
    waitForStudioTab() {
        return __awaiter(this, arguments, void 0, function* (timeout = 10000) {
            try {
                yield this.page.waitForSelector(constants_1.SELECTORS.STUDIO_TAB, { timeout });
                return true;
            }
            catch (_a) {
                return false;
            }
        });
    }
    checkForStudioTab() {
        return __awaiter(this, void 0, void 0, function* () {
            // Check if there's a Studio tab opened
            const studioTab = yield this.page.$(constants_1.SELECTORS.STUDIO_TAB);
            return studioTab !== null;
        });
    }
    checkForWebview() {
        return __awaiter(this, void 0, void 0, function* () {
            // Check if there's a webview element (which Studio uses)
            const webview = yield this.page.$(constants_1.SELECTORS.WEBVIEW);
            return webview !== null;
        });
    }
    openFileExplorer() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.page.keyboard.press(constants_1.KEYBOARD_SHORTCUTS.FILE_EXPLORER);
            yield this.page.waitForTimeout(constants_1.WAIT_TIMES.EXPLORER_TOGGLE);
        });
    }
    openFile(filename) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.openFileExplorer();
            // Verify the file is visible in explorer
            const explorerContent = yield this.page.textContent(constants_1.SELECTORS.EXPLORER);
            if (!(explorerContent === null || explorerContent === void 0 ? void 0 : explorerContent.includes(filename))) {
                throw new Error(`File "${filename}" not found in explorer`);
            }
            // Open the file
            yield this.page.click(`text=${filename}`);
            yield this.page.waitForTimeout(constants_1.WAIT_TIMES.FILE_OPEN);
        });
    }
    getEditorContent() {
        return __awaiter(this, void 0, void 0, function* () {
            const editorContent = yield this.page.textContent(constants_1.SELECTORS.EDITOR);
            if (!editorContent) {
                throw new Error('No editor content found');
            }
            return editorContent;
        });
    }
    getCleanEditorContent() {
        return __awaiter(this, void 0, void 0, function* () {
            const content = yield this.getEditorContent();
            // Remove line numbers and extra whitespace
            return content.replace(/^\d+/gm, '').trim();
        });
    }
}
exports.VSCodePageHelper = VSCodePageHelper;
//# sourceMappingURL=page-helper.js.map