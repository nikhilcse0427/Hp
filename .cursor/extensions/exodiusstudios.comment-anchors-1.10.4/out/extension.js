"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = exports.anchorEngine = void 0;
const vscode_1 = require("vscode");
const anchorEngine_1 = require("./anchorEngine");
const commands_1 = require("./commands");
function activate(context) {
    exports.anchorEngine = new anchorEngine_1.AnchorEngine(context);
    // Register extension commands
    vscode_1.commands.registerCommand("commentAnchors.parse", commands_1.parseCurrentAnchors);
    vscode_1.commands.registerCommand("commentAnchors.toggle", commands_1.toggleVisibilitySetting);
    vscode_1.commands.registerCommand("commentAnchors.openFileAndRevealLine", commands_1.openFileAndRevealLine);
    vscode_1.commands.registerCommand("commentAnchors.launchWorkspaceScan", commands_1.launchWorkspaceScan);
    vscode_1.commands.registerCommand("commentAnchors.exportAnchors", commands_1.exportAnchors);
    vscode_1.commands.registerCommand("commentAnchors.listTags", commands_1.openTagListPanel);
    vscode_1.commands.registerCommand("commentAnchors.previousAnchor", commands_1.goToPreviousAnchor);
    vscode_1.commands.registerCommand("commentAnchors.nextAnchor", commands_1.goToNextAnchor);
    vscode_1.commands.registerCommand("commentAnchors.navigateToAnchor", commands_1.openAnchorList);
}
exports.activate = activate;
function deactivate() {
    exports.anchorEngine.dispose();
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map