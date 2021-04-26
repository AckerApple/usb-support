"use strict";
exports.__esModule = true;
exports.savedControllerToConfigs = exports.getControlConfigByDevice = exports.eventsMatch = exports.isDeviceEventsSame = exports.cleanseDeviceEvent = exports.devicesMatch = exports.isDeviceController = void 0;
function isDeviceController(device) {
    return (device.usage === 5 && device.usagePage === 1)
        || (device.usage === 4 && device.usagePage === 1)
        || device.product.toLowerCase().indexOf("controller") >= 0
        || device.product.toLowerCase().indexOf("game") >= 0
        || device.product.toLowerCase().indexOf("joystick") >= 0;
}
exports.isDeviceController = isDeviceController;
function devicesMatch(device, lDevice) {
    return device === lDevice || device.productId === lDevice.productId && device.vendorId === lDevice.vendorId;
}
exports.devicesMatch = devicesMatch;
function cleanseDeviceEvent(device, event) {
    return event.map(function (number, index) {
        return cleanseDeviceEventPos(device, number, index);
    });
}
exports.cleanseDeviceEvent = cleanseDeviceEvent;
function cleanseDeviceEventPos(device, number, index) {
    return device.ignoreBits.includes(index) ? 0 : number;
}
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
