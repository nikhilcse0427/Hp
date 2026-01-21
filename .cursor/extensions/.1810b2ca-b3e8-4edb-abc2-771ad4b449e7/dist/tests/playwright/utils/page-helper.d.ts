import type { Page, ElectronApplication } from '@playwright/test';
export interface PageHelperTimeouts {
    workbench?: number;
    commandPalette?: number;
    fileExplorer?: number;
    editor?: number;
}
export declare class VSCodePageHelper {
    private page;
    private timeouts;
    constructor(page: Page, timeouts?: PageHelperTimeouts);
    static create(electronApp: ElectronApplication, timeouts?: PageHelperTimeouts): Promise<VSCodePageHelper>;
    waitForWorkbench(): Promise<void>;
    openCommandPalette(): Promise<void>;
    executeCommand(commandName: string): Promise<void>;
    executeCommandWithInput(commandName: string, inputValue: string): Promise<void>;
    waitForStudioTab(timeout?: number): Promise<boolean>;
    checkForStudioTab(): Promise<boolean>;
    checkForWebview(): Promise<boolean>;
    openFileExplorer(): Promise<void>;
    openFile(filename: string): Promise<void>;
    getEditorContent(): Promise<string>;
    getCleanEditorContent(): Promise<string>;
}
