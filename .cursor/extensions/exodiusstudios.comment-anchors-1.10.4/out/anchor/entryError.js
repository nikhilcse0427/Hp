"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const entryBase_1 = __importDefault(require("./entryBase"));
/**
 * Represents a caught error
 */
class EntryError extends entryBase_1.default {
    message;
    constructor(engine, message) {
        super(engine, message, vscode_1.TreeItemCollapsibleState.None);
        this.message = message;
        this.tooltip = this.message;
        this.iconPath = {
            light: this.loadResourceSvg("cross"),
            dark: this.loadResourceSvg("cross"),
        };
    }
    toString() {
        return "EntryError{}";
    }
    contextValue = "error";
}
exports.default = EntryError;
//# sourceMappingURL=entryError.js.map