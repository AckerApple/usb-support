"use strict";
exports.__esModule = true;
exports.Connection = void 0;
var rxjs_1 = require("rxjs");
var Connection = /** @class */ (function () {
    function Connection() {
        var _this = this;
        this.retryInterval = 100;
        this.$connect = new rxjs_1.Subject();
        this.$connected = new rxjs_1.Subject();
        this.$down = new rxjs_1.Subject();
        this.$closed = new rxjs_1.Subject();
        this.$failed = new rxjs_1.Subject();
        this.subs = new rxjs_1.Subscription();
        this.subs.add(this.$connected.subscribe(function () {
            clearInterval(_this.restartProcessId);
            _this.restartProcessId = 0;
        }));
        this.subs.add(this.$down.subscribe(function () {
            return _this.connect();
        }));
    }
    Connection.prototype.close = function () {
        this.subs.unsubscribe();
    };
    Connection.prototype.connect = function () {
        var _this = this;
        console.log('check to restart', this.retryInterval);
        if (this.restartProcessId) {
            return;
        }
        this.restartProcessId = setInterval(function () {
            try {
                _this.$connect.next();
            }
            catch (err) {
                // console.error('error reconnecting to usb control', err.message)
            }
        }, this.retryInterval);
    };
    return Connection;
}());
exports.Connection = Connection;
//# sourceMappingURL=Connection.class.js.map