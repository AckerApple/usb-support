"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
exports.GameController = void 0;
var HID = require("node-hid");
var rxjs_1 = require("rxjs");
var GameControlEvents_1 = require("./GameControlEvents");
var GameController = /** @class */ (function (_super) {
    __extends(GameController, _super);
    function GameController() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.$data = new rxjs_1.Subject();
        _this.subs = new rxjs_1.Subscription();
        _this.tempAxisMemoryArray = [];
        return _this;
    }
    // device can be asked for state versus always reporting its state
    GameController.prototype.allowsInterfacing = function () {
        return this.meta.interface === 0 ? false : true;
    };
    GameController.prototype.onNextChangeHold = function (callback, timeMs) {
        var _this = this;
        if (timeMs === void 0) { timeMs = 2000; }
        var startState = this.lastData;
        var timeout;
        var listener = function () {
            if (timeout != undefined) {
                clearTimeout(timeout);
            }
            var lastChangedAt = _this.changedAt;
            timeout = setTimeout(function () {
                if (_this.changedAt === lastChangedAt && !_this.isCurrentState(startState)) {
                    callback();
                    sub.unsubscribe();
                }
            }, timeMs);
        };
        var sub = this.change.subscribe(listener);
    };
    GameController.prototype.promiseNextIdle = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (res, rej) {
                        return _this.onNextIdle(function (err, response) {
                            if (err) {
                                return rej(err);
                            }
                            res(response);
                        });
                    })];
            });
        });
    };
    GameController.prototype.onNextIdle = function (callback) {
        var _this = this;
        if (this.isIdle) {
            return callback(null, this);
        }
        var sub = this.$idle.subscribe(function () {
            callback(null, _this);
            sub.unsubscribe();
        });
        return this;
    };
    GameController.prototype.isCurrentState = function (state) {
        if (!state && !this.lastData) {
            return true;
        }
        if (!state || !this.lastData) {
            return false;
        }
        return this.lastData.find(function (data, index) { return state.length <= index || state[index] !== data; }) ? false : true;
    };
    GameController.prototype.listen = function () {
        var _this = this;
        if (this.listener) {
            return this; // already listening
        }
        if (!this.device) {
            if (this.meta) {
                this.device = this.tryConnection();
            }
            else {
                throw new Error("GameController.meta has not been set. Need vendorId and productId");
            }
        }
        var onNewData = function (data) {
            _this.onNewData(data);
        };
        var callback = whenCallbackChanges(onNewData, function (a) { return a.toString(); });
        this.listener = function (data) {
            _this.lastData = data;
            _this.$data.next(data);
            callback(data);
        };
        this.device.addListener("data", this.listener);
        return this;
    };
    GameController.prototype.tryConnection = function () {
        try {
            return new HID.HID(this.meta.path);
        }
        catch (err) {
            console.warn("Could not connect by path", err.message);
            return this.tryVendorProductConnection();
        }
    };
    GameController.prototype.tryVendorProductConnection = function () {
        try {
            return new HID.HID(this.meta.vendorId, this.meta.productId);
        }
        catch (err) {
            err.message = err.message + ("(vId:" + this.meta.vendorId + " pId:" + this.meta.productId + " " + this.meta.product + ")");
            err.tip = 'PROCESS MAY NEED TO RUN AS ROOT USER';
            console.error("Could not connect to device", err);
            console.warn(err.tip);
            throw err;
        }
    };
    GameController.prototype.close = function () {
        // this.device.off("data")
        // this.device.removeAllListeners();
        if (this.listener) {
            this.device.removeListener("data", this.listener);
            this.device.close();
            delete this.listener;
        }
        this.subs.unsubscribe();
        // delete this.device;
        // this.device.close();
    };
    GameController.prototype.mapIdle = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                if (this.allowsInterfacing()) {
                    return [2 /*return*/, Promise.resolve(this)];
                }
                return [2 /*return*/, new Promise(function (res, rej) {
                        var timeout = setTimeout(function () {
                            rej(new Error("Could not map idle state of " + _this.meta.product + " in timely fashion"));
                        }, 1000);
                        var dataReader = function (data) {
                            clearTimeout(timeout);
                            _this.idle = data;
                            res(_this);
                        };
                        _this.device.read(function (err, data) {
                            if (err) {
                                rej(new Error("Could not map idle state of " + _this.meta.product + " due to " + err.message));
                                return;
                            }
                            _this.idle = _this.lastData = data;
                            dataReader(data);
                        });
                        _this.subs.add(_this.$data.subscribe(dataReader));
                        var oneSub = _this.$data.subscribe(function (data) {
                            dataReader(data);
                            oneSub.unsubscribe();
                        });
                    })];
            });
        });
    };
    GameController.prototype.paramIdle = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (this.idle.length) {
                    return [2 /*return*/, Promise.resolve(this)];
                }
                return [2 /*return*/, this.mapIdle()];
            });
        });
    };
    GameController.prototype.getLastPins = function () {
        return __spreadArrays(this.lastData.map(function (v, i) { return v; }));
    };
    GameController.prototype.getLastPinsString = function () {
        return this.getLastPins().map(function (v, i) { return i + ":" + ("000" + v).slice(-3); }).join(" | ");
    };
    GameController.prototype.axisDataDiscoverer = function (data) {
        var _this = this;
        data.forEach(function (pinValue, pin) {
            for (var mPinIndex = _this.tempAxisMemoryArray.length - 1; mPinIndex >= 0; --mPinIndex) {
                var pinMemory = _this.tempAxisMemoryArray[mPinIndex];
                if (pinMemory.pin !== pin) {
                    continue;
                }
                // check cancel by min
                if (Math.abs(pinMemory.min - pinValue) > 10) {
                    _this.tempAxisMemoryArray.splice(mPinIndex, 1);
                    return;
                }
                // check cancel by max
                if (Math.abs(pinMemory.max - pinValue) > 10) {
                    _this.tempAxisMemoryArray.splice(mPinIndex, 1);
                    return;
                }
                // recording
                if (pinMemory.repeats === 5) {
                    // record its an axis
                    return;
                }
            }
            // todo, record new
            _this.tempAxisMemoryArray.push({
                updatedAt: Date.now(),
                repeats: 0,
                pin: pin,
                min: pinValue,
                max: pinValue
            });
        });
    };
    return GameController;
}(GameControlEvents_1["default"]));
exports.GameController = GameController;
function whenCallbackChanges(callback, eachArgument) {
    var args = [];
    return function () {
        var allArguments = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            allArguments[_i] = arguments[_i];
        }
        if (arguments.length !== args.length) {
            callback.apply(this, arguments);
        }
        else {
            eachArgument = eachArgument || function (a) { return a; };
            for (var index = arguments.length - 1; index >= 0; --index) {
                var newValue = eachArgument(arguments[index]);
                var oldValue = eachArgument(args[index]);
                var unmatched = oldValue != newValue;
                if (unmatched) {
                    callback.apply(this, arguments);
                    break;
                }
            }
        }
        args = arguments;
    };
}
//# sourceMappingURL=GameController.js.map