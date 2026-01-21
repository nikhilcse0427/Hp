"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.openFileAndRevealLine = exports.openAnchorList = exports.goToNextAnchor = exports.goToPreviousAnchor = exports.exportAnchors = exports.openTagListPanel = exports.toggleVisibilitySetting = exports.launchWorkspaceScan = exports.parseCurrentAnchors = void 0;
const node_fs_1 = require("node:fs");
const extension_1 = require("./extension");
const vscode_1 = require("vscode");
const exporting_1 = require("./util/exporting");
/**
 * Reparse anchors in the current file
 */
function parseCurrentAnchors() {
    if (!vscode_1.window.activeTextEditor)
        return;
    extension_1.anchorEngine.parse(vscode_1.window.activeTextEditor.document.uri);
}
exports.parseCurrentAnchors = parseCurrentAnchors;
/**
 * Luanch the workspace scan
 */
function launchWorkspaceScan() {
    extension_1.anchorEngine.initiateWorkspaceScan();
}
exports.launchWorkspaceScan = launchWorkspaceScan;
/**
 * Toggles the visibility of comment anchors
 */
function toggleVisibilitySetting() {
    const config = vscode_1.workspace.getConfiguration("commentAnchors");
    config.update("tagHighlights.enabled", !config.tagHighlights.enabled);
}
exports.toggleVisibilitySetting = toggleVisibilitySetting;
/**
 * Display a full list of registered anchors
 */
function openTagListPanel() {
    extension_1.anchorEngine.openTagListPanel();
}
exports.openTagListPanel = openTagListPanel;
/**
 * Export anchors to a file
 */
async function exportAnchors() {
    const uri = await vscode_1.window.showSaveDialog({
        title: 'Comment Anchors export',
        saveLabel: 'Export',
        filters: {
            'Table format': ['csv'],
            'JSON format': ['json']
        }
    });
    if (!uri)
        return;
    const extIndex = uri.path.lastIndexOf('.');
    const extension = uri.path.slice(Math.max(0, extIndex + 1));
    let exportText = '';
    if (extension == 'csv') {
        exportText = (0, exporting_1.createTableExport)();
    }
    else {
        exportText = (0, exporting_1.createJSONExport)();
    }
    (0, node_fs_1.writeFileSync)(uri.fsPath, exportText);
}
exports.exportAnchors = exportAnchors;
/**
 * Go to the previous anchor relative to the cursor
 */
function goToPreviousAnchor() {
    extension_1.anchorEngine.jumpToRelativeAnchor('up');
}
exports.goToPreviousAnchor = goToPreviousAnchor;
/**
 * Go to the next anchor relative to the cursor
 */
function goToNextAnchor() {
    extension_1.anchorEngine.jumpToRelativeAnchor('down');
}
exports.goToNextAnchor = goToNextAnchor;
/**
 * Open a list of anchors to jump to
 */
function openAnchorList() {
    const anchors = extension_1.anchorEngine.currentAnchors.map(anchor => ({
        label: anchor.anchorText,
        detail: 'Line ' + anchor.lineNumber,
        anchor: anchor
    }));
    if (anchors.length === 0) {
        vscode_1.window.showInformationMessage('No anchors found in this file');
        return;
    }
    vscode_1.window.showQuickPick(anchors, {
        title: 'Navigate to anchor'
    }).then(result => {
        if (result) {
            extension_1.anchorEngine.jumpToAnchor(result.anchor);
        }
    });
}
exports.openAnchorList = openAnchorList;
/**
 * Opens a file and reveales the given line number
 */
function openFileAndRevealLine(options) {
    if (!options)
        return;
    function scrollAndMove() {
        vscode_1.commands.executeCommand("revealLine", {
            lineNumber: options.lineNumber,
            at: options.at,
        });
        // Move cursor to anchor position
        if (vscode_1.window.activeTextEditor != undefined) {
            const pos = new vscode_1.Position(options.lineNumber, 0);
            vscode_1.window.activeTextEditor.selection = new vscode_1.Selection(pos, pos);
        }
    }
    // Either open right away or wait for the document to open
    if (vscode_1.window.activeTextEditor && vscode_1.window.activeTextEditor.document.uri == options.uri) {
        scrollAndMove();
    }
    else {
        vscode_1.workspace.openTextDocument(options.uri).then((doc) => {
            vscode_1.window.showTextDocument(doc).then(() => {
                scrollAndMove();
            });
        });
    }
}
exports.openFileAndRevealLine = openFileAndRevealLine;
//# sourceMappingURL=commands.js.map