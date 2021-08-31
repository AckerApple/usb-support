import * as HID from 'node-hid';
// import { IDeviceMeta } from "./typings";
import { isDeviceController } from "./index.utils";

export function listDevices(): HID.Device[] {
  return HID.devices().sort((a: HID.Device, b: HID.Device) =>
    a.vendorId - b.vendorId + a.productId - b.productId
  )
}

export function listGameDevices(): {index: number, device: HID.Device}[] {
  return listDevices().map((device, index) => ({device, index}))
    .filter(item => isDeviceController(item.device));
}
