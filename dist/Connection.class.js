"use strict";
exports.__esModule = true;
exports.Connection = void 0;
var rxjs_1 = require("rxjs");
var Connection = /** @class */ (function () {
    function Connection() {
        var _this = this;
        this.retryInterval = 100;
        this.$connect = new rxjs_1.Subject(); // attempt to connect
        this.$connected = new rxjs_1.Subject(); // a connection was made
        this.$down = new rxjs_1.Subject();
        this.$closed = new rxjs_1.Subject();
        this.$failed = new rxjs_1.Subject();
        this.subs = new rxjs_1.Subscription();
        // when connected stop retry timers
        this.subs.add(this.$connected.subscribe(function () {
            clearInterval(_this.restartProcessId);
            _this.restartProcessId = 0;
        }));
        // when disconnected, keep trying to reconnect
        this.subs.add(this.$down.subscribe(function () {
            return _this.connect();
        }));
    }
    Connection.prototype.close = function () {
        this.subs.unsubscribe();
    };
    Connection.prototype.connect = function () {
        var _this = this;
        // already trying to connect?
        if (this.restartProcessId) {
            return this; // do not continue to try again
        }
        this.restartProcessId = setInterval(function () {
            _this.$connect.next();
        }, this.retryInterval);
        return this;
    };
    return Connection;
}());
exports.Connection = Connection;
//# sourceMappingURL=Connection.class.js.map