import { LocalDatabase, PrismaPostgresRepository } from '../PrismaPostgresRepository';
export declare function copyLocalDatabaseUrl(ppgRepository: PrismaPostgresRepository, args: unknown): Promise<void>;
export declare function copyLocalDatabaseUrlSafely(ppgRepository: PrismaPostgresRepository, args: LocalDatabase): Promise<void>;
