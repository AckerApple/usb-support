import { SocketMessageType } from "./enums";

export interface WssMessage {
  type: SocketMessageType
  data: any
}

export interface DeviceProductLayout {
  deviceMeta: IDeviceMeta
  map: {
    [button: string]: IButtonState
  }
}
export interface IButtonState {
  pos: number
  value: number
  idle: number
  updatedAt: number
}

export interface IDeviceMeta {
    path: string
    interface: number
    usage?: number
    usagePage?: number
    productId: number
    vendorId: number
    manufacturer: string
    product: string
}
