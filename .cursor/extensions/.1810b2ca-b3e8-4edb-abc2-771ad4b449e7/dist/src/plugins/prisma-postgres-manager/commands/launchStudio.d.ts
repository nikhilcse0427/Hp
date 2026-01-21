import { ExtensionContext } from 'vscode';
import { PrismaPostgresRepository } from '../PrismaPostgresRepository';
import { z } from 'zod';
export declare const LaunchArgLocalSchema: z.ZodObject<{
    type: z.ZodLiteral<"local">;
    id: z.ZodString;
    name: z.ZodString;
}, "strip", z.ZodTypeAny, {
    type: "local";
    id: string;
    name: string;
}, {
    type: "local";
    id: string;
    name: string;
}>;
export type LaunchArgLocal = z.infer<typeof LaunchArgLocalSchema>;
export declare const LaunchArgRemoteSchema: z.ZodObject<{
    type: z.ZodLiteral<"remote">;
    workspaceId: z.ZodString;
    projectId: z.ZodString;
    databaseId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    type: "remote";
    workspaceId: string;
    projectId: string;
    databaseId: string;
}, {
    type: "remote";
    workspaceId: string;
    projectId: string;
    databaseId: string;
}>;
export type LaunchArgRemote = z.infer<typeof LaunchArgRemoteSchema>;
declare const LaunchArgSchema: z.ZodUnion<[z.ZodObject<{
    type: z.ZodLiteral<"local">;
    id: z.ZodString;
    name: z.ZodString;
}, "strip", z.ZodTypeAny, {
    type: "local";
    id: string;
    name: string;
}, {
    type: "local";
    id: string;
    name: string;
}>, z.ZodObject<{
    type: z.ZodLiteral<"remote">;
    workspaceId: z.ZodString;
    projectId: z.ZodString;
    databaseId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    type: "remote";
    workspaceId: string;
    projectId: string;
    databaseId: string;
}, {
    type: "remote";
    workspaceId: string;
    projectId: string;
    databaseId: string;
}>]>;
export type LaunchArg = z.infer<typeof LaunchArgSchema>;
export declare const launchStudio: ({ ppgRepository, context, args, }: {
    ppgRepository: PrismaPostgresRepository;
    context: ExtensionContext;
    args: unknown;
}) => Promise<void>;
export {};
