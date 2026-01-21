"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnchorIndex = void 0;
/**
 * An index of all anchors found within a file
 */
class AnchorIndex {
    /** Constant empty index */
    static EMPTY = new AnchorIndex([]);
    /** A tree structure of entry anchors */
    anchorTree;
    /** Collection of anchors indexed by their content text*/
    textIndex = new Map();
    constructor(anchorTree) {
        this.anchorTree = anchorTree;
        this.indexAnchors(anchorTree);
    }
    /**
     * Index the given anchor array
     *
     * @param list The anchor list
     */
    indexAnchors(list) {
        for (const anchor of list) {
            this.textIndex.set(anchor.anchorText, anchor);
            if (anchor.children.length > 0) {
                this.indexAnchors(anchor.children);
            }
        }
    }
}
exports.AnchorIndex = AnchorIndex;
//# sourceMappingURL=anchorIndex.js.map