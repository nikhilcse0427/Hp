"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createJSONExport = exports.createTableExport = void 0;
const extension_1 = require("../extension");
const flattener_1 = require("./flattener");
const sync_1 = require("csv-stringify/sync");
function createTableExport() {
    const rows = [];
    for (const [file, anchors] of extension_1.anchorEngine.anchorMaps.entries()) {
        const fullList = (0, flattener_1.flattenAnchors)(anchors.anchorTree);
        const filePath = file.fsPath;
        for (const anchor of fullList) {
            rows.push({
                Filename: filePath,
                Line: anchor.lineNumber,
                Tag: anchor.anchorTag,
                Text: anchor.anchorText,
                Id: anchor.attributes.id,
                Epic: anchor.attributes.epic,
            });
        }
    }
    return (0, sync_1.stringify)(rows, {
        header: true,
        columns: [
            'Filename',
            'Line',
            'Tag',
            'Text',
            'Id',
            'Epic'
        ]
    });
}
exports.createTableExport = createTableExport;
function createJSONExport() {
    const fileMap = {};
    for (const [file, anchors] of extension_1.anchorEngine.anchorMaps.entries()) {
        const fullList = (0, flattener_1.flattenAnchors)(anchors.anchorTree);
        fileMap[file.fsPath] = fullList.map(anchor => ({
            tag: anchor.anchorTag,
            text: anchor.anchorText,
            line: anchor.lineNumber,
            id: anchor.attributes.id,
            epic: anchor.attributes.epic,
        }));
    }
    return JSON.stringify(fileMap, null, 2);
}
exports.createJSONExport = createJSONExport;
//# sourceMappingURL=exporting.js.map