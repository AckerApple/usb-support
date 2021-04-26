"use strict";
exports.__esModule = true;
exports.GameControlEvents = void 0;
// import { EventEmitter } from 'events';
var rxjs_1 = require("rxjs");
var GameControlEvents = /** @class */ (function () {
    function GameControlEvents() {
        this.lastData = [];
        this.idle = [];
        // events: EventEmitter = new EventEmitter(); // change, idle, notIdle
        this.$idle = new rxjs_1.Subject();
        this.notIdle = new rxjs_1.Subject();
        this.change = new rxjs_1.Subject();
        this.map = {
            up: null,
            down: null,
            left: null,
            right: null,
            a: null,
            b: null,
            select: null,
            start: null
        };
    }
    GameControlEvents.prototype.onNewData = function (data) {
        this.changedAt = Date.now();
        if (this.idle.length || this.meta.interface == -1) {
            this.isIdle = this.determineIdleStateBy(data);
            if (this.isIdle) {
                this.$idle.next();
            }
            else {
                this.notIdle.next();
            }
        }
        var length = data.length;
        var bits = [];
        while (bits.length < length) {
            bits.push(data[bits.length]);
        }
        this.change.next(bits);
    };
    // returns which bit buckets do not match
    GameControlEvents.prototype.determineIdleStateBy = function (data) {
        if (this.meta.interface == -1) {
            return this.determineInterfaceIdleState();
        }
        var rtn = {};
        for (var index = this.idle.length - 1; index >= 0; --index) {
            var item = this.idle[index];
            if (data[index] !== item) {
                return false; // its not idle
            }
        }
        return true;
    };
    GameControlEvents.prototype.determineInterfaceIdleState = function () {
        for (var index = this.lastData.length - 3; index >= 0; --index) {
            if (this.lastData[index]) {
                return false; // its not idle
            }
        }
        return true;
    };
    // returns which bit buckets do not match
    GameControlEvents.prototype.filterIdleDifferences = function (data) {
        var rtn = {};
        this.idle.forEach(function (item, index) {
            if (data[index] !== item) {
                rtn[index] = data[index];
            }
        });
        return rtn;
    };
    return GameControlEvents;
}());
exports.GameControlEvents = GameControlEvents;
exports["default"] = GameControlEvents;
//# sourceMappingURL=GameControlEvents.js.map