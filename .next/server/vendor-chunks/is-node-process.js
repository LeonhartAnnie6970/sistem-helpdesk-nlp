"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
exports.id = "vendor-chunks/is-node-process";
exports.ids = ["vendor-chunks/is-node-process"];
exports.modules = {

/***/ "(rsc)/./node_modules/is-node-process/lib/index.mjs":
/*!****************************************************!*\
  !*** ./node_modules/is-node-process/lib/index.mjs ***!
  \****************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   isNodeProcess: () => (/* binding */ isNodeProcess)\n/* harmony export */ });\n// src/index.ts\nfunction isNodeProcess() {\n  if (typeof navigator !== \"undefined\" && navigator.product === \"ReactNative\") {\n    return true;\n  }\n  if (typeof process !== \"undefined\") {\n    const type = process.type;\n    if (type === \"renderer\" || type === \"worker\") {\n      return false;\n    }\n    return !!(process.versions && process.versions.node);\n  }\n  return false;\n}\n\n//# sourceMappingURL=index.mjs.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvaXMtbm9kZS1wcm9jZXNzL2xpYi9pbmRleC5tanMiLCJtYXBwaW5ncyI6Ijs7OztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFHRTtBQUNGIiwic291cmNlcyI6WyJDOlxcVXNlcnNcXEFTVVNcXE9uZURyaXZlXFxEb2N1bWVudHNcXFBST0pFQ1RcXHNpc3RlbS1oZWxwZGVzay1ubHAtc2pwbFxcbm9kZV9tb2R1bGVzXFxpcy1ub2RlLXByb2Nlc3NcXGxpYlxcaW5kZXgubWpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIHNyYy9pbmRleC50c1xuZnVuY3Rpb24gaXNOb2RlUHJvY2VzcygpIHtcbiAgaWYgKHR5cGVvZiBuYXZpZ2F0b3IgIT09IFwidW5kZWZpbmVkXCIgJiYgbmF2aWdhdG9yLnByb2R1Y3QgPT09IFwiUmVhY3ROYXRpdmVcIikge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG4gIGlmICh0eXBlb2YgcHJvY2VzcyAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgIGNvbnN0IHR5cGUgPSBwcm9jZXNzLnR5cGU7XG4gICAgaWYgKHR5cGUgPT09IFwicmVuZGVyZXJcIiB8fCB0eXBlID09PSBcIndvcmtlclwiKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiAhIShwcm9jZXNzLnZlcnNpb25zICYmIHByb2Nlc3MudmVyc2lvbnMubm9kZSk7XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufVxuZXhwb3J0IHtcbiAgaXNOb2RlUHJvY2Vzc1xufTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWluZGV4Lm1qcy5tYXAiXSwibmFtZXMiOltdLCJpZ25vcmVMaXN0IjpbMF0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/is-node-process/lib/index.mjs\n");

/***/ })

};
;