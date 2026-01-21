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
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaPostgresRepository = exports.LocalDatabaseSchema = exports.RemoteDatabaseSchema = exports.ProjectSchema = exports.WorkspaceSchema = void 0;
exports.isWorkspace = isWorkspace;
exports.isProject = isProject;
exports.isRemoteDatabase = isRemoteDatabase;
exports.isLocalDatabase = isLocalDatabase;
const vscode_1 = require("vscode");
const client_1 = require("./management-api/client");
const credentials_store_1 = require("@prisma/credentials-store");
const zod_1 = require("zod");
const env_paths_1 = __importDefault(require("env-paths"));
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
const waitForProcessKilled_1 = require("./utils/waitForProcessKilled");
const proxy_signals_1 = require("foreground-child/proxy-signals");
const child_process_1 = require("child_process");
const chokidar = __importStar(require("chokidar"));
const PPG_DEV_GLOBAL_ROOT = (0, env_paths_1.default)('prisma-dev');
exports.WorkspaceSchema = zod_1.z.object({
    type: zod_1.z.literal('workspace'),
    id: zod_1.z.string(),
    name: zod_1.z.string(),
});
function isWorkspace(item) {
    return exports.WorkspaceSchema.safeParse(item).success;
}
exports.ProjectSchema = zod_1.z.object({
    type: zod_1.z.literal('project'),
    id: zod_1.z.string(),
    name: zod_1.z.string(),
    workspaceId: zod_1.z.string(),
});
function isProject(item) {
    return exports.ProjectSchema.safeParse(item).success;
}
exports.RemoteDatabaseSchema = zod_1.z.object({
    type: zod_1.z.literal('remoteDatabase'),
    id: zod_1.z.string(),
    name: zod_1.z.string(),
    region: zod_1.z.string().nullable(),
    projectId: zod_1.z.string(),
    workspaceId: zod_1.z.string(),
});
function isRemoteDatabase(item) {
    return exports.RemoteDatabaseSchema.safeParse(item).success;
}
exports.LocalDatabaseSchema = zod_1.z.object({
    type: zod_1.z.literal('localDatabase'),
    id: zod_1.z.string(),
    name: zod_1.z.string(),
    url: zod_1.z.string().url(),
    pid: zod_1.z.number(),
    running: zod_1.z.boolean(),
});
function isLocalDatabase(item) {
    return exports.LocalDatabaseSchema.safeParse(item).success;
}
// Simple cache manager to handle all caching logic
class CacheManager {
    constructor() {
        this.regions = [];
        this.workspaces = new Map();
        this.projects = new Map();
        this.databases = new Map();
    }
    generateKey(workspaceId, projectId) {
        return projectId ? `${workspaceId}.${projectId}` : workspaceId;
    }
    // Workspace cache
    setWorkspaces(workspaces) {
        this.workspaces.clear();
        workspaces.forEach((w) => this.workspaces.set(w.id, w));
    }
    getWorkspaces() {
        return Array.from(this.workspaces.values());
    }
    hasWorkspaces() {
        return this.workspaces.size > 0;
    }
    removeWorkspace(workspaceId) {
        this.workspaces.delete(workspaceId);
        this.projects.delete(workspaceId);
        // Remove all databases for this workspace
        Array.from(this.databases.keys())
            .filter((key) => key.startsWith(`${workspaceId}.`))
            .forEach((key) => this.databases.delete(key));
    }
    // Project cache
    setProjects(workspaceId, projects) {
        const projectMap = new Map();
        projects.forEach((p) => projectMap.set(p.id, p));
        this.projects.set(workspaceId, projectMap);
    }
    getProjects(workspaceId) {
        var _a;
        return Array.from(((_a = this.projects.get(workspaceId)) === null || _a === void 0 ? void 0 : _a.values()) || []);
    }
    hasProjects(workspaceId) {
        return this.projects.has(workspaceId);
    }
    addProject(project) {
        if (!this.projects.has(project.workspaceId)) {
            this.projects.set(project.workspaceId, new Map());
        }
        this.projects.get(project.workspaceId).set(project.id, project);
    }
    removeProject(workspaceId, projectId) {
        var _a;
        (_a = this.projects.get(workspaceId)) === null || _a === void 0 ? void 0 : _a.delete(projectId);
        this.databases.delete(this.generateKey(workspaceId, projectId));
    }
    // Database cache
    setDatabases(workspaceId, projectId, databases) {
        const databaseMap = new Map();
        databases.forEach((db) => databaseMap.set(db.id, db));
        this.databases.set(this.generateKey(workspaceId, projectId), databaseMap);
    }
    getDatabases(workspaceId, projectId) {
        var _a;
        return Array.from(((_a = this.databases.get(this.generateKey(workspaceId, projectId))) === null || _a === void 0 ? void 0 : _a.values()) || []);
    }
    hasDatabases(workspaceId, projectId) {
        return this.databases.has(this.generateKey(workspaceId, projectId));
    }
    addDatabase(database) {
        const key = this.generateKey(database.workspaceId, database.projectId);
        if (!this.databases.has(key)) {
            this.databases.set(key, new Map());
        }
        this.databases.get(key).set(database.id, database);
    }
    removeDatabase(workspaceId, projectId, databaseId) {
        var _a;
        (_a = this.databases.get(this.generateKey(workspaceId, projectId))) === null || _a === void 0 ? void 0 : _a.delete(databaseId);
    }
    clearDatabases(workspaceId, projectId) {
        this.databases.delete(this.generateKey(workspaceId, projectId));
    }
    // Region cache
    setRegions(regions) {
        this.regions = regions;
    }
    getRegions() {
        return this.regions;
    }
    hasRegions() {
        return this.regions.length > 0;
    }
    // Local database cache
    setLocalDatabases(databases) {
        this.localDatabases = { timestamp: Date.now(), data: databases };
    }
    getLocalDatabases() {
        const now = Date.now();
        if (this.localDatabases && now - this.localDatabases.timestamp < 100) {
            return this.localDatabases.data;
        }
        return undefined;
    }
    clearAll() {
        this.workspaces.clear();
        this.projects.clear();
        this.databases.clear();
        this.regions = [];
        this.localDatabases = undefined;
    }
}
class PrismaPostgresRepository {
    constructor(auth, connectionStringStorage, context) {
        this.auth = auth;
        this.connectionStringStorage = connectionStringStorage;
        this.context = context;
        this.reloadPromise = undefined;
        this.clients = new Map();
        this.credentialsStore = new credentials_store_1.CredentialsStore();
        this.cache = new CacheManager();
        this.refreshEventEmitter = new vscode_1.EventEmitter();
        const watcher = chokidar.watch(PPG_DEV_GLOBAL_ROOT.data, {
            ignoreInitial: true,
        });
        watcher.on('addDir', () => this.refreshEventEmitter.fire());
        watcher.on('unlinkDir', () => this.refreshEventEmitter.fire());
        watcher.on('change', () => this.refreshEventEmitter.fire());
        context.subscriptions.push({ dispose: () => watcher.close() });
        // Start preloading data in the background for better UX
        this.reloadPromise = this.reloadAllData();
    }
    reloadAllData() {
        return __awaiter(this, void 0, void 0, function* () {
            // Only one reload at once
            if (this.reloadPromise) {
                return;
            }
            // Empty all the caches
            this.cache.clearAll();
            try {
                // Load the regions
                const regionsPromise = this.getRegions({ reload: true });
                // Load workspaces first
                const workspaces = yield this.getWorkspaces({ reload: true });
                // Load projects for all workspaces in parallel
                const projectPromises = workspaces.map((workspace) => __awaiter(this, void 0, void 0, function* () {
                    const projects = yield this.getProjects({ workspaceId: workspace.id, reload: true });
                    // Load databases for all projects in parallel
                    const databasePromises = projects.map((project) => this.getRemoteDatabases({ workspaceId: workspace.id, projectId: project.id, reload: true }));
                    // Wait for all databases to load (but don't block other workspaces)
                    yield Promise.allSettled(databasePromises);
                    return projects;
                }));
                // Wait for all workspaces to finish loading their projects and databases
                yield Promise.allSettled([...projectPromises, regionsPromise]);
            }
            catch (error) {
                console.error('Error reloading data:', error);
                // Don't throw - preloading is optional for UX, shouldn't break functionality
            }
            finally {
                this.reloadPromise = undefined;
            }
        });
    }
    getClient(workspaceId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.clients.has(workspaceId)) {
                yield this.credentialsStore.reloadCredentialsFromDisk();
                const credentials = yield this.credentialsStore.getCredentialsForWorkspace(workspaceId);
                if (!credentials)
                    throw new Error(`Workspace '${workspaceId}' not found`);
                const refreshTokenHandler = () => __awaiter(this, void 0, void 0, function* () {
                    const credentials = yield this.credentialsStore.getCredentialsForWorkspace(workspaceId);
                    if (!credentials)
                        throw new Error(`Workspace '${workspaceId}' not found`);
                    const { token, refreshToken } = yield this.auth.refreshToken(credentials.refreshToken);
                    yield this.credentialsStore.storeCredentials(Object.assign(Object.assign({}, credentials), { token, refreshToken }));
                    return { token };
                });
                const client = (0, client_1.createManagementAPIClient)(credentials.token, refreshTokenHandler);
                this.clients.set(workspaceId, client);
            }
            return this.clients.get(workspaceId);
        });
    }
    checkResponseOrThrow(workspaceId, response) {
        console.log('Received response', { error: response.error, statusCode: response.response.status });
        if (response.response.status < 400 && !response.error)
            return;
        if (response.response.status === 401) {
            void this.removeWorkspace({ workspaceId });
            throw new Error(`Session expired. Please sign in to continue.`);
        }
        const errorMessage = this.extractErrorMessage(response.error);
        if (!errorMessage) {
            throw new Error(`Unknown API error occurred. Status Code: ${response.response.status}.`);
        }
        throw new Error(errorMessage);
    }
    extractErrorMessage(error) {
        var _a, _b, _c, _d;
        const parsed = zod_1.z
            .object({
            message: zod_1.z.string().optional(),
            errorDescription: zod_1.z.string().optional(),
            error: zod_1.z.object({ message: zod_1.z.string().optional() }).optional(),
        })
            .safeParse(error);
        return ((_a = parsed.data) === null || _a === void 0 ? void 0 : _a.message) || ((_c = (_b = parsed.data) === null || _b === void 0 ? void 0 : _b.error) === null || _c === void 0 ? void 0 : _c.message) || ((_d = parsed.data) === null || _d === void 0 ? void 0 : _d.errorDescription);
    }
    triggerRefresh() {
        void this.credentialsStore.reloadCredentialsFromDisk();
        this.reloadPromise = this.reloadAllData();
        this.refreshEventEmitter.fire();
    }
    getRegions() {
        return __awaiter(this, arguments, void 0, function* ({ reload } = {}) {
            var _a;
            if (!reload) {
                yield this.reloadPromise;
            }
            if (this.cache.hasRegions()) {
                return this.cache.getRegions();
            }
            const workspaces = yield this.getWorkspaces();
            const workspaceId = (_a = workspaces[0]) === null || _a === void 0 ? void 0 : _a.id;
            if (!workspaceId)
                return [];
            const client = yield this.getClient(workspaceId);
            const response = yield client.GET('/v1/regions/postgres');
            this.checkResponseOrThrow(workspaceId, response);
            const regions = response.data.data;
            this.cache.setRegions(regions);
            return regions;
        });
    }
    ensureValidRegion(value) {
        const regions = this.cache.getRegions();
        if (!regions.some((r) => r.id === value)) {
            throw new Error(`Invalid region: ${value}. Available regions: ${regions.map((r) => r.id).join(', ')}.`);
        }
    }
    getWorkspaces() {
        return __awaiter(this, arguments, void 0, function* ({ reload } = {}) {
            if (!reload) {
                yield this.reloadPromise;
            }
            if (this.cache.hasWorkspaces()) {
                return this.cache.getWorkspaces();
            }
            const credentials = yield this.credentialsStore.getCredentials();
            const results = yield Promise.allSettled(credentials.map((cred) => __awaiter(this, void 0, void 0, function* () {
                const client = yield this.getClient(cred.workspaceId);
                const response = yield client.GET('/v1/workspaces');
                this.checkResponseOrThrow(cred.workspaceId, response);
                const [workspaceInfo] = response.data.data;
                if (!workspaceInfo) {
                    throw new Error(`Workspaces endpoint returned no workspace info.`);
                }
                return {
                    id: workspaceInfo.id,
                    name: workspaceInfo.name,
                    type: 'workspace',
                };
            })));
            const workspaces = results
                .flatMap((r) => (r.status === 'fulfilled' ? [r.value] : []))
                .sort((a, b) => a.name.localeCompare(b.name));
            this.cache.setWorkspaces(workspaces);
            return workspaces;
        });
    }
    addWorkspace(_a) {
        return __awaiter(this, arguments, void 0, function* ({ token, refreshToken }) {
            const client = (0, client_1.createManagementAPIClient)(token, () => {
                throw new Error('Received token has to be instantly refreshed. Something is wrong.');
            });
            const response = yield client.GET('/v1/workspaces');
            if (response.error) {
                throw new Error(`Failed to retrieve workspace information.`);
            }
            const { data: workspaces } = response.data;
            if (workspaces.length === 0) {
                throw new Error(`Received token does not grant access to any workspaces.`);
            }
            yield Promise.all(workspaces.map((_a) => __awaiter(this, [_a], void 0, function* ({ id, name }) {
                yield this.credentialsStore.storeCredentials({
                    refreshToken,
                    token,
                    workspaceId: id,
                });
                this.cache.setWorkspaces([...this.cache.getWorkspaces(), { id, name, type: 'workspace' }]);
            })));
            this.refreshEventEmitter.fire();
        });
    }
    removeWorkspace(_a) {
        return __awaiter(this, arguments, void 0, function* ({ workspaceId }) {
            this.clients.delete(workspaceId);
            yield this.connectionStringStorage.removeConnectionString({ workspaceId });
            yield this.credentialsStore.deleteCredentials(workspaceId);
            this.cache.removeWorkspace(workspaceId);
            this.refreshEventEmitter.fire();
        });
    }
    getProjects(_a) {
        return __awaiter(this, arguments, void 0, function* ({ workspaceId, reload }) {
            if (!reload) {
                yield this.reloadPromise;
            }
            if (this.cache.hasProjects(workspaceId)) {
                return this.cache.getProjects(workspaceId);
            }
            const client = yield this.getClient(workspaceId);
            const projects = [];
            let pagination = undefined;
            do {
                const response = (yield client.GET('/v1/projects', {
                    params: {
                        query: { cursor: (pagination === null || pagination === void 0 ? void 0 : pagination.nextCursor) || null, limit: 100 },
                    },
                }));
                this.checkResponseOrThrow(workspaceId, response);
                const { data } = response;
                pagination = data.pagination;
                projects.push(...data.data.map((project) => ({ id: project.id, name: project.name, type: 'project', workspaceId })));
            } while (pagination === null || pagination === void 0 ? void 0 : pagination.hasMore);
            this.cache.setProjects(workspaceId, projects);
            return projects;
        });
    }
    createProject(_a) {
        return __awaiter(this, arguments, void 0, function* ({ workspaceId, name, region, options = {}, }) {
            this.ensureValidRegion(region);
            const client = yield this.getClient(workspaceId);
            const response = yield client.POST('/v1/projects', {
                body: { name, region },
            });
            this.checkResponseOrThrow(workspaceId, response);
            const _b = response.data.data, { database } = _b, project = __rest(_b, ["database"]);
            yield this.connectionStringStorage.storeConnectionString({
                connectionString: database.connectionString,
                databaseId: database.id,
                projectId: project.id,
                workspaceId,
            });
            const simplifiedProject = { id: project.id, name: project.name, type: project.type, workspaceId };
            const simplifiedDatabase = {
                connectionString: database.connectionString,
                id: database.id,
                name: database.name,
                projectId: project.id,
                region: database.region.name,
                type: 'remoteDatabase',
                workspaceId,
            };
            if (!options.skipRefresh) {
                this.cache.addProject(simplifiedProject);
                this.cache.addDatabase(simplifiedDatabase);
                this.refreshEventEmitter.fire();
            }
            return { project: simplifiedProject, database: simplifiedDatabase };
        });
    }
    deleteProject(_a) {
        return __awaiter(this, arguments, void 0, function* ({ workspaceId, id }) {
            const client = yield this.getClient(workspaceId);
            const response = yield client.DELETE('/v1/projects/{id}', {
                params: { path: { id } },
            });
            this.checkResponseOrThrow(workspaceId, response);
            yield this.connectionStringStorage.removeConnectionString({ projectId: id, workspaceId });
            this.cache.removeProject(workspaceId, id);
            this.refreshEventEmitter.fire();
        });
    }
    getRemoteDatabases(_a) {
        return __awaiter(this, arguments, void 0, function* ({ workspaceId, projectId, reload, }) {
            if (!reload) {
                yield this.reloadPromise;
            }
            if (this.cache.hasDatabases(workspaceId, projectId)) {
                return this.cache.getDatabases(workspaceId, projectId);
            }
            const client = yield this.getClient(workspaceId);
            const databases = [];
            let pagination = undefined;
            do {
                const response = (yield client.GET('/v1/projects/{projectId}/databases', {
                    params: {
                        path: { projectId },
                        query: { cursor: (pagination === null || pagination === void 0 ? void 0 : pagination.nextCursor) || null, limit: 100 },
                    },
                }));
                this.checkResponseOrThrow(workspaceId, response);
                const { data } = response;
                pagination = data.pagination;
                databases.push(...data.data.map((database) => {
                    var _a, _b;
                    return ({
                        id: database.id,
                        name: database.name,
                        projectId,
                        region: (_b = (_a = database.region) === null || _a === void 0 ? void 0 : _a.name) !== null && _b !== void 0 ? _b : null,
                        type: 'remoteDatabase',
                        workspaceId,
                    });
                }));
            } while (pagination === null || pagination === void 0 ? void 0 : pagination.hasMore);
            this.cache.setDatabases(workspaceId, projectId, databases);
            return databases;
        });
    }
    getStoredRemoteDatabaseConnectionString(_a) {
        return __awaiter(this, arguments, void 0, function* ({ workspaceId, projectId, databaseId, }) {
            return this.connectionStringStorage.getConnectionString({ workspaceId, projectId, databaseId });
        });
    }
    createRemoteDatabaseConnectionString(_a) {
        return __awaiter(this, arguments, void 0, function* ({ workspaceId, projectId, databaseId, }) {
            const client = yield this.getClient(workspaceId);
            const response = yield client.POST('/v1/databases/{databaseId}/connections', {
                params: {
                    path: { databaseId },
                },
                body: {
                    name: "Created by Prisma's VSCode Extension",
                },
            });
            this.checkResponseOrThrow(workspaceId, response);
            const { connectionString } = response.data.data;
            yield this.connectionStringStorage.storeConnectionString({ connectionString, databaseId, projectId, workspaceId });
            return connectionString;
        });
    }
    createRemoteDatabase(_a) {
        return __awaiter(this, arguments, void 0, function* ({ workspaceId, projectId, name, region, options = {}, }) {
            this.ensureValidRegion(region);
            const client = yield this.getClient(workspaceId);
            const response = yield client.POST('/v1/projects/{projectId}/databases', {
                params: { path: { projectId } },
                body: { name, region },
            });
            this.checkResponseOrThrow(workspaceId, response);
            const { data: database } = response.data;
            yield this.connectionStringStorage.storeConnectionString({
                connectionString: database.connectionString,
                databaseId: database.id,
                projectId,
                workspaceId,
            });
            const simplifiedDatabase = {
                connectionString: database.connectionString,
                id: database.id,
                name: database.name,
                region: database.region.name,
                projectId,
                type: 'remoteDatabase',
                workspaceId,
            };
            if (!options.skipRefresh) {
                this.cache.addDatabase(simplifiedDatabase);
                this.refreshEventEmitter.fire();
            }
            return simplifiedDatabase;
        });
    }
    deleteRemoteDatabase(_a) {
        return __awaiter(this, arguments, void 0, function* ({ workspaceId, projectId, id, }) {
            const client = yield this.getClient(workspaceId);
            const response = yield client.DELETE('/v1/databases/{databaseId}', {
                params: { path: { databaseId: id } },
            });
            this.checkResponseOrThrow(workspaceId, response);
            yield this.connectionStringStorage.removeConnectionString({ databaseId: id, projectId, workspaceId });
            this.cache.removeDatabase(workspaceId, projectId, id);
            this.refreshEventEmitter.fire();
        });
    }
    getLocalDatabase(args) {
        return __awaiter(this, void 0, void 0, function* () {
            const { name } = args;
            const databases = yield this.getLocalDatabases();
            return databases.find((db) => db.name === name);
        });
    }
    getLocalDatabases() {
        return __awaiter(this, void 0, void 0, function* () {
            const cached = this.cache.getLocalDatabases();
            if (cached)
                return cached;
            const { ServerState } = yield import('@prisma/dev/internal/state');
            const data = (yield ServerState.scan()).map((state) => {
                var _a, _b;
                const { name, exports, status } = state;
                const url = (_a = exports === null || exports === void 0 ? void 0 : exports.ppg.url) !== null && _a !== void 0 ? _a : 'http://offline';
                let running = status === 'running' || status === 'starting_up';
                let pid = (_b = state.pid) !== null && _b !== void 0 ? _b : -1;
                // ppg dev quirk: after a deploy command, since it's run in the same
                // process as vscode, it stores the process pid and think it's running
                if (pid === process.pid) {
                    pid = -1;
                    running = false;
                }
                return { type: 'localDatabase', pid, name, id: name, url, running };
            });
            this.cache.setLocalDatabases(data);
            return data;
        });
    }
    createOrStartLocalDatabase(args) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const { name } = args;
            // skip spawning a new server if we know the server is running
            const database = yield this.getLocalDatabase({ name });
            if ((database === null || database === void 0 ? void 0 : database.running) === true)
                return;
            // TODO: once ppg dev has a daemon, this should be replaced
            const { path } = vscode_1.Uri.joinPath(this.context.extensionUri, ...['dist', 'src', 'plugins', 'prisma-postgres-manager', 'utils', 'spawnPpgDevServer.js']);
            const child = (0, child_process_1.fork)(path, [name], { stdio: ['ignore', 'pipe', 'pipe', 'ipc'], detached: true });
            (_a = child.stdout) === null || _a === void 0 ? void 0 : _a.on('data', (data) => console.log(`[PPG Child ${name}] ${String(data).trim()}`));
            (_b = child.stderr) === null || _b === void 0 ? void 0 : _b.on('data', (data) => console.error(`[PPG Child ${name}] ${String(data).trim()}`));
            (0, proxy_signals_1.proxySignals)(child); // closes the children if parent is closed (ie. vscode)
            yield new Promise((resolve, reject) => {
                var _a, _b;
                child.on('error', reject);
                (_a = child.stdout) === null || _a === void 0 ? void 0 : _a.on('data', (data) => {
                    if (String(data).includes('[PPG Dev] Server started')) {
                        return resolve(undefined);
                    }
                });
                (_b = child.stderr) === null || _b === void 0 ? void 0 : _b.on('data', (data) => {
                    if (String(data).includes('[PPG Dev] Error starting')) {
                        return reject(new Error(`${data}`));
                    }
                });
            });
            this.refreshEventEmitter.fire();
        });
    }
    deleteLocalDatabase(args) {
        return __awaiter(this, void 0, void 0, function* () {
            const { name } = args;
            const database = yield this.getLocalDatabase({ name });
            if (database !== undefined) {
                const databasePath = path.join(PPG_DEV_GLOBAL_ROOT.data, name);
                yield this.stopLocalDatabase({ name }).catch(() => { });
                yield fs.rm(databasePath, { recursive: true, force: true });
            }
            this.refreshEventEmitter.fire();
        });
    }
    stopLocalDatabase(args) {
        return __awaiter(this, void 0, void 0, function* () {
            const { name } = args;
            const database = yield this.getLocalDatabase({ name });
            if (database === null || database === void 0 ? void 0 : database.running) {
                const { pid } = database;
                process.kill(pid, 'SIGTERM');
                yield (0, waitForProcessKilled_1.waitForProcessKilled)(pid);
            }
            this.refreshEventEmitter.fire();
        });
    }
    deployLocalDatabase(args) {
        return __awaiter(this, void 0, void 0, function* () {
            const { Client } = yield import('@prisma/ppg');
            const { ServerState } = yield import('@prisma/dev/internal/state');
            const { dumpDB } = yield import('@prisma/dev/internal/db');
            const { name, url, projectId, workspaceId } = args;
            yield this.stopLocalDatabase({ name }); // db has to be stopped before dumping
            const state = yield ServerState.createExclusively({ name, persistenceMode: 'stateful' });
            try {
                const dump = yield dumpDB({ dataDir: state.pgliteDataDirPath });
                yield new Client({ connectionString: url }).query(dump, []);
            }
            catch (e) {
                yield state.close();
                throw e;
            }
            yield state.close();
            this.cache.clearDatabases(workspaceId, projectId);
            this.refreshEventEmitter.fire();
        });
    }
    getLocalDatabaseConnectionString(args) {
        return __awaiter(this, void 0, void 0, function* () {
            const { name } = args;
            const database = yield this.getLocalDatabase({ name });
            if ((database === null || database === void 0 ? void 0 : database.running) !== true) {
                this.refreshEventEmitter.fire();
                throw new Error('This database has been deleted or stopped');
            }
            return database.url;
        });
    }
}
exports.PrismaPostgresRepository = PrismaPostgresRepository;
//# sourceMappingURL=PrismaPostgresRepository.js.map