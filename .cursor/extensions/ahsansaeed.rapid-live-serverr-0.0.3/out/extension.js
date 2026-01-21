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
exports.deactivate = exports.activate = void 0;
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const fs_1 = __importDefault(require("fs"));
function activate(context) {
    const disposable = vscode.commands.registerCommand('extension.runHtmlOnServer', () => {
        runServer(context);
    });
    context.subscriptions.push(disposable);
}
exports.activate = activate;
function runServer(context) {
    const app = (0, express_1.default)();
    const port = 3001;
    773;
    // Use the extension's directory as the static content root
    app.use(express_1.default.static(context.extensionPath));
    app.use((0, cors_1.default)());
    app.get('/', (req, res) => {
        // Get the currently active text editor
        const activeEditor = vscode.window.activeTextEditor;
        if (activeEditor) {
            // Get the file path of the currently active file
            const filePath = activeEditor.document.fileName;
            // Check if the file has a valid extension (html or php)
            const validExtensions = ['.html', '.php',];
            const fileExtension = path.extname(filePath);
            if (validExtensions.includes(fileExtension)) {
                // Read the content of the file
                const fileContent = fs_1.default.readFileSync(filePath, 'utf-8');
                // If it's a PHP file, you may want to process it through a PHP interpreter
                if (fileExtension === '.php') {
                    // Assuming you have PHP installed on your machine
                    // You can modify this command based on your PHP installation
                    const phpCommand = `php -r "echo file_get_contents('${filePath}');"`;
                    const phpContent = require('child_process').execSync(phpCommand).toString();
                    // Add the auto-refresh meta tag
                    const modifiedContent = addAutoRefreshMetaTag(phpContent);
                    res.send(modifiedContent);
                }
                else {
                    // For HTML files, directly add the auto-refresh meta tag
                    const modifiedContent = addAutoRefreshMetaTag(fileContent);
                    res.send(modifiedContent);
                }
            }
            else {
                res.status(404).send('Invalid file type');
            }
        }
        else {
            res.status(404).send('No active file');
        }
    });
    const server = app.listen(port, () => {
        console.log(`Server is running at http://localhost:${port}`);
    });
    vscode.window.showInformationMessage(`Server is running at http://localhost:${port}`);
}
function addAutoRefreshMetaTag(htmlContent) {
    // Add the meta tag for auto-refresh every 3 seconds
    const autoRefreshMetaTag = '<meta http-equiv="refresh" content="3">';
    // Find the opening <head> tag in the HTML content
    const headTagIndex = htmlContent.indexOf('<head>');
    if (headTagIndex !== -1) {
        // Insert the auto-refresh meta tag after the opening <head> tag
        return htmlContent.slice(0, headTagIndex + '<head>'.length) + autoRefreshMetaTag + htmlContent.slice(headTagIndex + '<head>'.length);
    }
    else {
        // If <head> tag is not found, just prepend the auto-refresh meta tag to the content
        return autoRefreshMetaTag + htmlContent;
    }
}
function deactivate() {
    // Clean up resources on extension deactivation if needed
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map