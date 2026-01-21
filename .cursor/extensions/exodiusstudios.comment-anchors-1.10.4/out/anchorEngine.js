"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnchorEngine = void 0;
const debounce_1 = __importDefault(require("debounce"));
const fs = __importStar(require("node:fs"));
const path = __importStar(require("node:path"));
const vscode_1 = require("vscode");
const entryAnchor_1 = __importDefault(require("./anchor/entryAnchor"));
const entryAnchorRegion_1 = __importDefault(require("./anchor/entryAnchorRegion"));
const entryError_1 = __importDefault(require("./anchor/entryError"));
const entryLoading_1 = __importDefault(require("./anchor/entryLoading"));
const entryScan_1 = __importDefault(require("./anchor/entryScan"));
const escape_1 = __importDefault(require("./util/escape"));
const minimatch_1 = require("minimatch");
const anchorIndex_1 = require("./anchorIndex");
const linkProvider_1 = require("./util/linkProvider");
const fileAnchorProvider_1 = require("./provider/fileAnchorProvider");
const epicAnchorProvider_1 = require("./provider/epicAnchorProvider");
const workspaceAnchorProvider_1 = require("./provider/workspaceAnchorProvider");
const asyncDelay_1 = require("./util/asyncDelay");
const anchorListView_1 = require("./anchorListView");
const flattener_1 = require("./util/flattener");
const defaultTags_1 = require("./util/defaultTags");
const completionProvider_1 = require("./util/completionProvider");
const customTags_1 = require("./util/customTags");
/* -- Constants -- */
const HEX_COLOR_REGEX = /^#([\da-f]{3}){1,2}$/i;
const COLOR_PLACEHOLDER_REGEX = /%COLOR%/g;
const MATCH_OPTIONS = {
    dot: true
};
const MATCHER_TAG_INDEX = 1;
const MATCHER_ATTR_INDEX = 2;
const MATCHER_COMMENT_INDEX = 3;
/**
 * The main anchor parsing and caching engine
 */
