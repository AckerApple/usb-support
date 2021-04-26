"use strict";
exports.__esModule = true;
exports.listGameDevices = exports.listDevices = void 0;
var HID = require("node-hid");
var index_utils_1 = require("./index.utils");
function listDevices() {
    return HID.devices().sort(function (a, b) { return a.vendorId - b.vendorId + a.productId - b.productId; });
}
exports.listDevices = listDevices;
function listGameDevices() {
    return listDevices().map(function (device, index) { return ({ device: device, index: index }); }).filter(function (item) { return index_utils_1.isDeviceController(item.device); });
}
exports.listGameDevices = listGameDevices;
