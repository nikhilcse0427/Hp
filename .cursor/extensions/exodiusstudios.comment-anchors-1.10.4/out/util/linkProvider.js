"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LinkProvider = void 0;
const vscode_1 = require("vscode");
const node_path_1 = require("node:path");
const flattener_1 = require("./flattener");
const node_fs_1 = require("node:fs");
const LINK_REGEX = /^(\.{1,2}[/\\])?([^#:]+)?(:\d+|#[\w-]+)?$/;
class LinkProvider {
    engine;
    constructor(engine) {
        this.engine = engine;
    }
    createTarget(uri, line) {
        return vscode_1.Uri.parse(`file://${uri.path}#${line}`);
    }
    provideDocumentLinks(document, _token) {
        if (document.uri.scheme == "output") {
            return [];
        }
        const index = this.engine.anchorMaps.get(document.uri);
        const list = [];
        if (!index) {
            return [];
        }
        const flattened = (0, flattener_1.flattenAnchors)(index.anchorTree);
        const basePath = (0, node_path_1.join)(document.uri.fsPath, "..");
        const workspacePath = vscode_1.workspace.getWorkspaceFolder(document.uri)?.uri?.fsPath ?? "";
        const tasks = [];
        const flattenedLinks = flattened
            .filter((anchor) => {
            const tagId = anchor.anchorTag;
            const tag = this.engine.tags.get(tagId);
            return tag?.behavior == "link";
        });
        for (const anchor of flattenedLinks) {
            const components = LINK_REGEX.exec(anchor.anchorText);
            const parameter = components[3] || '';
            const filePath = components[2] || document?.uri?.fsPath || '';
            const relativeFolder = components[1];
            const fullPath = relativeFolder ? (0, node_path_1.resolve)(basePath, relativeFolder, filePath) : (0, node_path_1.resolve)(workspacePath, filePath);
            const fileUri = vscode_1.Uri.file(fullPath);
            if (!(0, node_fs_1.existsSync)(fullPath) || !(0, node_fs_1.lstatSync)(fullPath).isFile()) {
                continue;
            }
            const anchorRange = anchor.getAnchorRange(document, true);
            let docLink;
            let task;
            if (parameter.startsWith(":")) {
                const lineNumber = Number.parseInt(parameter.slice(1));
                const targetURI = this.createTarget(fileUri, lineNumber);
                docLink = new vscode_1.DocumentLink(anchorRange, targetURI);
                docLink.tooltip = "Click here to open file at line " + (lineNumber + 1);
                task = Promise.resolve();
            }
            else {
                if (parameter.startsWith("#")) {
                    const targetId = parameter.slice(1);
                    task = this.engine.getAnchors(fileUri).then((anchors) => {
                        const flattened = (0, flattener_1.flattenAnchors)(anchors);
                        let targetLine = 0;
                        for (const otherAnchor of flattened) {
                            if (otherAnchor.attributes.id == targetId) {
                                targetLine = otherAnchor.lineNumber;
                                break;
                            }
                        }
                        const targetURI = this.createTarget(fileUri, targetLine);
                        if (fileUri.path == vscode_1.window.activeTextEditor?.document?.uri?.path) {
                            docLink = new vscode_1.DocumentLink(anchorRange, targetURI);
                            docLink.tooltip = "Click here to go to anchor " + targetId;
                        }
                        else {
                            docLink = new vscode_1.DocumentLink(anchorRange, targetURI);
                            docLink.tooltip = "Click here to open file at anchor " + targetId;
                        }
                    });
                }
                else {
                    docLink = new vscode_1.DocumentLink(anchorRange, fileUri);
                    docLink.tooltip = "Click here to open file";
                    task = Promise.resolve();
                }
            }
            const completion = task.then(() => {
                list.push(docLink);
            });
            tasks.push(completion);
        }
        return Promise.all(tasks).then(() => {
            return list;
        });
    }
}
exports.LinkProvider = LinkProvider;
//# sourceMappingURL=linkProvider.js.map