import { Subject } from 'rxjs';
import GameControlEvents from './GameControlEvents';
export interface IDevice {
    readSync: () => number[];
    read: (callback: (err: any, value: number[]) => any) => void;
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
    device: IDevice;
    $data: Subject<number[]>;
    listener: (data: number[]) => any;
    private subs;
    allowsInterfacing(): boolean;
    onNextChangeHold(callback: () => any, timeMs?: number): void;
    promiseNextIdle(): Promise<GameController>;
    onNextIdle(callback: (err: Error, value: GameController) => any): any;
    isCurrentState(state: number[]): boolean;
    listen(): this;
    tryConnection(): any;
    tryVendorProductConnection(): any;
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
}
