import { ExtensionContext } from 'vscode';
import type { LaunchArg } from '../../../prisma-postgres-manager/commands/launchStudio';
export interface OpenNewStudioTabArgs {
    context: ExtensionContext;
    database?: LaunchArg;
    dbUrl: string;
}
/**
 * Opens Prisma Studio in a webview panel.
 * @param args - An object containing the database URL and extension context.
 */
export declare function openNewStudioTab(args: OpenNewStudioTabArgs): Promise<void>;
