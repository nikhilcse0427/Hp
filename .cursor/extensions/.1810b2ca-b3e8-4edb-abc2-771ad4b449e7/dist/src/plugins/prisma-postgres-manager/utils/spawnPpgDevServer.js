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
Object.defineProperty(exports, "__esModule", { value: true });
let server;
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const name = process.argv[2];
        console.log(JSON.stringify({
            message: `[PPG Dev] Starting process (${process.pid}) for database: ${name}`,
        }));
        if (!name) {
            console.log(JSON.stringify({
                message: '[PPG Dev] Missing argument, server cannot be started',
            }));
            process.exit(1);
        }
        try {
            const { unstable_startServer } = yield import('@prisma/dev');
            server = yield unstable_startServer({ persistenceMode: 'stateful', name });
            // this message is important and required to know on the spawning side if alive
            console.log(JSON.stringify({
                message: `[PPG Dev] Server started successfully for database: ${name}`,
            }));
        }
        catch (error) {
            // this message is important and required to know on the spawning side if dead
            console.error(JSON.stringify({
                message: `[PPG Dev] Error starting server for database ${name}`,
                error: error instanceof Error ? error.message : String(error),
            }));
            yield new Promise((r) => setTimeout(r, 1000));
            process.exit(1);
        }
    });
}
// Handle process termination gracefully
process.on('SIGTERM', () => {
    void (() => __awaiter(void 0, void 0, void 0, function* () {
        console.log(JSON.stringify({
            message: '[PPG Dev] Received SIGTERM, shutting down gracefully...',
        }));
        yield (server === null || server === void 0 ? void 0 : server.close());
        process.exit(0);
    }))();
});
process.on('SIGINT', () => {
    void (() => __awaiter(void 0, void 0, void 0, function* () {
        console.log(JSON.stringify({
            message: '[PPG Dev] Received SIGINT, shutting down gracefully...',
        }));
        yield (server === null || server === void 0 ? void 0 : server.close());
        process.exit(0);
    }))();
});
void main();
//# sourceMappingURL=spawnPpgDevServer.js.map