import { type ExtensionContext } from 'vscode';
import type { LaunchArg } from '../../prisma-postgres-manager/commands/launchStudio';
export interface LaunchArgs {
    context: ExtensionContext;
    database?: LaunchArg;
    dbUrl?: string;
}
/**
 * Launches Prisma Studio, prompting for a database URL if not provided.
 * @param args - An object containing the database URL and extension context.
 */
export declare function launch(args: LaunchArgs): Promise<string | void>;
