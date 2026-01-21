"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const entryBase_1 = __importDefault(require("./entryBase"));
/**
 * Represents a pending workspace scan
 */
class EntryScan extends entryBase_1.default {
    constructor(engine) {
        super(engine, "Click to start scanning", vscode_1.TreeItemCollapsibleState.None);
        this.tooltip = this.label;
        this.iconPath = {
            light: this.loadResourceSvg("launch"),
            dark: this.loadResourceSvg("launch"),
        };
        this.command = {
            title: "Initiate scan",
            command: "commentAnchors.launchWorkspaceScan",
        };
    }
    contextValue = "launch";
    toString() {
        return "EntryLaunch{}";
    }
}
exports.default = EntryScan;
//# sourceMappingURL=entryScan.js.map