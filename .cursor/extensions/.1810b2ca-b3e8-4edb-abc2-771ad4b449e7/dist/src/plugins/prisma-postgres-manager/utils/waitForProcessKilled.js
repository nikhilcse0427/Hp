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
exports.waitForProcessKilled = waitForProcessKilled;
const promises_1 = require("node:timers/promises");
function waitForProcessKilled(pid_1) {
    return __awaiter(this, arguments, void 0, function* (pid, attemptsMade = 0) {
        try {
            process.kill(pid, 0);
        }
        catch (error) {
            return;
        }
        if (attemptsMade >= 10) {
            throw new Error(`Process ${pid} did not terminate after ${attemptsMade} attempts.`);
        }
        yield (0, promises_1.setTimeout)(100);
        yield waitForProcessKilled(pid, attemptsMade + 1);
    });
}
//# sourceMappingURL=waitForProcessKilled.js.map