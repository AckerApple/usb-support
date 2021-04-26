import { SocketMessageType } from "./enums";
export interface ButtonsMap {
    [buttonName: string]: IButtonState;
}
export interface WssMessage {
    type: SocketMessageType;
    data: any;
}
export interface DeviceProductLayout {
    map: ButtonsMap;
    idle?: number[];
    meta: IDeviceMeta;
    ignoreBits?: number[];
}
export interface IButtonState {
    pos: number;
    value: number;
    idle: number;
    pressed?: boolean;
    updatedAt: number;
}
export interface IDeviceMeta {
    path: string;
    interface: number;
    usage?: number;
    usagePage?: number;
    productId: number;
    vendorId: number;
    manufacturer: string;
    product: string;
}
export interface ControllerConfigs {
    [vendorId: string]: {
        [productId: string]: DeviceProductLayout;
    };
}
