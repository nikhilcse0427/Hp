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
exports.deployLocalDatabase = deployLocalDatabase;
const node_crypto_1 = require("node:crypto");
const telemetryReporter_1 = __importDefault(require("../../../telemetryReporter"));
const PrismaPostgresRepository_1 = require("../PrismaPostgresRepository");
const createRemoteDatabase_1 = require("./createRemoteDatabase");
const vscode_1 = require("vscode");
const getPackageJSON_1 = require("../../../getPackageJSON");
const util_1 = require("../../../util");
function deployLocalDatabase(options) {
    return __awaiter(this, void 0, void 0, function* () {
        const { args, context, ppgRepository } = options;
        const packageJson = (0, getPackageJSON_1.getPackageJSON)(context);
        const telemetryReporter = new telemetryReporter_1.default(`prisma.${packageJson.name || 'prisma-unknown'}.dev`, packageJson.version || '0.0.0');
        try {
            const { name } = PrismaPostgresRepository_1.LocalDatabaseSchema.parse(args);
            const attemptEventId = (0, node_crypto_1.randomUUID)();
            const isDebugOrTest = (0, util_1.isDebugOrTestSession)();
            if (!isDebugOrTest) {
                void telemetryReporter
                    .sendTelemetryEvent({
                    check_if_update_available: false,
                    command: 'deploy-to-ppg-attempt',
                    client_event_id: attemptEventId,
                    information: JSON.stringify({
                        name,
                    }),
                })
                    .catch(() => {
                    // noop
                });
            }
            const database = yield ppgRepository.getLocalDatabase({ name });
            if (database === null || database === void 0 ? void 0 : database.running) {
                const confirmation = yield vscode_1.window.showInformationMessage('To deploy your local Prisma Postgres database, you will need to stop the database first. Proceed?', { modal: true }, 'Yes');
                if (confirmation !== 'Yes') {
                    void vscode_1.window.showInformationMessage('Deployment cancelled.');
                    return;
                }
            }
            const createdDb = yield (0, createRemoteDatabase_1.createRemoteDatabaseSafely)(ppgRepository, undefined, { skipRefresh: true });
            if ((createdDb === null || createdDb === void 0 ? void 0 : createdDb.database) === undefined) {
                throw new Error('Unexpected error, no database was returned');
            }
            const { database: { connectionString }, project: { workspaceId, id: projectId }, } = createdDb;
            yield vscode_1.window.withProgress({
                location: vscode_1.ProgressLocation.Notification,
                title: `Deploying remote database...`,
            }, () => ppgRepository.deployLocalDatabase({ name, url: connectionString, projectId, workspaceId }));
            if (!isDebugOrTest) {
                void telemetryReporter
                    .sendTelemetryEvent({
                    check_if_update_available: false,
                    client_event_id: (0, node_crypto_1.randomUUID)(),
                    command: 'deploy-to-ppg-success',
                    information: JSON.stringify({
                        name,
                        projectId,
                        workspaceId,
                    }),
                    previous_client_event_id: attemptEventId,
                })
                    .catch(() => {
                    // noop
                });
            }
            void vscode_1.window.showInformationMessage('Deployment was successful!');
        }
        finally {
            telemetryReporter.dispose();
        }
    });
}
//# sourceMappingURL=deployLocalDatabase.js.map