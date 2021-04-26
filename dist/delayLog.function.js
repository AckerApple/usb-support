"use strict";
exports.__esModule = true;
function delayLog() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    setTimeout(function () { return console.log.apply(console, args); }, 300);
}
exports["default"] = delayLog;
//# sourceMappingURL=delayLog.function.js.map