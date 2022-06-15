import { InputControlMonitor } from "./InputControlMonitor.class";
import { DeviceProductLayout } from "./typings";
import { Connection } from "./Connection.class";
export declare class UsbConnection extends Connection {
    controllerConfig: DeviceProductLayout;
    monitor: InputControlMonitor;
    listeners: {
        [index: string]: any;
    };
    constructor(controllerConfig: DeviceProductLayout);
    /** Be informed of USB device availability changes */
    startUsbMonitoring(): void;
    close(): void;
    getDeviceName(): string;
    usbConnect(): DeviceProductLayout | undefined;
}
export declare function isUsbError(err: Error): boolean;
