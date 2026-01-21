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
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const path = __importStar(require("node:path"));
/**
 * Base class extended by all implementions of a TreeItem
 * which represent an entity in the anchor panel.
 */
class EntryBase extends vscode_1.TreeItem {
    engine;
    constructor(engine, label, state) {
        super(label, state);
        this.engine = engine;
    }
    /**
     * Load an svg of the given name from the resource directory
     *
     * @param name Icon name
     * @returns The path
     */
    loadResourceSvg(name) {
        return path.join(__dirname, "../../res", name + ".svg");
    }
    /**
     * Load an svg of the given color from the resource directory.
     * The icon must be generated first.
     *
     * @param name Icon color
     * @returns The path
     */
    loadCacheSvg(color) {
        return path.join(this.engine.iconCache, "anchor_" + color + ".svg");
    }
}
exports.default = EntryBase;
//# sourceMappingURL=entryBase.js.map