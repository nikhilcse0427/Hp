"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupCompletionProvider = void 0;
const vscode_1 = require("vscode");
class TagCompletionProvider {
    engine;
    constructor(engine) {
        this.engine = engine;
    }
    provideCompletionItems(document, position, _token, context) {
        const ret = new vscode_1.CompletionList();
        const config = this.engine._config;
        const separator = config.tags.separators[0];
        const endTag = config.tags.endTag;
        const prefixes = config.tags.matchPrefix;
        const linePrefix = document.lineAt(position.line).text.slice(0, position.character);
        const isAuto = context.triggerKind === vscode_1.CompletionTriggerKind.TriggerCharacter;
        // only match exact prefixes
        if (isAuto && !prefixes.some((prefix) => linePrefix.endsWith(prefix))) {
            return undefined;
        }
        for (const tag of this.engine.tags.values()) {
            const name = `${tag.tag} Anchor`;
            const item = new vscode_1.CompletionItem(name, vscode_1.CompletionItemKind.Event);
            item.insertText = tag.tag + separator;
            item.detail = `Insert ${tag.tag} anchor`;
            ret.items.push(item);
            if (tag.behavior == "region") {
                const endItem = new vscode_1.CompletionItem(endTag + name, vscode_1.CompletionItemKind.Event);
                endItem.insertText = endTag + tag.tag;
                endItem.detail = `Insert ${endTag + tag.tag} comment anchor`;
                item.keepWhitespace = true;
                ret.items.push(endItem);
            }
        }
        return ret;
    }
}
function setupCompletionProvider(engine) {
    const prefixes = engine._config.tags.matchPrefix;
    const triggers = [...new Set(prefixes.map((p) => p.at(-1)))];
    return vscode_1.languages.registerCompletionItemProvider({ language: "*" }, new TagCompletionProvider(engine), ...triggers);
}
exports.setupCompletionProvider = setupCompletionProvider;
//# sourceMappingURL=completionProvider.js.map