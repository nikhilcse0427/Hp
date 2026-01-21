"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.openNewStudioTab = openNewStudioTab;
const vscode_1 = require("vscode");
const getStudioPageHtml_1 = require("./getStudioPageHtml");
const startStudioServer_1 = require("./startStudioServer");
const telemetryReporter_1 = __importDefault(require("../../../../telemetryReporter"));
const getPackageJSON_1 = require("../../../../getPackageJSON");
/**
 * Opens Prisma Studio in a webview panel.
 * @param args - An object containing the database URL and extension context.
 */
function openNewStudioTab(args) {
    return __awaiter(this, void 0, void 0, function* () {
        const { context } = args;
        const packageJSON = (0, getPackageJSON_1.getPackageJSON)(context);
        const telemetryReporter = new telemetryReporter_1.default(`prisma.${packageJSON.name || 'prisma-unknown'}.studio`, packageJSON.version || '0.0.0');
        const { server, url } = yield (0, startStudioServer_1.startStudioServer)(Object.assign(Object.assign({}, args), { telemetryReporter }));
        const panel = vscode_1.window.createWebviewPanel('studio', 'Studio', vscode_1.ViewColumn.One, {
            enableScripts: true,
            retainContextWhenHidden: true,
        });
        panel.webview.html = (0, getStudioPageHtml_1.getStudioPageHtml)({ serverUrl: url });
        panel.onDidDispose(() => {
            server.close();
            console.log(`Studio server has been closed (${url})`);
            telemetryReporter.dispose();
        });
    });
}
//# sourceMappingURL=openNewStudioTab.js.map