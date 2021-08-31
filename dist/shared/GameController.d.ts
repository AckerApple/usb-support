import * as HID from 'node-hid';
import { Subject } from 'rxjs';
import GameControlEvents from './GameControlEvents';
export interface IDevice {
    sendFeatureReport: (command: any[]) => any;
    readSync: () => number[];
    read: (callback: (err: Error, value: number[]) => any) => void;
    listenerCount: () => number;
    eventNames: () => string[];
    addListener: (eventName: string, callback: (...args: any[]) => any) => any;
    removeAllListeners: () => any;
    removeListener: (eventType: string, listener: (...args: any[]) => any) => any;
    resume: () => any;
    pause: () => any;
    on: (type: string, data: any) => any;
    close: () => any;
}
export interface ISubscriber {
    unsubscribe: () => any;
}
export declare class GameController extends GameControlEvents {
    device?: HID.HID;
    $data: Subject<number[]>;
    listener?: (data: number[]) => any;
    private subs;
    $error: Subject<unknown>;
    allowsInterfacing(): boolean;
    onNextChangeHold(callback: () => any, timeMs?: number): void;
    promiseNextIdle(): Promise<GameController>;
    onNextIdle(callback: (err: Error | null, value: GameController) => any): any;
    isCurrentState(state: number[]): boolean;
    paramDeviceConnect(): HID.HID | undefined;
    listen(): this;
    tryConnection(): HID.HID | undefined;
    tryVendorProductConnection(): HID.HID | undefined;
    close(): void;
    mapIdle(): Promise<GameController>;
    paramIdle(): Promise<GameController>;
    getLastPins(): number[];
    getLastPinsString(): string;
    tempAxisMemoryArray: {
        updatedAt: number;
        repeats: number;
        pin: number;
        min: number;
        max: number;
    }[];
    axisDataDiscoverer(data: any): void;
    write(command: any[]): void;
}
