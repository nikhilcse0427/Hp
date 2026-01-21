"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPackageJSON = getPackageJSON;
// @ts-expect-error don't worry about the type.
function getPackageJSON(context) {
    return context.extension.packageJSON;
}
//# sourceMappingURL=getPackageJSON.js.map