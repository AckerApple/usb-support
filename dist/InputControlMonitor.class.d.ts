import { Subscription, Subject } from 'rxjs';
import { ControllerHandler } from './Handler.class';
import { DeviceProductLayout } from './typings';
export declare class InputControlMonitor {
    $change: Subject<string[]>;
    $unpressed: Subject<string[]>;
    $pressed: Subject<string[]>;
    subs: Subscription;
    lastPressed: string[];
    controllers: ControllerHandler[];
    monitorByConfig(config: DeviceProductLayout): this;
    getControlHandlerByConfig(config: DeviceProductLayout): ControllerHandler;
    reset(): void;
    monitorControl(controller: ControllerHandler): this;
}
