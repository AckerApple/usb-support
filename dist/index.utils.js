"use strict";
/** Files in here must be browser safe */
exports.__esModule = true;
exports.getDeviceLabel = exports.isDeviceController = exports.devicesMatch = exports.cleanseDeviceEvent = exports.eventsMatch = exports.isDeviceEventsSame = exports.savedControllerToConfigs = exports.getControlConfigByDevice = void 0;
function getControlConfigByDevice(configs, device) {
    var vendorId = String(device.vendorId);
    var productId = String(device.productId);
    var products = configs[vendorId];
    if (!products) {
        return;
    }
    return products[productId];
}
exports.getControlConfigByDevice = getControlConfigByDevice;
function savedControllerToConfigs(controller, controlConfigs) {
    if (controlConfigs === void 0) { controlConfigs = {}; }
    var _a = controller.meta, vendorId = _a.vendorId, productId = _a.productId;
    var vendorOb = controlConfigs[vendorId] = controlConfigs[vendorId] || {};
    vendorOb[productId] = controller;
    return controlConfigs;
}
exports.savedControllerToConfigs = savedControllerToConfigs;
function isDeviceEventsSame(device, event0, event1) {
    var castedEvent0 = cleanseDeviceEvent(device, event0);
    var castedEvent1 = cleanseDeviceEvent(device, event1);
    return eventsMatch(castedEvent0, castedEvent1);
}
exports.isDeviceEventsSame = isDeviceEventsSame;
function eventsMatch(event0, event1) {
    return event0.every(function (item, index) { return item === event1[index]; });
}
exports.eventsMatch = eventsMatch;
function cleanseDeviceEvent(device, event) {
    return event.map(function (number, index) {
        return cleanseDeviceEventPos(device, number, index);
    });
}
exports.cleanseDeviceEvent = cleanseDeviceEvent;
function cleanseDeviceEventPos(device, number, index) {
    var _a;
    return ((_a = device.ignoreBits) === null || _a === void 0 ? void 0 : _a.includes(index)) ? 0 : number;
}
function devicesMatch(device, lDevice) {
    return device === lDevice || device.productId === lDevice.productId && device.vendorId === lDevice.vendorId;
}
exports.devicesMatch = devicesMatch;
function isDeviceController(device) {
    return (device.usage === 5 && device.usagePage === 1)
        || (device.usage === 4 && device.usagePage === 1)
        || device.product.toLowerCase().indexOf("controller") >= 0
        || device.product.toLowerCase().indexOf("game") >= 0
        || device.product.toLowerCase().indexOf("joystick") >= 0;
}
exports.isDeviceController = isDeviceController;
function getDeviceLabel(device) {
    var _a;
    var stringRef = ((_a = device.product) === null || _a === void 0 ? void 0 : _a.trim()) || '';
    if (device.manufacturer) {
        stringRef += ' by ' + device.manufacturer;
    }
    return stringRef;
}
exports.getDeviceLabel = getDeviceLabel;
//# sourceMappingURL=index.utils.js.map