import { PrismaPostgresRepository } from '../PrismaPostgresRepository';
import { type ExtensionContext } from 'vscode';
export interface DeployLocalDatabaseOptions {
    args: unknown;
    context: ExtensionContext;
    ppgRepository: PrismaPostgresRepository;
}
export declare function deployLocalDatabase(options: DeployLocalDatabaseOptions): Promise<void>;
