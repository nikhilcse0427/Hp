"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseCustomAnchors = void 0;
/**
 * Parse and register custom anchors to the tagMap
 *
 * @param config The extension configuration
 * @param tagMap The tagMap reference
 */
function parseCustomAnchors(config, tagMap) {
    const legacy = config.tags.list || [];
    const custom = { ...config.tags.anchors };
    // Parse legacy configuration format
    for (const tag of legacy) {
        custom[tag.tag] = tag;
    }
    // Parse custom tags
    for (const [tag, config] of Object.entries(custom)) {
        const def = tagMap.get(tag) || {};
        const opts = { ...def, ...config };
        // Skip disabled default tags
        if (config.enabled === false) {
            tagMap.delete(tag);
            continue;
        }
        // Migrate the isRegion property
        if (opts.isRegion) {
            opts.behavior = "region";
        }
        // Migrate the styleComment property
        if (opts.styleComment) {
            opts.styleMode = "comment";
        }
        tagMap.set(tag, {
            ...opts,
            tag: tag
        });
    }
}
exports.parseCustomAnchors = parseCustomAnchors;
//# sourceMappingURL=customTags.js.map