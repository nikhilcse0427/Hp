"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const entryBase_1 = __importDefault(require("./entryBase"));
const path = __importStar(require("node:path"));
/**
 * Represents a workspace file holding one or more anchors
 */
class EntryCachedFile extends entryBase_1.default {
    file;
    anchors;
    format;
    constructor(engine, file, anchors, format) {
        super(engine, EntryCachedFile.fileAnchorStats(file, anchors, format), vscode_1.TreeItemCollapsibleState.Expanded);
        this.file = file;
        this.anchors = anchors;
        this.format = format;
        this.tooltip = `${this.file.path}`;
        this.iconPath = vscode_1.ThemeIcon.File;
    }
    contextValue = "cachedFile";
    toString() {
        return this.label;
    }
    /**
     * Formats a file stats string using the given anchors array
     */
    static fileAnchorStats(file, anchors, format) {
        let visible = 0;
        let hidden = 0;
        for (const anchor of anchors) {
            if (anchor.isVisibleInWorkspace) {
                visible++;
            }
            else {
                hidden++;
            }
        }
        let ret = visible + " Anchors";
        if (hidden > 0) {
            ret += ", " + hidden + " Hidden";
        }
        let title = " (" + ret + ")";
        let titlePath;
        const root = vscode_1.workspace.getWorkspaceFolder(file) || vscode_1.workspace.workspaceFolders[0];
        if (root) {
            titlePath = path.relative(root.uri.path, file.path);
        }
        else {
            titlePath = file.path;
        }
        // Verify relativity
        if (titlePath.startsWith("..")) {
            throw new Error("Cannot crate cached file for external documents");
        }
        // Always use unix style separators
        titlePath = titlePath.replaceAll('\\', "/");
        // Tweak the path format based on settings
        if (format == "hidden") {
            title = titlePath.slice(titlePath.lastIndexOf("/") + 1);
        }
        else if (format == "abbreviated") {
            const segments = titlePath.split("/");
            const abbrPath = segments
                .map((segment, i) => {
                if (i < segments.length - 1 && i > 0) {
                    return segment[0];
                }
                else {
                    return segment;
                }
            })
                .join("/");
            title = abbrPath + title;
        }
        else {
            title = titlePath + title;
        }
        if (vscode_1.workspace.workspaceFolders.length > 1) {
            let ws = root.name;
            if (ws.length > 12) {
                ws = ws.slice(0, 12) + "…";
            }
            title = ws + " → " + title;
        }
        return title;
    }
}
exports.default = EntryCachedFile;
//# sourceMappingURL=entryCachedFile.js.map