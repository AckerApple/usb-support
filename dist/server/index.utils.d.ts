import { IDeviceMeta } from "../shared/typings";
export declare function listDevices(): IDeviceMeta[];
export declare function listGameDevices(): {
    index: number;
    device: IDeviceMeta;
}[];
