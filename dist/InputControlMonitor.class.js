"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
exports.__esModule = true;
exports.InputControlMonitor = void 0;
var rxjs_1 = require("rxjs");
var index_1 = require("./index");
var index_utils_1 = require("./index.utils");
var InputControlMonitor = /** @class */ (function () {
    function InputControlMonitor() {
        this.$change = new rxjs_1.Subject();
        this.subs = new rxjs_1.Subscription();
        this.lastPressed = [];
        this.controllers = []; // maybe unused
    }
    InputControlMonitor.prototype.monitorByConfig = function (config) {
        var handler = this.getControlHandlerByConfig(config);
        return this.monitorControl(handler);
    };
    InputControlMonitor.prototype.getControlHandlerByConfig = function (config) {
        return (0, index_1.getControlHander)(config);
    };
    InputControlMonitor.prototype.reset = function () {
        /* maybe unused */
        this.controllers.forEach(function (control) {
            return control.subs.unsubscribe();
        });
        this.controllers.length = 0;
        /* end: maybe unused */
        this.subs.unsubscribe();
        // cause new subscription to work
        this.subs = new rxjs_1.Subscription();
    };
    InputControlMonitor.prototype.monitorControl = function (controller) {
        var _this = this;
        // build a map of every possible button combination
        var possibleButtons = (0, index_utils_1.getPressMapByController)(controller.config);
        this.subs.add(controller.deviceEvent.subscribe(function (deviceEvent) {
            // todo: use a map to decode instead of runtime
            // this.lastPressed = decodeDeviceMetaState(controller.config, deviceEvent)
            var bitKey = deviceEvent.join(' ');
            var pressed = possibleButtons[bitKey];
            _this.lastPressed = __spreadArray([], (pressed || []), true); // clone incase others alter whats return (performance hit)
            _this.$change.next(_this.lastPressed);
        }));
        this.subs.add(controller.subscribe());
        return this;
    };
    return InputControlMonitor;
}());
exports.InputControlMonitor = InputControlMonitor;
/*function getPossibleBtnMap(
  config: DeviceProductLayout
): {[numbers: string]: string[]} {
  const possibles = sumSets()
}*/ 
//# sourceMappingURL=InputControlMonitor.class.js.map