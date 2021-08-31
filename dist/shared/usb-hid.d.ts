import * as HID from 'node-hid';
export declare function listDevices(): HID.Device[];
export declare function listGameDevices(): {
    index: number;
    device: HID.Device;
}[];
