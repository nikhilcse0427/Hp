import type { ElectronApplication } from '@playwright/test';
export interface VSCodeSetupOptions {
    rootPath: string;
    testWorkspace: string;
    disableExtensions?: boolean;
    timeout?: number;
}
export declare function setupVSCode(options: VSCodeSetupOptions): Promise<ElectronApplication>;
