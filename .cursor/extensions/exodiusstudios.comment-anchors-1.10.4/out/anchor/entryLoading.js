"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const entryBase_1 = __importDefault(require("./entryBase"));
/**
 * Represents an active workspace scan
 */
class EntryLoading extends entryBase_1.default {
    constructor(engine) {
        super(engine, "Searching for anchors...", vscode_1.TreeItemCollapsibleState.None);
        this.tooltip = this.label;
        this.iconPath = {
            light: this.loadResourceSvg("load"),
            dark: this.loadResourceSvg("load"),
        };
    }
    contextValue = "loading";
    toString() {
        return "EntryLoading{}";
    }
}
exports.default = EntryLoading;
//# sourceMappingURL=entryLoading.js.map