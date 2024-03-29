/** Files in here must be browser safe */
import { Device } from "node-hid";
import { ControllerConfigs, DeviceProductLayout, IDeviceMeta } from "./typings";
export declare function getControlConfigByDevice(configs: ControllerConfigs, device: IDeviceMeta): DeviceProductLayout | undefined;
export declare function savedControllerToConfigs(controller: DeviceProductLayout, controlConfigs?: ControllerConfigs): ControllerConfigs;
export declare function isDeviceEventsSame(device: DeviceProductLayout, event0: number[], event1: number[]): boolean;
export declare function eventsMatch(event0: number[], event1: number[]): boolean;
export declare function cleanseDeviceEvent(device: DeviceProductLayout, event: number[]): number[];
export declare function devicesMatch(device: IDeviceMeta, lDevice: IDeviceMeta): boolean;
export declare function isDeviceController(device: Device): boolean;
export declare function getDeviceLabel(device: IDeviceMeta): string;
/** returns every combination of combing positions of an array */
export declare function sumSets<T, W>(numsToSum: W[], $sum?: (items: W[], index?: number) => T): {
    sums: T[];
    sets: W[][];
};
/** a map of all possible button presses */
export declare function getPressMapByController(controller: DeviceProductLayout): PressMap;
interface PressMap {
    [bits: string]: string[];
}
export {};
