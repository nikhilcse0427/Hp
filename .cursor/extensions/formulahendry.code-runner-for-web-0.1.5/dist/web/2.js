"use strict";
(self["webpackChunkcode_runner_for_web"] = self["webpackChunkcode_runner_for_web"] || []).push([[2],{

/***/ 50:
/***/ ((module, exports) => {



// ref: https://github.com/tc39/proposal-global
var getGlobal = function () {
	// the only reliable means to get the global object is
	// `Function('return this')()`
	// However, this causes CSP violations in Chrome apps.
	if (typeof self !== 'undefined') { return self; }
	if (typeof window !== 'undefined') { return window; }
	if (typeof global !== 'undefined') { return global; }
	throw new Error('unable to locate global object');
}

var global = getGlobal();

module.exports = exports = global.fetch;

// Needed for TypeScript and Webpack.
if (global.fetch) {
	exports["default"] = global.fetch.bind(global);
}

exports.Headers = global.Headers;
exports.Request = global.Request;
exports.Response = global.Response;

/***/ })

}]);
//# sourceMappingURL=2.js.map