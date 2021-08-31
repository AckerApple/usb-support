"use strict";
/** Files in here must be browser safe */
exports.__esModule = true;
exports.sumSets = exports.getDeviceLabel = exports.isDeviceController = exports.devicesMatch = exports.cleanseDeviceEvent = exports.eventsMatch = exports.isDeviceEventsSame = exports.savedControllerToConfigs = exports.getControlConfigByDevice = void 0;
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
    if ((device.usage === 5 && device.usagePage === 1)
        || (device.usage === 4 && device.usagePage === 1)) {
        return true;
    }
    if (!device.product) {
        return false;
    }
    return device.product.toLowerCase().indexOf("controller") >= 0
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
function sumSets(numsToSum) {
    var sums = []; // every possible sum
    var sets = []; // each index matches sums
    function SubSets(read, // starts with no values
    queued // starts with all values
    ) {
        if (read.length) {
            var total = read.reduce(function (a, b) { return a + b; }, 0);
            sums.push(total); // record result of combing
            sets.push(read.slice()); // clone read array
        }
        if (read.length > 1) {
            SubSets(read.slice(1, read.length), []);
        }
        if (queued.length === 0) {
            return;
        }
        var next = queued[0];
        var left = queued.slice(1);
        SubSets(read.concat(next), left); // move one over at a time
    }
    // igniter
    SubSets([], numsToSum);
    return { sums: sums, sets: sets };
}
exports.sumSets = sumSets;
//# sourceMappingURL=index.utils.js.map