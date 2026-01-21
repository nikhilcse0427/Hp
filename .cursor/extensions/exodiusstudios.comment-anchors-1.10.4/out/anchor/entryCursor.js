"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const entryBase_1 = __importDefault(require("./entryBase"));
/**
 * Represents the current cursor
 */
class EntryCursor extends entryBase_1.default {
    constructor(engine, line) {
        super(engine, `➤ Cursor (line ${line})`, vscode_1.TreeItemCollapsibleState.None);
        this.tooltip = this.label;
        this.iconPath = {
            light: this.loadResourceSvg("cursor"),
            dark: this.loadResourceSvg("cursor"),
        };
    }
    toString() {
        return "EntryCursor{}";
    }
    contextValue = "cursor";
}
exports.default = EntryCursor;
//# sourceMappingURL=entryCursor.js.map