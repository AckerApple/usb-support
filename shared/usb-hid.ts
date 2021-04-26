import * as HID from 'node-hid';
import { IDeviceMeta } from "./typings";
import { isDeviceController } from "./index.utils";

export function listDevices(): IDeviceMeta[] {
  return HID.devices().sort((a, b) => a.vendorId - b.vendorId + a.productId - b.productId);
}

export function listGameDevices(): {index: number, device: IDeviceMeta}[] {
  return listDevices().map((device, index) => ({device, index})).filter(item => isDeviceController(item.device));
}
