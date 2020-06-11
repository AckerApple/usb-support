import * as HID from 'node-hid';
import { EventEmitter } from 'events';
import { promisify } from 'util';

export interface IDevice {
    readSync: () => number[];
    read: (callback: (err, value: number[]) => any) => void;
    listenerCount: () => number;
    eventNames: () => string[];
    addListener: (eventName: string, callback: (...args) => any) => any;
    removeAllListeners: () => any;
    removeListener: (eventType: string, listener: (...args) => any) => any
    resume: () => any;
    pause: () => any;
    on: (type: string, data: any) => any;
    close: () => any;
}

export interface IDeviceMeta {
    interface: number;
    usage: number;
    usagePage: number;
    productId: number;
    vendorId: number;
    manufacturer: string;
    product: string;
}

interface IButtonState {
    pos: number;
    value: number;
    idle: number;
    updatedAt: number;
}

export interface ISubscriber {
    unsubscribe: () => any
}

export class GameController {
    listener: (data: number[]) => any
    device: IDevice;
    
    deviceMeta: IDeviceMeta

    events: EventEmitter = new EventEmitter(); // change, idle, notIdle
    lastData: number[] = [];
    changedAt: number; // last button
    idle: number[] = [];
    isIdle: boolean;

    // device can be asked for state versus always reporting its state
    allowsInterfacing() {
        return this.deviceMeta.interface === 0 ? false : true;
    }
    
    map: { [string: string]: IButtonState | null } = {
        up: null,
        down: null,
        left: null,
        right: null,
        a: null,
        b: null,
        select: null,
        start: null
    };

    subscribe(eventType: string, callback: (...args) => any): ISubscriber {
        const listener = (...args) => {
            callback(...args);
        };

        this.events.addListener(eventType, listener);

        return {
            unsubscribe: () => {
                this.events.removeListener(eventType, listener);
            }
        };
    }

    onNextChangeHold(callback: () => any, timeMs: number = 2000) {
        const startState = this.lastData;
        let timeout;

        const listener = () => {
            if (timeout != undefined) {
                clearTimeout(timeout);
            }

            const lastChangedAt = this.changedAt;
            
            timeout = setTimeout(() => {
                if (this.changedAt === lastChangedAt && !this.isCurrentState(startState)) {
                    callback();
                    sub.unsubscribe();
                }
            }, timeMs);
        }

        const sub = this.subscribe("change", listener);
    }

    async promiseNextIdle(): Promise<GameController> {
        return promisify(this.onNextIdle.bind(this))();
    }

    onNextIdle(callback: (err: Error, value: GameController) => any) {
        if (this.isIdle) {
            return callback(null, this);
        }

        const sub = this.subscribe("idle", () => {
            callback(null, this);
            sub.unsubscribe();
        });

        return this;
    }

    isCurrentState(state: number[]) {
        if (!state && !this.lastData) {
            return true;
        }

        if (!state || !this.lastData) {
            return false;
        }

        return this.lastData.find((data,index) => state.length <= index || state[index] !== data) ? false : true
    }

    listen() {
        if (this.listener) {
            return this; // already listening
        }

        if (!this.device) {
            if (this.deviceMeta) {                
                try {
                    this.device = new HID.HID(this.deviceMeta.vendorId, this.deviceMeta.productId);
                } catch (err) {
                    err.message = err.message + `(${this.deviceMeta.product})`
                    throw err;
                }
            } else {
                throw new Error("GameController.deviceMeta has not been set. Need vendorId and productId");
            }
        }

        const onNewData = (data) => {
            this.changedAt = Date.now();
            
            if (this.idle.length || this.deviceMeta.interface == -1) {
                this.isIdle = this.determineIdleStateBy(data);

                if (this.isIdle) {
                    this.events.emit("idle");
                } else {
                    this.events.emit("notIdle");
                }
            }

            this.events.emit("change", data);
        }
        const callback = whenCallbackChanges(onNewData, (a) => a.toString());
        
        this.listener = (data: number[]) => {
            this.lastData = data;
            this.events.emit("data", data);
            callback(data)
        };
        
        this.device.addListener("data", this.listener);

        return this;
    }

    close() {
        // this.device.off("data")
        // this.device.removeAllListeners();
        if (this.listener) {
            this.device.removeListener("data", this.listener);
            delete this.listener;
        }
        this.events.removeAllListeners();
        // delete this.device;
        // this.device.close();
    }

    async mapIdle() {
        if (this.allowsInterfacing()) {
            return Promise.resolve();
        }

        return new Promise((res, rej) => {
            const timeout = setTimeout(() => {
                rej(new Error(`Could not map idle state of ${this.deviceMeta.product} in timely fashion`))
            }, 1000);

            const dataReader = (data) => {
                clearTimeout(timeout);
                this.idle = data;
                res();
                this.events.removeListener("data", dataReader);
            };

            this.device.read((err, data) => {
                if (err) {
                    rej(new Error(`Could not map idle state of ${this.deviceMeta.product} due to ${err.message}`))
                    return;
                }

                this.idle = this.lastData = data;
                dataReader(data);
            });
            
            /*
            console.log("Lets read sync");
            const readSync = this.device.readSync();
            console.log("readSync", readSync)
            */

            this.events.on("data", dataReader);
            this.events.once("data", dataReader);
        });
    }

    async paramIdle() {
        if (this.idle.length) {
            return Promise.resolve();
        }

        return this.mapIdle();
    }

    // returns which bit buckets do not match
    determineIdleStateBy(data: number[]): boolean {
        if (this.deviceMeta.interface == -1) {
            return this.determineInterfaceIdleState();
        }

        const rtn: { [index: number]: number } = {};

        for (let index = this.idle.length - 1; index >= 0; --index) {
            const item = this.idle[index];
            if (data[index] !== item) {
                return false; // its not idle
            }
        }

        return true;
    }

    determineInterfaceIdleState(): boolean {
        for (let index = this.lastData.length - 3; index >= 0; --index) {
            if (this.lastData[index]) {
                return false; // its not idle
            }
        }
        return true;
    }

    // returns which bit buckets do not match
    filterIdleDifferences(data: number[]): { [index: number]: number } {
        const rtn: { [index: number]: number } = {};

        this.idle.forEach((item, index) => {
            if (data[index] !== item) {
                rtn[index] = data[index];
            }
        });

        return rtn;
    }
}

function whenCallbackChanges(callback, eachArgument) {
    let args: any = [];

    return function (...allArguments) {
        if (arguments.length !== args.length) {
            callback.apply(this, arguments);
        } else {
            eachArgument = eachArgument || function (a) { return a };
            for (let index = arguments.length - 1; index >= 0; --index) {
                const newValue = eachArgument(arguments[index]);
                const oldValue = eachArgument(args[index]);
                const unmatched = oldValue != newValue;
                if (unmatched) {
                    callback.apply(this, arguments);
                    break;
                }
            }
        }
        args = arguments;
    }
}
