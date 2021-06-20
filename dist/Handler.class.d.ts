import { ControllerConfigs, DeviceProductLayout, IDeviceMeta, WssMessage } from './typings';
import { GameController } from './GameController';
import { listDevices } from './usb-hid';
import { Subject, Subscription } from 'rxjs';
export declare class HandlerClass {
    controllerConfigs?: ControllerConfigs;
    listeners?: GameController[];
    deviceEvent: Subject<{
        device: IDeviceMeta;
        event: number[];
    }>;
    error: Subject<Error>;
    deviceUnsubscribed: Subject<IDeviceMeta>;
    deviceListenActive: Subject<IDeviceMeta>;
    subs: Subscription;
    controlSubs: {
        control: GameController;
        sub: Subscription;
    }[];
    listDevices: typeof listDevices;
    constructor(controllerConfigs?: ControllerConfigs, listeners?: GameController[]);
    getControllerHandler(device: IDeviceMeta, gameController: GameController): ControllerHandler;
    destroy(): void;
    paramDeviceSub(control: GameController): void;
    subscribeToController(control: GameController): Subscription;
    unsubscribeDevice(device: IDeviceMeta): void;
    listenToDevice(device: IDeviceMeta): Promise<void>;
    writeToDevice(device: IDeviceMeta, command: any[]): Promise<void>;
    listenToController(gameController: GameController): void;
    isControlSubscribed(controller: GameController): {
        control: GameController;
        sub: Subscription;
    };
    handleMessage(request: WssMessage): void;
}
export declare function getControlHander(config: DeviceProductLayout): ControllerHandler;
export declare class ControllerHandler {
    config: DeviceProductLayout;
    control: GameController;
    lastEvent: number[];
    deviceEvent: Subject<number[]>;
    subs: Subscription;
    constructor(config: DeviceProductLayout, control: GameController);
    subscribe(): Subscription;
}
