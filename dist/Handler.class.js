"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.ControllerHandler = exports.getControlHander = exports.HandlerClass = void 0;
var index_1 = require("./index");
var enums_1 = require("./enums");
var index_utils_1 = require("./index.utils");
var index_utils_2 = require("./index.utils");
var usb_hid_1 = require("./usb-hid");
var rxjs_1 = require("rxjs");
var HandlerClass = /** @class */ (function () {
    function HandlerClass(controllerConfigs, listeners) {
        this.controllerConfigs = controllerConfigs;
        this.listeners = listeners;
        this.deviceEvent = new rxjs_1.Subject();
        this.error = new rxjs_1.Subject();
        this.deviceUnsubscribed = new rxjs_1.Subject();
        this.deviceListenActive = new rxjs_1.Subject();
        this.subs = new rxjs_1.Subscription();
        this.controlSubs = [];
        this.listDevices = usb_hid_1.listDevices;
    }
    HandlerClass.prototype.getControllerHandler = function (device, gameController) {
        var config = index_utils_2.getControlConfigByDevice(this.controllerConfigs, device);
        return new ControllerHandler(config, gameController);
    };
    HandlerClass.prototype.destroy = function () {
        this.subs.unsubscribe();
        this.listeners.forEach(function (control) { return control.close(); });
    };
    HandlerClass.prototype.paramDeviceSub = function (control) {
        if (this.isControlSubscribed(control)) {
            return;
        }
        this.subscribeToController(control);
        if (control.idle) {
            this.deviceEvent.next({ device: control.meta, event: control.idle });
        }
    };
    HandlerClass.prototype.subscribeToController = function (control) {
        var _this = this;
        var device = control.meta;
        // const config: DeviceProductLayout = getControlConfigByDevice(this.controllerConfigs, device)
        var controlHandler = this.getControllerHandler(device, control);
        var deviceSub = controlHandler.subscribe();
        this.subs.add(controlHandler.deviceEvent.subscribe(function (event) {
            return _this.deviceEvent.next({ device: device, event: event });
        }));
        this.controlSubs.push({
            control: control,
            sub: deviceSub
        });
        this.subs.add(deviceSub);
        return deviceSub;
    };
    HandlerClass.prototype.unsubscribeDevice = function (device) {
        var _this = this;
        var gameController = this.listeners.find(function (gc) { return index_utils_1.devicesMatch(gc.meta, device); });
        if (!gameController) {
            return;
        }
        this.listeners.find(function (gc, index) {
            if (index_utils_1.devicesMatch(gc.meta, device)) {
                _this.listeners.splice(index, 1);
                return true;
            }
        });
        gameController.close();
        this.controlSubs = this.controlSubs.filter(function (item) {
            if (index_utils_1.devicesMatch(item.control.meta, device)) {
                item.sub.unsubscribe();
                return false;
            }
            return true;
        });
        this.deviceUnsubscribed.next(device);
    };
    HandlerClass.prototype.listenToDevice = function (device) {
        return __awaiter(this, void 0, void 0, function () {
            var gameController;
            return __generator(this, function (_a) {
                gameController = this.listeners.find(function (gc) { return index_utils_1.devicesMatch(gc.meta, device); });
                if (!gameController) {
                    gameController = index_1.getGameControllerByMeta(device);
                    this.listeners.push(gameController);
                }
                gameController.$error.subscribe(function (err) {
                    console.error('controller error', err);
                });
                this.listenToController(gameController);
                return [2 /*return*/];
            });
        });
    };
    HandlerClass.prototype.writeToDevice = function (device, command) {
        return __awaiter(this, void 0, void 0, function () {
            var gameController;
            return __generator(this, function (_a) {
                gameController = this.listeners.find(function (gc) { return index_utils_1.devicesMatch(gc.meta, device); });
                if (!gameController) {
                    gameController = index_1.getGameControllerByMeta(device);
                    this.listeners.push(gameController);
                }
                gameController.write(command);
                return [2 /*return*/];
            });
        });
    };
    HandlerClass.prototype.listenToController = function (gameController) {
        // are we already subscribed?
        if (this.isControlSubscribed(gameController)) {
            return;
        }
        this.subscribeToController(gameController);
        this.deviceListenActive.next(gameController.meta);
    };
    HandlerClass.prototype.isControlSubscribed = function (controller) {
        // usbListeners
        return this.controlSubs.find(function (item) { return index_utils_1.devicesMatch(item.control.meta, controller.meta); });
    };
    HandlerClass.prototype.handleMessage = function (request) {
        var _this = this;
        switch (request.type) {
            case enums_1.SocketMessageType.LISTENTODEVICE:
                this.listenToDevice(request.data)["catch"](function (err) { return _this.error.next(err); });
                break;
            case enums_1.SocketMessageType.WRITETODEVICE:
                this.writeToDevice(request.data.device, request.data.command)["catch"](function (err) { return _this.error.next(err); });
                break;
            case enums_1.SocketMessageType.UNSUBSCRIBEDEVICE:
                this.unsubscribeDevice(request.data);
                break;
            default:
                console.error('Unknown message type ' + request.type);
        }
    };
    return HandlerClass;
}());
exports.HandlerClass = HandlerClass;
function getControlHander(config) {
    var control = index_1.getGameControllerByMeta(config.meta);
    return new ControllerHandler(config, control);
}
exports.getControlHander = getControlHander;
var ControllerHandler = /** @class */ (function () {
    function ControllerHandler(config, control) {
        this.config = config;
        this.control = control;
        this.deviceEvent = new rxjs_1.Subject();
        this.subs = new rxjs_1.Subscription();
    }
    ControllerHandler.prototype.subscribe = function () {
        var _this = this;
        this.control.listen(); // new HID.HID call
        var deviceSub = this.control.change.subscribe(function (event) {
            if (_this.config) {
                event = index_utils_1.cleanseDeviceEvent(_this.config, event);
                if (_this.lastEvent && index_utils_1.eventsMatch(event, _this.lastEvent)) {
                    return; // no real change. Perhaps ignored pins
                }
                _this.lastEvent = event;
            }
            _this.deviceEvent.next(event);
        });
        this.subs.add(deviceSub);
        return deviceSub;
    };
    return ControllerHandler;
}());
exports.ControllerHandler = ControllerHandler;
//# sourceMappingURL=Handler.class.js.map