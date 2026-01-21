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
exports.startStudioServer = startStudioServer;
const vscode_1 = require("vscode");
const hono_1 = require("hono");
const cors_1 = require("hono/cors");
const path_1 = __importDefault(require("path"));
const promises_1 = require("fs/promises");
const get_port_1 = __importDefault(require("get-port"));
const node_server_1 = require("@hono/node-server");
const accelerate_1 = require("@prisma/studio-core-licensed/data/accelerate");
const bff_1 = require("@prisma/studio-core-licensed/data/bff");
const util_1 = require("../../../../util");
/**
 * Starts a local server for Prisma Studio and serves the UI files.
 * @param args - An object containing the static files root URI.
 * @returns The URL of the running server.
 */
function startStudioServer(args) {
    return __awaiter(this, void 0, void 0, function* () {
        const { database, dbUrl, context, telemetryReporter } = args;
        const staticFilesPath = ['node_modules', '@prisma', 'studio-core-licensed'];
        const staticFilesRoot = vscode_1.Uri.joinPath(context.extensionUri, ...staticFilesPath);
        const app = new hono_1.Hono();
        app.use('*', (0, cors_1.cors)());
        // gives access to accelerate (and more soon) via bff client
        app.post('/bff', (ctx) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            const { query } = (yield ctx.req.json());
            const [error, results] = yield (0, accelerate_1.createAccelerateHttpClient)({
                host: new URL(dbUrl).host,
                apiKey: (_a = new URL(dbUrl).searchParams.get('api_key')) !== null && _a !== void 0 ? _a : '',
                // TODO: these need to be dynamic based on the vscode build
                engineHash: '9b628578b3b7cae625e8c927178f15a170e74a9c',
                clientVersion: '6.10.1',
                provider: 'postgres',
            }).execute(query);
            if (error) {
                return ctx.json([(0, bff_1.serializeError)(error)]);
            }
            return ctx.json([null, results]);
        }));
        const commonInformation = {
            ppg: !database
                ? {
                    databaseId: null,
                    name: null,
                    projectId: null,
                    type: dbUrl.includes('localhost') ? 'local' : 'remote',
                    workspaceId: null,
                }
                : database.type === 'local'
                    ? {
                        databaseId: null,
                        name: database.name,
                        projectId: null,
                        type: 'local',
                        workspaceId: null,
                    }
                    : {
                        databaseId: database.databaseId,
                        name: null,
                        projectId: database.projectId,
                        type: 'remote',
                        workspaceId: database.workspaceId,
                    },
            vscode: { machineId: vscode_1.env.machineId, sessionId: vscode_1.env.sessionId },
        };
        app.post('/telemetry', (ctx) => __awaiter(this, void 0, void 0, function* () {
            const { eventId, name, payload, timestamp } = yield ctx.req.json();
            if ((0, util_1.isDebugOrTestSession)() || name !== 'studio_launched') {
                return ctx.body(null, 204);
            }
            void telemetryReporter
                .sendTelemetryEvent({
                check_if_update_available: false,
                client_event_id: eventId,
                command: name,
                information: JSON.stringify(Object.assign(Object.assign({}, commonInformation), { eventPayload: payload })),
                local_timestamp: timestamp,
            })
                .catch(() => {
                // noop
            });
            return ctx.body(null, 204);
        }));
        // gives access to client side rendering resources
        app.get('/*', (ctx) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            const reqPath = ctx.req.path.substring(1);
            const filePath = path_1.default.join(staticFilesRoot.path, reqPath);
            const fileExt = path_1.default.extname(filePath).toLowerCase();
            const contentTypeMap = {
                '.css': 'text/css',
                '.js': 'application/javascript',
                '.mjs': 'application/javascript',
                '.html': 'text/html',
                '.htm': 'text/html',
                '.json': 'application/json',
                '.png': 'image/png',
                '.jpg': 'image/jpeg',
                '.jpeg': 'image/jpeg',
                '.gif': 'image/gif',
                '.svg': 'image/svg+xml',
            };
            const contentType = (_a = contentTypeMap[fileExt]) !== null && _a !== void 0 ? _a : 'application/octet-stream';
            try {
                return ctx.body(yield (0, promises_1.readFile)(filePath), 200, { 'Content-Type': contentType });
            }
            catch (error) {
                return ctx.text('File not found', 404);
            }
        }));
        const port = yield (0, get_port_1.default)();
        const serverUrl = `http://localhost:${port}`;
        const server = (0, node_server_1.serve)({ fetch: app.fetch, port, overrideGlobalObjects: false }, () => {
            console.log(`Studio server is running at ${serverUrl}`);
        });
        return { server, url: serverUrl };
    });
}
//# sourceMappingURL=startStudioServer.js.map