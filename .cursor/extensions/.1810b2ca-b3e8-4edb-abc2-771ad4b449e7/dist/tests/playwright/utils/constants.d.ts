export declare const TIMEOUTS: {
    readonly VSCODE_LAUNCH: 30000;
    readonly WORKBENCH_LOAD: 10000;
    readonly EXTENSION_ACTIVATION: 3000;
    readonly COMMAND_PALETTE: 5000;
    readonly FILE_EXPLORER: 3000;
    readonly EDITOR_LOAD: 5000;
    readonly COMMAND_EXECUTION: 2000;
    readonly COMMAND_SEARCH: 1000;
    readonly FILE_OPEN: 1000;
    readonly EXPLORER_TOGGLE: 500;
    readonly DEFAULT_WORKBENCH: 10000;
    readonly DEFAULT_COMMAND_PALETTE: 5000;
    readonly DEFAULT_FILE_EXPLORER: 3000;
    readonly DEFAULT_EDITOR: 5000;
};
export declare const SELECTORS: {
    readonly WORKBENCH: ".monaco-workbench";
    readonly COMMAND_PALETTE: ".quick-input-widget";
    readonly COMMAND_ITEM: ".quick-input-list-row";
    readonly EXPLORER: ".explorer-viewlet";
    readonly EDITOR: ".monaco-editor";
    readonly INPUT_BOX: ".quick-input-box input";
    readonly SIMPLE_BROWSER: ".simple-browser-workbench";
    readonly TAB: ".tab";
    readonly STUDIO_TAB: ".tab:has-text(\"Studio\")";
    readonly WEBVIEW: "webview, iframe, .webview";
};
export declare const COMMANDS: {
    readonly LAUNCH_PRISMA_STUDIO: "Prisma: Launch Prisma Studio";
};
export declare const KEYBOARD_SHORTCUTS: {
    readonly COMMAND_PALETTE: "Meta+Shift+P" | "Control+Shift+P";
    readonly FILE_EXPLORER: "Meta+Shift+E" | "Control+Shift+E";
    readonly ENTER: "Enter";
    readonly ESCAPE: "Escape";
};
export declare const WAIT_TIMES: {
    readonly DOM_LOAD: 3000;
    readonly COMMAND_APPEAR: 1000;
    readonly COMMAND_EXECUTION: 2000;
    readonly FILE_OPEN: 1000;
    readonly EXPLORER_TOGGLE: 500;
    readonly STUDIO_LAUNCH: 5000;
    readonly INPUT_RESPONSE: 1000;
};
export declare const TEST_DATA: {
    readonly FAKE_DATABASE_URL: "prisma+postgres://user:password@host.example.com:5432/database?schema=public";
};
