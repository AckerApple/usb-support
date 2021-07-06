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
exports.__esModule = true;
exports.isUsbError = exports.UsbConnection = void 0;
var usbDetect = require('usb-detection'); // todo: change to import
var InputControlMonitor_class_1 = require("./InputControlMonitor.class");
var Connection_class_1 = require("./Connection.class");
var index_utils_1 = require("./index.utils");
var UsbConnection = /** @class */ (function (_super) {
    __extends(UsbConnection, _super);
    function UsbConnection(controllerConfig) {
        var _this = _super.call(this) || this;
        _this.controllerConfig = controllerConfig;
        _this.monitor = new InputControlMonitor_class_1.InputControlMonitor();
        _this.listeners = {};
        _this.startUsbMonitoring();
        return _this;
    }
    UsbConnection.prototype.startUsbMonitoring = function () {
        var _this = this;
        // anytime its time to connect, lets do the connecting
        this.$connect.subscribe(function () {
            return _this.usbConnect();
        });
        // officially turns on monitoring
        usbDetect.startMonitoring();
        /*usbDetect.on('change', device => {
          console.info('usb change', getDeviceLabel(device))
        })*/
        /*usbDetect.on('error', (err) => {
          console.error('usb error', err)
        })*/
        // monitors when usb goes down
        this.listeners.uncaughtException = function (err) {
            if (isUsbError(err)) {
                return _this.$down.next(err);
            }
        };
        process.on('uncaughtException', this.listeners.uncaughtException);
        this.listeners.beforeExit = function () {
            // console.warn('server.beforeExit')
            usbDetect.stopMonitoring();
            _this.$closed.next();
            process.exit(1);
        };
        process.on('beforeExit', this.listeners.beforeExit);
        this.listeners.exit = function () {
            // console.warn('server.exit')
            usbDetect.stopMonitoring();
            _this.$closed.next();
            process.exit(1);
        };
        process.on('exit', this.listeners.exit);
        this.listeners.SIGINT = function () {
            // console.warn('server.SIGINT')
            usbDetect.stopMonitoring();
            _this.$closed.next();
            process.exit(1);
        };
        process.on('SIGINT', this.listeners.SIGINT);
    };
    UsbConnection.prototype.close = function () {
        _super.prototype.close.call(this);
        usbDetect.stopMonitoring();
        process.removeListener('uncaughtException', this.listeners.uncaughtException);
        process.removeListener('beforeExit', this.listeners.beforeExit);
        process.removeListener('exit', this.listeners.exit);
        process.removeListener('SIGINT', this.listeners.SIGINT);
    };
    UsbConnection.prototype.getDeviceName = function () {
        return index_utils_1.getDeviceLabel(this.controllerConfig.meta);
    };
    UsbConnection.prototype.usbConnect = function () {
        if (this.monitor.controllers.length) {
            this.monitor.reset();
        }
        try {
            this.monitor.monitorByConfig(this.controllerConfig);
            this.$connected.next();
            return this.controllerConfig;
        }
        catch (err) {
            this.$failed.next(err);
        }
    };
    return UsbConnection;
}(Connection_class_1.Connection));
exports.UsbConnection = UsbConnection;
function isUsbError(err) {
    return err.message.includes('HID') || err.message.includes('cannot open device');
}
exports.isUsbError = isUsbError;
//# sourceMappingURL=UsbConnection.class.js.map