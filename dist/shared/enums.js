"use strict";
exports.__esModule = true;
exports.SocketMessageType = void 0;
var SocketMessageType;
(function (SocketMessageType) {
    // client side
    SocketMessageType["UNSUBSCRIBEDEVICE"] = "unsubscribeDevice";
    SocketMessageType["LISTENTODEVICE"] = "listenToDevice";
    SocketMessageType["WRITETODEVICE"] = "writeToDevice";
    SocketMessageType["REFRESH"] = "refresh";
    SocketMessageType["GETSAVEDCONTROLLERS"] = "getSavedControllers";
    SocketMessageType["SAVECONTROLLERS"] = "save_controllers";
    // server side
    SocketMessageType["DEVICEEVENT_CHANGE"] = "deviceEvent.change";
    SocketMessageType["LISTENERS"] = "listeners";
    SocketMessageType["SAVEDCONTROLLERS"] = "savedControllers";
    SocketMessageType["DEVICES"] = "devices";
    SocketMessageType["ERROR"] = "error";
})(SocketMessageType = exports.SocketMessageType || (exports.SocketMessageType = {}));
//# sourceMappingURL=enums.js.map