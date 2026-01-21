import { type ExtensionContext } from 'vscode';
import type TelemetryReporter from '../../../../telemetryReporter';
import type { LaunchArg } from '../../../prisma-postgres-manager/commands/launchStudio';
export interface StartStudioServerArgs {
    context: ExtensionContext;
    database?: LaunchArg;
    dbUrl: string;
    telemetryReporter: TelemetryReporter;
}
/**
 * Starts a local server for Prisma Studio and serves the UI files.
 * @param args - An object containing the static files root URI.
 * @returns The URL of the running server.
 */
export declare function startStudioServer(args: StartStudioServerArgs): Promise<{
    server: import("@hono/node-server").ServerType;
    url: string;
}>;
