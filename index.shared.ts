import { IDeviceMeta } from "./typings";

export function isDeviceController(device: IDeviceMeta): boolean {
  return (device.usage === 5 && device.usagePage === 1)
  || (device.usage === 4 && device.usagePage === 1)
  || device.product.toLowerCase().indexOf("controller") >= 0
  || device.product.toLowerCase().indexOf("game") >= 0
  || device.product.toLowerCase().indexOf("joystick") >= 0;
}

export function devicesMatch(device: IDeviceMeta, lDevice: IDeviceMeta): boolean {
  return device.productId === lDevice.productId && device.vendorId === lDevice.vendorId
}