class AnchorEngine {
    /** The context of Comment Anchors */
    context;
    /** Then event emitter in charge of refreshing the file trees */
    _onDidChangeTreeData = new vscode_1.EventEmitter();
    /** Then event emitter in charge of refreshing the document link */
    _onDidChangeLinkData = new vscode_1.EventEmitter();
    /** Debounced function for performance improvements */
    _idleRefresh;
    /** The RegEx used for matching */
    matcher;
    /** A cache holding all documents */
    anchorMaps = new Map();
    /** The decorators used for decorating the anchors */
    anchorDecorators = new Map();
    /** The decorators used for decorating the region end anchors */
    anchorEndDecorators = new Map();
    /** The list of tags and their settings */
    tags = new Map();
    /** Returns true when all anchors have been loaded */
    anchorsLoaded = false;
    /** Holds whether a scan has been performed since rebuild */
    anchorsScanned = false;
    /** Holds whether anchors may be outdated */
    anchorsDirty = true;
    /** The tree view used for displaying file anchors */
    fileTreeView;
    /** The tree view used for displaying workspace anchors */
    workspaceTreeView;
    /** The epic view used for displaying workspace anchors */
    epicTreeView;
    /** The resource for the link provider */
    linkProvider;
    /** The currently expanded file tree items */
    expandedFileTreeViewItems = [];
    /** The currently expanded workspace tree items  */
    expandedWorkspaceTreeViewItems = [];
    /** The icon cache directory */
    iconCache = "";
    /** The current editor */
    _editor;
    /** Anchor comments config settings */
    _config;
    /** The current file system watcher */
    _watcher;
    /** List of build subscriptions */
    _subscriptions = [];
    linkDisposable;
    /** The debug output for comment anchors */
    static output;
    // Possible error entries //
    errorUnusableItem = new entryError_1.default(this, "Waiting for open editor...");
    errorEmptyItem = new entryError_1.default(this, "No comment anchors detected");
    errorEmptyWorkspace = new entryError_1.default(this, "No comment anchors in workspace");
    errorEmptyEpics = new entryError_1.default(this, "No epics found in workspace");
    errorWorkspaceDisabled = new entryError_1.default(this, "Workspace disabled");
    errorFileOnly = new entryError_1.default(this, "No open workspaces");
    statusLoading = new entryLoading_1.default(this);
    statusScan = new entryScan_1.default(this);
    cursorTask;
    constructor(context) {
        this.context = context;
        vscode_1.window.onDidChangeActiveTextEditor((e) => this.onActiveEditorChanged(e), this, context.subscriptions);
        vscode_1.workspace.onDidChangeTextDocument((e) => this.onDocumentChanged(e), this, context.subscriptions);
        vscode_1.workspace.onDidChangeConfiguration(() => this.buildResources(), this, context.subscriptions);
        vscode_1.workspace.onDidChangeWorkspaceFolders(() => this.buildResources(), this, context.subscriptions);
        vscode_1.workspace.onDidCloseTextDocument((e) => this.cleanUp(e), this, context.subscriptions);
        const outputChannel = vscode_1.window.createOutputChannel("Comment Anchors");
        AnchorEngine.output = (m) => outputChannel.appendLine("[Comment Anchors] " + m);
        if (vscode_1.window.activeTextEditor) {
            this._editor = vscode_1.window.activeTextEditor;
        }
        // Create the file anchor view
        this.fileTreeView = vscode_1.window.createTreeView("fileAnchors", {
            treeDataProvider: new fileAnchorProvider_1.FileAnchorProvider(this),
            showCollapseAll: true,
        });
        this.fileTreeView.onDidExpandElement((e) => {
            if (e.element instanceof entryAnchor_1.default) {
                this.expandedFileTreeViewItems.push(e.element.anchorText);
            }
        });
        this.fileTreeView.onDidCollapseElement((e) => {
            if (e.element instanceof entryAnchor_1.default) {
                const idx = this.expandedFileTreeViewItems.indexOf(e.element.anchorText);
                this.expandedFileTreeViewItems.splice(idx, 1);
            }
        });
        // Create the workspace anchor view
        this.workspaceTreeView = vscode_1.window.createTreeView("workspaceAnchors", {
            treeDataProvider: new workspaceAnchorProvider_1.WorkspaceAnchorProvider(this),
            showCollapseAll: true,
        });
        this.workspaceTreeView.onDidExpandElement((e) => {
            if (e.element instanceof entryAnchor_1.default) {
                this.expandedWorkspaceTreeViewItems.push(e.element.anchorText);
            }
        });
        this.workspaceTreeView.onDidCollapseElement((e) => {
            if (e.element instanceof entryAnchor_1.default) {
                const idx = this.expandedWorkspaceTreeViewItems.indexOf(e.element.anchorText);
                this.expandedWorkspaceTreeViewItems.splice(idx, 1);
            }
        });
        // Create the workspace anchor view
        this.epicTreeView = vscode_1.window.createTreeView("epicAnchors", {
            treeDataProvider: new epicAnchorProvider_1.EpicAnchorProvider(this),
            showCollapseAll: true,
        });
        // Setup the link provider
        const provider = new linkProvider_1.LinkProvider(this);
        this.linkDisposable = vscode_1.languages.registerDocumentLinkProvider({ language: "*" }, provider);
        this.linkProvider = provider;
        // Build required anchor resources
        this.buildResources();
    }
    registerProviders() {
        const config = this._config;
        // Provide auto completion
        if (config.tags.provideAutoCompletion) {
            this._subscriptions.push((0, completionProvider_1.setupCompletionProvider)(this));
        }
        // Provide epic auto complete
        if (config.epic.provideAutoCompletion) {
            this._subscriptions.push(vscode_1.languages.registerCompletionItemProvider({ language: "*" }, new epicAnchorProvider_1.EpicAnchorIntelliSenseProvider(this), "["));
        }
    }
    buildResources() {
        try {
            this.anchorsScanned = false;
            const config = (this._config = vscode_1.workspace.getConfiguration("commentAnchors"));
            // Construct the debounce
            this._idleRefresh = (0, debounce_1.default)(() => {
                if (this._editor)
                    this.parse(this._editor.document.uri).then(() => {
                        this.refresh();
                    });
            }, config.parseDelay);
            // Disable previous build resources
            for (const s of this._subscriptions)
                s.dispose();
            this._subscriptions = [];
            // Store the sorting method
            if (config.tags.sortMethod && (config.tags.sortMethod == "line" || config.tags.sortMethod == "type")) {
                entryAnchor_1.default.SortMethod = config.tags.sortMethod;
            }
            // Store the scroll position
            if (config.scrollPosition) {
                entryAnchor_1.default.ScrollPosition = config.scrollPosition;
            }
            // Prepare icon cache
            const storage = this.context.globalStoragePath;
            const iconCache = path.join(storage, "icons");
            const baseAnchorSrc = path.join(__dirname, "../res/anchor.svg");
            const baseAnchorEndSrc = path.join(__dirname, "../res/anchor_end.svg");
            const baseAnchor = fs.readFileSync(baseAnchorSrc, "utf8");
            const baseAnchorEnd = fs.readFileSync(baseAnchorEndSrc, "utf8");
            const iconColors = [];
            const regionColors = [];
            if (!fs.existsSync(storage))
                fs.mkdirSync(storage);
            if (!fs.existsSync(iconCache))
                fs.mkdirSync(iconCache);
            this.iconCache = iconCache;
            // Clear icon cache
            for (const file of fs.readdirSync(iconCache)) {
                fs.unlinkSync(path.join(iconCache, file));
            }
            // Create a map holding the tags
            this.tags.clear();
            for (const type of this.anchorDecorators.values()) {
                type.dispose();
            }
            for (const type of this.anchorEndDecorators.values()) {
                type.dispose();
            }
            this.anchorDecorators.clear();
            this.anchorEndDecorators.clear();
            // Register default tags
            (0, defaultTags_1.registerDefaults)(this.tags);
            // Add custom tags
            (0, customTags_1.parseCustomAnchors)(config, this.tags);
            // Detect the lane style
            let laneStyle;
            if (config.tags.rulerStyle == "left") {
                laneStyle = vscode_1.OverviewRulerLane.Left;
            }
            else if (config.tags.rulerStyle == "right") {
                laneStyle = vscode_1.OverviewRulerLane.Right;
            }
            else if (config.tags.rulerStyle == "center") {
                laneStyle = vscode_1.OverviewRulerLane.Center;
            }
            else {
                laneStyle = vscode_1.OverviewRulerLane.Full;
            }
            // Start the cursor tracker
            if (this.cursorTask) {
                clearInterval(this.cursorTask);
            }
            let prevLine = 0;
            if (config.showCursor) {
                this.cursorTask = setInterval(() => {
                    const cursor = vscode_1.window.activeTextEditor?.selection?.active?.line;
                    if (cursor !== undefined && prevLine != cursor) {
                        AnchorEngine.output("Updating cursor position");
                        this.updateFileAnchors();
                        prevLine = cursor;
                    }
                }, 100);
            }
            // Configure all tags
            for (const tag of this.tags.values()) {
                if (!tag.scope) {
                    tag.scope = "workspace";
                }
                if (config.tagHighlights.enabled) {
                    // Create base configuration
                    const highlight = {
                        fontWeight: tag.isBold || tag.isBold == undefined ? "bold" : "normal",
                        fontStyle: tag.isItalic || tag.isItalic == undefined ? "italic" : "normal",
                        color: tag.highlightColor,
                        backgroundColor: tag.backgroundColor,
                        border: tag.borderStyle,
                        borderRadius: tag.borderRadius ? tag.borderRadius + "px" : undefined,
                        textDecoration: tag.textDecorationStyle,
                    };
                    // Optionally insert rulers
                    if (config.tags.displayInRuler && tag.ruler != false) {
                        highlight.overviewRulerColor = tag.highlightColor || '#828282';
                        highlight.overviewRulerLane = laneStyle;
                    }
                    // Save the icon color
                    let iconColor = tag.iconColor || tag.highlightColor || 'default';
                    let skipColor = false;
                    switch (iconColor) {
                        case "blue": {
                            iconColor = "#3ea8ff";
                            break;
                        }
                        case "blurple": {
                            iconColor = "#7d5afc";
                            break;
                        }
                        case "red": {
                            iconColor = "#f44336";
                            break;
                        }
                        case "purple": {
                            iconColor = "#ba68c8";
                            break;
                        }
                        case "teal": {
                            iconColor = "#00cec9";
                            break;
                        }
                        case "orange": {
                            iconColor = "#ffa100";
                            break;
                        }
                        case "green": {
                            iconColor = "#64dd17";
                            break;
                        }
                        case "pink": {
                            iconColor = "#e84393";
                            break;
                        }
                        case "emerald": {
                            iconColor = "#2ecc71";
                            break;
                        }
                        case "yellow": {
                            iconColor = "#f4d13d";
                            break;
                        }
                        case "default":
                        case "auto": {
                            skipColor = true;
                            break;
                        }
                        default: {
                            if (!HEX_COLOR_REGEX.test(iconColor)) {
                                skipColor = true;
                                vscode_1.window.showErrorMessage("Invalid color: " + iconColor);
                            }
                        }
                    }
                    if (skipColor) {
                        tag.iconColor = "auto";
                    }
                    else {
                        iconColor = iconColor.slice(1);
                        if (!iconColors.includes(iconColor)) {
                            iconColors.push(iconColor);
                        }
                        if (tag.behavior == "region" && !regionColors.includes(iconColor)) {
                            regionColors.push(iconColor);
                        }
                        tag.iconColor = iconColor.toLowerCase();
                    }
                    // Optional gutter icons
                    if (config.tags.displayInGutter) {
                        if (tag.iconColor == "auto") {
                            highlight.dark = {
                                gutterIconPath: path.join(__dirname, "..", "res", "anchor_white.svg"),
                            };
                            highlight.light = {
                                gutterIconPath: path.join(__dirname, "..", "res", "anchor_black.svg"),
                            };
                        }
                        else {
                            highlight.gutterIconPath = path.join(iconCache, "anchor_" + tag.iconColor + ".svg");
                        }
                    }
                    // Create the decoration type
                    this.anchorDecorators.set(tag.tag, vscode_1.window.createTextEditorDecorationType(highlight));
                    if (tag.behavior == "region") {
                        const endHighlight = { ...highlight };
                        // Optional gutter icons
                        if (config.tags.displayInGutter) {
                            if (tag.iconColor == "auto") {
                                endHighlight.dark = {
                                    gutterIconPath: path.join(__dirname, "..", "res", "anchor_end_white.svg"),
                                };
                                endHighlight.light = {
                                    gutterIconPath: path.join(__dirname, "..", "res", "anchor_end_black.svg"),
                                };
                            }
                            else {
                                endHighlight.gutterIconPath = path.join(iconCache, "anchor_end_" + tag.iconColor + ".svg");
                            }
                        }
                        // Create the ending decoration type
                        this.anchorEndDecorators.set(tag.tag, vscode_1.window.createTextEditorDecorationType(endHighlight));
                    }
                }
            }
            // Fetch an array of tags
            const tagList = [...this.tags.keys()];
            // Generate region end tags
            const endTag = this._config.tags.endTag;
            for (const [tag, entry] of this.tags.entries()) {
                if (entry.behavior == "region") {
                    tagList.push(endTag + tag);
                }
            }
            // Create a selection of tags
            const tags = tagList
                .map((tag) => (0, escape_1.default)(tag))
                .sort((left, right) => right.length - left.length)
                .join("|");
            if (tags.length === 0) {
                vscode_1.window.showErrorMessage("At least one tag must be defined");
                return;
            }
            // Create a selection of separators
            const separators = config.tags.separators
                .map((seperator) => (0, escape_1.default)(seperator).replaceAll(' ', " +"))
                .sort((left, right) => right.length - left.length)
                .join("|");
            if (separators.length === 0) {
                vscode_1.window.showErrorMessage("At least one separator must be defined");
                return;
            }
            // Create a selection of prefixes
            const prefixes = config.tags.matchPrefix
                .map((match) => (0, escape_1.default)(match).replaceAll(' ', " +"))
                .sort((left, right) => right.length - left.length)
                .join("|");
            if (prefixes.length === 0) {
                vscode_1.window.showErrorMessage("At least one match prefix must be defined");
                return;
            }
            // ANCHOR: Regex for matching tags
            // group 1 - Anchor tag
            // group 2 - Attributes
            // group 3 - Text
            const regex = `(?:${prefixes})(?:\\x20{0,4}|\\t{0,1})(${tags})(\\[.*\\])?(?:(?:${separators})(.*))?$`;
            const flags = config.tags.matchCase ? "gm" : "img";
            this.matcher = new RegExp(regex, flags);
            AnchorEngine.output("Using matcher " + this.matcher);
            // Write anchor icons
            for (const color of iconColors) {
                const filename = "anchor_" + color.toLowerCase() + ".svg";
                const anchorSvg = baseAnchor.replaceAll(COLOR_PLACEHOLDER_REGEX, "#" + color);
                fs.writeFileSync(path.join(iconCache, filename), anchorSvg);
                if (regionColors.includes(color)) {
                    const filenameEnd = "anchor_end_" + color.toLowerCase() + ".svg";
                    const anchorEndSvg = baseAnchorEnd.replaceAll(COLOR_PLACEHOLDER_REGEX, "#" + color);
                    fs.writeFileSync(path.join(iconCache, filenameEnd), anchorEndSvg);
                }
            }
            AnchorEngine.output("Generated icon cache at " + iconCache);
            // Scan in all workspace files
            if (config.workspace.enabled && !config.workspace.lazyLoad) {
                setTimeout(() => {
                    this.initiateWorkspaceScan();
                }, 500);
            }
            else {
                this.anchorsLoaded = true;
                if (this._editor) {
                    this.addMap(this._editor.document.uri);
                }
                this.refresh();
            }
            // Dispose the existing file watcher
            if (this._watcher) {
                this._watcher.dispose();
            }
            // Create a new file watcher
            if (config.workspace.enabled) {
                this._watcher = vscode_1.workspace.createFileSystemWatcher(config.workspace.matchFiles, true, true, false);
                this._watcher.onDidDelete((file) => {
                    for (const [uri, _] of this.anchorMaps.entries()) {
                        if (uri.toString() == file.toString()) {
                            this.removeMap(uri);
                            false;
                            continue;
                        }
                    }
                });
            }
            // Register editor providers
            this.registerProviders();
        }
        catch (err) {
            AnchorEngine.output("Failed to build resources: " + err.message);
            AnchorEngine.output(err.stack);
        }
    }
    initiateWorkspaceScan() {
        const config = this._config;
        this.anchorsScanned = true;
        this.anchorsLoaded = false;
        // Find all files located in this workspace
        vscode_1.workspace.findFiles(config.workspace.matchFiles, config.workspace.excludeFiles).then((uris) => {
            // Clear all existing mappings
            this.anchorMaps.clear();
            // Resolve all matched URIs
            this.loadWorkspace(uris)
                .then(() => {
                if (this._editor) {
                    this.addMap(this._editor.document.uri);
                }
                this.anchorsLoaded = true;
                this.refresh();
            })
                .catch((err) => {
                vscode_1.window.showErrorMessage("Comment Anchors failed to load: " + err);
                AnchorEngine.output(err);
            });
        });
        // Update workspace tree
        this.updateFileAnchors();
    }
    async loadWorkspace(uris) {
        const maxFiles = this._config.workspace.maxFiles;
        const parseStatus = vscode_1.window.createStatusBarItem(vscode_1.StatusBarAlignment.Left, 0);
        let parseCount = 0;
        let parsePercentage = 0;
        parseStatus.tooltip = "Provided by the Comment Anchors extension";
        parseStatus.text = `$(telescope) Initializing...`;
        parseStatus.show();
        for (let i = 0; i < uris.length && parseCount < maxFiles; i++) {
            // Await a timeout for every 10 documents parsed. This allows
            // all files to be slowly parsed without completely blocking
            // the main thread for the entire process.
            if (i % 10 == 0) {
                await (0, asyncDelay_1.asyncDelay)(5);
            }
            try {
                const found = await this.addMap(uris[i]);
                // Only update states when a file containing anchors
                // was found and parsed.
                if (found) {
                    parseCount++;
                    parsePercentage = (parseCount / uris.length) * 100;
                    parseStatus.text = `$(telescope) Parsing Comment Anchors... (${parsePercentage.toFixed(1)}%)`;
                }
            }
            catch {
                // Ignore, already taken care of
            }
        }
        // Scanning has now completed
        parseStatus.text = `Comment Anchors loaded!`;
        setTimeout(() => {
            parseStatus.dispose();
        }, 3000);
    }
    /**
     * Returns the anchors in the current document
     */
    get currentAnchors() {
        if (!this._editor)
            return [];
        const uri = this._editor.document.uri;
        if (this.anchorMaps.has(uri)) {
            return this.anchorMaps.get(uri).anchorTree;
        }
        else {
            return [];
        }
    }
    /**
     * Dispose anchor list resources
     */
    dispose() {
        for (const type of this.anchorDecorators.values()) {
            type.dispose();
        }
        for (const type of this.anchorEndDecorators.values()) {
            type.dispose();
        }
        for (const subscription of this._subscriptions) {
            subscription.dispose();
        }
        this.linkDisposable.dispose();
        if (this.cursorTask) {
            clearInterval(this.cursorTask);
        }
    }
    /**
     * Clean up external files
     */
    cleanUp(document) {
        if (document.uri.scheme != "file")
            return;
        const ws = vscode_1.workspace.getWorkspaceFolder(document.uri);
        if (this._config.workspace.enabled && ws && this.anchorsScanned)
            return;
        this.removeMap(document.uri);
    }
    /**
     * Travel to the specified anchor id
     *
     * @param The anchor id
     */
    travelToAnchor(id) {
        if (!this._editor)
            return;
        const anchors = this.currentAnchors;
        const flattened = (0, flattener_1.flattenAnchors)(anchors);
        for (const anchor of flattened) {
            if (anchor.attributes.id == id) {
                const targetLine = anchor.lineNumber - 1;
                vscode_1.commands.executeCommand("revealLine", {
                    lineNumber: targetLine,
                    at: entryAnchor_1.default.ScrollPosition,
                });
                return;
            }
        }
    }
    /**
     * Parse the given raw attribute string into
     * individual attributes.
     *
     * @param raw The raw attribute string
     * @param defaultValue The default attributes
     */
    parseAttributes(raw, defaultValue) {
        if (!raw)
            return defaultValue;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result = { ...defaultValue };
        const mapping = new Map();
        // parse all 'key1=value1,key2=value2'
        for (const pair of raw.split(",")) {
            const [key, value] = pair.trim().split("=");
            AnchorEngine.output(`Trying to set key=${key},value=${value}`);
            mapping.set(key, value);
        }
        // Parse the epic value
        if (mapping.has("epic")) {
            result.epic = mapping.get("epic");
        }
        // Parse the sequence value
        if (mapping.has("seq")) {
            result.seq = Number.parseInt(mapping.get("seq"), 10);
        }
        // Parse the id value
        if (mapping.has("id")) {
            result.id = mapping.get("id");
        }
        return result;
    }
    /**
     * Parse the given or current document
     *
     * @returns true when anchors were found
     */
    async parse(document) {
        let anchorsFound = false;
        try {
            const config = this._config;
            const endTag = config.tags.endTag;
            const { displayTagName, displayInSidebar, displayLineNumber, matchSuffix, } = config.tags;
            let text = null;
            // Match the document against the configured glob
            const relativePath = vscode_1.workspace.asRelativePath(document);
            if (!(0, minimatch_1.minimatch)(relativePath, config.workspace.matchFiles, MATCH_OPTIONS)) {
                return false;
            }
            // Read text from open documents
            for (const td of vscode_1.workspace.textDocuments) {
                if (td.uri == document) {
                    text = td.getText();
                    break;
                }
            }
            // Read the text from the file system
            if (text == null) {
                text = await this.readDocument(document);
            }
            const currRegions = [];
            const anchors = [];
            const folds = [];
            let match;
            // Find all anchor occurences
            while ((match = this.matcher.exec(text))) {
                const tagMatch = match[MATCHER_TAG_INDEX];
                let tagName;
                let isRegionEnd;
                if (this.tags.has(tagMatch)) {
                    tagName = tagMatch;
                    isRegionEnd = false;
                }
                else {
                    if (!tagMatch.startsWith(endTag))
                        throw new TypeError("matched non-existent tag");
                    tagName = tagMatch.slice(endTag.length);
                    isRegionEnd = true;
                }
                const tagEntry = this.tags.get(tagName);
                const isRegionStart = tagEntry.behavior == "region";
                const currRegion = (currRegions.length > 0 && currRegions.at(-1)) || null;
                const style = tagEntry.styleMode;
                // Compute positions and lengths
                const offsetPos = match[0].indexOf(tagMatch);
                const startPos = match.index + (style == 'full' ? 0 : offsetPos);
                const lineNumber = text.slice(0, Math.max(0, startPos)).split(/\r\n|\r|\n/g).length;
                const rangeLength = style == 'full'
                    ? match[0].length
                    : (style == 'comment'
                        ? match[0].length - offsetPos
                        : tagMatch.length);
                // We have found at least one anchor
                anchorsFound = true;
                let endPos = startPos + rangeLength;
                let comment = (match[MATCHER_COMMENT_INDEX] || "").trim();
                let display = "";
                const rawAttributeStr = match[MATCHER_ATTR_INDEX] || "[]";
                const attributes = this.parseAttributes(rawAttributeStr.slice(1, 1 + rawAttributeStr.length - 2), {
                    seq: lineNumber,
                });
                // Clean up the comment and adjust the endPos
                for (const endMatch of matchSuffix) {
                    if (comment.endsWith(endMatch)) {
                        comment = comment.slice(0, Math.max(0, comment.length - endMatch.length));
                        if (style == 'comment') {
                            endPos -= endMatch.length;
                        }
                        break;
                    }
                }
                // Handle the closing of a region
                if (isRegionEnd) {
                    if (!currRegion || currRegion.anchorTag != tagEntry.tag)
                        continue;
                    currRegion.setEndTag({
                        startIndex: startPos,
                        endIndex: endPos,
                        lineNumber: lineNumber,
                    });
                    currRegions.pop();
                    folds.push(new vscode_1.FoldingRange(currRegion.lineNumber - 1, lineNumber - 1, vscode_1.FoldingRangeKind.Comment));
                    continue;
                }
                // Construct the resulting string to display
                if (comment.length === 0) {
                    display = tagEntry.tag;
                }
                else if (displayInSidebar && tagEntry.behavior != "link") {
                    display = displayTagName ? (tagEntry.tag + ": " + comment) : comment;
                }
                else {
                    display = comment;
                }
                // Remove epics when tag is not workspace visible
                if (tagEntry.scope != "workspace") {
                    attributes.epic = undefined;
                }
                let anchor;
                // Create a regular or region anchor
                if (isRegionStart) {
                    anchor = new entryAnchorRegion_1.default(this, tagEntry.tag, display, startPos, endPos, match[0].length - 1, lineNumber, tagEntry.iconColor, tagEntry.scope, displayLineNumber, document, attributes);
                }
                else {
                    anchor = new entryAnchor_1.default(this, tagEntry.tag, display, startPos, endPos, match[0].length - 1, lineNumber, tagEntry.iconColor, tagEntry.scope, displayLineNumber, document, attributes);
                }
                // Push this region onto the stack
                if (isRegionStart) {
                    currRegions.push(anchor);
                }
                // Place this anchor on root or child level
                if (currRegion) {
                    currRegion.addChild(anchor);
                }
                else {
                    anchors.push(anchor);
                }
            }
            this.matcher.lastIndex = 0;
            this.anchorMaps.set(document, new anchorIndex_1.AnchorIndex(anchors));
        }
        catch (err) {
            AnchorEngine.output("Error: " + err.message);
            AnchorEngine.output(err.stack);
        }
        return anchorsFound;
    }
    /**
     * Returns the list of anchors parsed from the given
     * file.
     *
     * @param file The file URI
     * @returns The anchor array
     */
    async getAnchors(file) {
        const cached = this.anchorMaps.get(file)?.anchorTree;
        if (cached) {
            return cached;
        }
        else {
            await this.parse(file);
            return await this.getAnchors(file);
        }
    }
    /**
     * Refresh the visual representation of the anchors
     */
    refresh() {
        try {
            if (this._editor && this._config.tagHighlights.enabled) {
                const document = this._editor.document;
                const doc = document.uri;
                const index = this.anchorMaps.get(doc);
                const tags = new Map();
                const tagsEnd = new Map();
                // Create a mapping between tags and decorators
                for (const [tag, decorator] of this.anchorDecorators.entries()) {
                    tags.set(tag, [decorator, []]);
                }
                for (const [tag, decorator] of this.anchorEndDecorators.entries()) {
                    tagsEnd.set(tag, [decorator, []]);
                }
                // Create a function to handle decorating
                const applyDecorators = (anchors) => {
                    for (const anchor of anchors) {
                        const deco = tags.get(anchor.anchorTag)[1];
                        anchor.decorateDocument(document, deco);
                        if (anchor instanceof entryAnchorRegion_1.default) {
                            anchor.decorateDocumentEnd(document, tagsEnd.get(anchor.anchorTag)[1]);
                        }
                        if (anchor.children) {
                            applyDecorators(anchor.children);
                        }
                    }
                };
                // Start by decorating the root list
                if (index) {
                    applyDecorators(index.anchorTree);
                }
                // Apply all decorators to the document
                for (const decorator of tags.values()) {
                    this._editor.setDecorations(decorator[0], decorator[1]);
                }
                for (const decorator of tagsEnd.values()) {
                    this._editor.setDecorations(decorator[0], decorator[1]);
                }
            }
            // Reset the expansion arrays
            this.expandedFileTreeViewItems = [];
            this.expandedWorkspaceTreeViewItems = [];
            // Update the file trees
            this._onDidChangeLinkData.fire(undefined);
            this.updateFileAnchors();
            this.anchorsDirty = false;
        }
        catch (err) {
            AnchorEngine.output("Failed to refresh: " + err.message);
            AnchorEngine.output(err.stack);
        }
    }
    /**
     * Add a TextDocument mapping to the engine
     *
     * @param document TextDocument
     */
    addMap(document) {
        if (document.scheme !== "file") {
            return Promise.resolve(false);
        }
        // Make sure we have no duplicates
        for (const [doc, _] of this.anchorMaps.entries()) {
            if (doc.path == document.path) {
                this.anchorMaps.delete(doc);
            }
        }
        this.anchorMaps.set(document, anchorIndex_1.AnchorIndex.EMPTY);
        return this.parse(document);
    }
    /**
     * Remove a TextDocument mapping from the engine
     *
     * @param editor textDocument
     */
    removeMap(document) {
        if (document.scheme !== "file")
            return;
        this.anchorMaps.delete(document);
    }
    /**
     * Open a new webview panel listing out all configured
     * tags including their applied styles.
     */
    openTagListPanel() {
        const panel = vscode_1.window.createWebviewPanel("anchorList", "Comment Anchors Tags", {
            viewColumn: vscode_1.ViewColumn.One,
        });
        panel.webview.html = (0, anchorListView_1.createViewContent)(this, panel.webview);
    }
    /**
     * Jump to an anchor in the current document
     *
     * @param anchor The anchor to jump to
     */
    jumpToAnchor(anchor) {
        const selection = new vscode_1.Selection(anchor.lineNumber - 1, 999, anchor.lineNumber - 1, 999);
        this._editor.selection = selection;
        this._editor.revealRange(selection);
    }
    /**
     * Move the cursor to the anchor relative to the current position
     *
     * @param direction The direction
     */
    jumpToRelativeAnchor(direction) {
        const current = this._editor.selection.active.line + 1;
        const anchors = [...this.currentAnchors].sort((a, b) => a.lineNumber - b.lineNumber);
        if (direction == 'up') {
            for (let i = anchors.length - 1; i >= 0; i--) {
                const anchor = anchors[i];
                if (anchor.lineNumber < current) {
                    this.jumpToAnchor(anchor);
                    break;
                }
            }
        }
        else {
            for (const anchor of anchors) {
                if (anchor.lineNumber > current) {
                    this.jumpToAnchor(anchor);
                    break;
                }
            }
        }
    }
    onActiveEditorChanged(editor) {
        if (editor && editor.document.uri.scheme == "output")
            return;
        this._editor = editor;
        if (!this.anchorsLoaded)
            return;
        if (editor && !this.anchorMaps.has(editor.document.uri)) {
            // Bugfix - Replace duplicates
            for (const [document, _] of new Map(this.anchorMaps).entries()) {
                if (document.path.toString() == editor.document.uri.path.toString()) {
                    this.anchorMaps.delete(document);
                    false;
                    continue;
                }
            }
            this.anchorMaps.set(editor.document.uri, anchorIndex_1.AnchorIndex.EMPTY);
            this.parse(editor.document.uri).then(() => {
                this.refresh();
            });
        }
        else {
            this.refresh();
        }
    }
    onDocumentChanged(e) {
        if (!e.contentChanges || e.document.uri.scheme == "output")
            return;
        this.anchorsDirty = true;
        this._idleRefresh();
    }
    /**
     * Reads the document at the given Uri async
     *
     * @param path Document uri
     */
    readDocument(path) {
        return new Promise((success, reject) => {
            fs.readFile(path.fsPath, "utf8", (err, data) => {
                if (err) {
                    reject(err);
                }
                else {
                    success(data);
                }
            });
        });
    }
    /**
     * Alert subscribed listeners of a change in the file anchors tree
     */
    updateFileAnchors() {
        this._onDidChangeTreeData.fire(undefined);
        const anchors = this.currentAnchors.length;
        this.fileTreeView.badge = anchors > 0 ? {
            tooltip: 'File anchors',
            value: anchors
        } : undefined;
    }
}
exports.AnchorEngine = AnchorEngine;
//# sourceMappingURL=anchorEngine.js.map