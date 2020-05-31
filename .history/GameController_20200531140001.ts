import * as HID from 'node-hid';
import { EventEmitter } from 'events';

interface IDevice {
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

export class GameController {
    device: {
        on: (type: string, data: any) => any;
        close: () => any;
    };

    listing: IDevice = {} as IDevice;

    events: EventEmitter = new EventEmitter(); // change
    lastData: number[] = [];
    changedAt: number; // last button
    idle: number[] = [];
    
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

    listen() {
        const onNewData = (data) => {
            this.events.emit("change", data);
            this.changedAt = Date.now();
        }
        const callback = whenCallbackChanges(onNewData, (a) => a.toString());
        this.device.on("data", (data) => {
            this.lastData = data;
            this.events.emit("data", data);
            callback(data)
        });

        return this;
    }

    close() {
        this.device.close();
        this.events.removeAllListeners();
    }

    mapIdle() {
        this.events.once("data", () => this.idle = this.lastData);
        return this;
    }

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
                if (oldValue != newValue) {
                    callback.apply(this, arguments);
                    break;
                }
            }
        }
        args = arguments;
    }
}
