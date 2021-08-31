"use strict";
exports.__esModule = true;
exports.InputControlMonitor = void 0;
var rxjs_1 = require("rxjs");
var index_1 = require("./index");
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
        return index_1.getControlHander(config);
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
        // const possibleButtons = getPossibleBtnMap(controller)
        var _this = this;
        this.subs.add(controller.deviceEvent.subscribe(function (deviceEvent) {
            // todo: use a map to decode instead of runtime
            _this.lastPressed = index_1.decodeDeviceMetaState(controller.config, deviceEvent);
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