"use strict";
/** Files in here must be browser safe */
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
exports.getPressMapByController = exports.sumSets = exports.getDeviceLabel = exports.isDeviceController = exports.devicesMatch = exports.cleanseDeviceEvent = exports.eventsMatch = exports.isDeviceEventsSame = exports.savedControllerToConfigs = exports.getControlConfigByDevice = void 0;
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
/** returns every combination of combing positions of an array */
function sumSets(numsToSum, $sum) {
    if ($sum === void 0) { $sum = function (items) { return items.reduce(function (a, b) { return a + b; }, 0); }; }
    var sums = []; // every possible sum (typically single number value)
    var sets = []; // each index matches sums (the items in sum)
    function SubSets(read, // starts with no values
    queued // starts with all values
    ) {
        if (read.length) {
            var total = $sum(read); // read.reduce($sum as any, startValue) as any
            sums.push(total); // record result of combing
            sets.push(read.slice()); // clone read array
        }
        if (read.length > 1) {
            SubSets(read.slice(1), []);
        }
        if (queued.length === 0) {
            return;
        }
        var next = queued[0];
        var left = queued.slice(1);
        var newReads = __spreadArrays(read, [next]);
        SubSets(newReads, left); // move one over at a time
    }
    // igniter
    SubSets([], numsToSum);
    return { sums: sums, sets: sets };
}
exports.sumSets = sumSets;
/** a map of all possible button presses */
function getPressMapByController(controller) {
    var data = Object.entries(controller.map);
    var idle = controller.idle ? controller.idle : [0, 0, 0, 0, 0, 0, 0, 0];
    var results = sumSets(data, function (items) {
        var idleClone = idle.slice();
        var processor = function (set) {
            var item = set[1];
            idleClone[item.pos] = idleClone[item.pos] + item.value - item.idle;
        };
        items.forEach(processor);
        return idleClone;
    });
    var namedSets = results.sets.map(function (item) { return item.map(function (btn) { return btn[0]; }); });
    var output = results.sums.reduce(function (all, now, index) {
        all[now.join(' ')] = namedSets[index];
        return all;
    }, {});
    output[idle.join(' ')] = [];
    return output;
}
exports.getPressMapByController = getPressMapByController;
//# sourceMappingURL=index.utils.js.map