"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EpicAnchorIntelliSenseProvider = exports.EpicAnchorProvider = void 0;
const vscode_1 = require("vscode");
const entryAnchor_1 = __importDefault(require("../anchor/entryAnchor"));
const anchorEngine_1 = require("../anchorEngine");
const entryEpic_1 = __importDefault(require("../anchor/entryEpic"));
const flattener_1 = require("../util/flattener");
/**
 * AnchorProvider implementation in charge of returning the anchors in the current workspace
 */
class EpicAnchorProvider {
    provider;
    onDidChangeTreeData;
    constructor(provider) {
        this.onDidChangeTreeData = provider._onDidChangeTreeData.event;
        this.provider = provider;
    }
    getTreeItem(element) {
        return element;
    }
    getChildren(element) {
        return new Promise((success) => {
            // The default is empty, so you have to build a tree
            if (element) {
                if (element instanceof entryAnchor_1.default && element.children) {
                    success(element.children);
                    return;
                }
                else if (element instanceof entryEpic_1.default) {
                    const res = [];
                    const epic = element;
                    anchorEngine_1.AnchorEngine.output(`this.provider._config!.tags.displayHierarchyInWorkspace: ${this.provider._config.tags.displayHierarchyInWorkspace}`);
                    if (this.provider._config.tags.displayHierarchyInWorkspace) {
                        for (const anchor of epic.anchors) {
                            if (anchor.isVisibleInWorkspace) {
                                res.push(anchor.copy(true, false));
                            }
                        }
                    }
                    else {
                        const flattened = (0, flattener_1.flattenAnchors)(epic.anchors);
                        for (const anchor of flattened) {
                            if (anchor.isVisibleInWorkspace) {
                                res.push(anchor.copy(false, false));
                            }
                        }
                    }
                    const anchors = res.sort((left, right) => {
                        return left.attributes.seq - right.attributes.seq;
                    });
                    success(anchors);
                }
                else {
                    anchorEngine_1.AnchorEngine.output("return empty array");
                    success([]);
                }
                return;
            }
            if (!this.provider._config.workspace.enabled) {
                success([this.provider.errorWorkspaceDisabled]);
                return;
            }
            else if (!vscode_1.workspace.workspaceFolders) {
                success([this.provider.errorFileOnly]);
                return;
            }
            else if (this.provider._config.workspace.lazyLoad && !this.provider.anchorsScanned) {
                success([this.provider.statusScan]);
            }
            else if (!this.provider.anchorsLoaded) {
                success([this.provider.statusLoading]);
                return;
            }
            const res = [];
            const epicMaps = new Map();
            // Build the epic entries
            for (const [_, anchorIndex] of this.provider.anchorMaps.entries()) {
                const flattened = (0, flattener_1.flattenAnchors)(anchorIndex.anchorTree);
                for (const anchor of flattened) {
                    const epic = anchor.attributes.epic;
                    if (!epic)
                        continue;
                    const anchorEpic = epicMaps.get(epic);
                    if (anchorEpic) {
                        anchorEpic.push(anchor);
                    }
                    else {
                        epicMaps.set(epic, [anchor]);
                    }
                }
            }
            // Sort and build the entry list
            for (const [epic, anchorArr] of epicMaps.entries()) {
                anchorArr.sort((left, right) => {
                    return left.attributes.seq - right.attributes.seq;
                });
                res.push(new entryEpic_1.default(epic, `${epic}`, anchorArr, this.provider));
            }
            if (res.length === 0) {
                success([this.provider.errorEmptyEpics]);
                return;
            }
            success(res);
        });
    }
}
exports.EpicAnchorProvider = EpicAnchorProvider;
class EpicAnchorIntelliSenseProvider {
    engine;
    constructor(engine) {
        this.engine = engine;
    }
    provideCompletionItems(_document, _position, _token, _context) {
        const config = this.engine._config;
        anchorEngine_1.AnchorEngine.output("provideCompletionItems");
        const keyWord = _document.getText(_document.getWordRangeAtPosition(_position.translate(0, -1)));
        const hasKeyWord = [...this.engine.tags.keys()].find((v) => v === keyWord);
        if (hasKeyWord) {
            const epicCtr = new Map();
            for (const [_, anchorIndex] of this.engine.anchorMaps.entries()) {
                for (const entryAnchor of anchorIndex.anchorTree) {
                    const { seq, epic } = entryAnchor.attributes;
                    if (epic) {
                        epicCtr.set(epic, Math.max(epicCtr.get(epic) || 0, seq));
                    }
                }
            }
            return [...epicCtr].map(([epic, maxSeq]) => new vscode_1.CompletionItem(`epic=${epic},seq=${maxSeq + config.epic.seqStep}`, vscode_1.CompletionItemKind.Enum));
        }
        return [];
    }
}
exports.EpicAnchorIntelliSenseProvider = EpicAnchorIntelliSenseProvider;
//# sourceMappingURL=epicAnchorProvider.js.map