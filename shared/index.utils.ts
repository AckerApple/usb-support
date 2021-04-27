/** Files in here must be browser safe */

import { ControllerConfigs, DeviceProductLayout, IDeviceMeta } from "./typings";

export function getControlConfigByDevice(configs: ControllerConfigs, device: IDeviceMeta) {
  const vendorId = String(device.vendorId)
  const productId = String(device.productId)
  const products = configs[vendorId]

  if (!products) {
    return
  }

  return products[productId]

}

export function savedControllerToConfigs(
  controller: DeviceProductLayout,
  controlConfigs: ControllerConfigs = {}
) {
  const {vendorId, productId} = controller.meta
  const vendorOb = controlConfigs[vendorId] = controlConfigs[vendorId] || {}

  vendorOb[productId] = controller

  return controlConfigs
}


export function isDeviceEventsSame(
  device: DeviceProductLayout, event0: number[], event1: number[]
): boolean {
  const castedEvent0 = cleanseDeviceEvent(device, event0)
  const castedEvent1 = cleanseDeviceEvent(device, event1)
  return eventsMatch(castedEvent0, castedEvent1)
}

export function eventsMatch(event0: number[], event1: number[]) {
  return event0.every((item,index) => item === event1[index])
}

export function cleanseDeviceEvent(
  device: DeviceProductLayout,
  event: number[]
) {
  return event.map((number, index) =>
    cleanseDeviceEventPos(device, number, index)
  )
}

function cleanseDeviceEventPos(
  device: DeviceProductLayout, number: number, index: number
){
  return device.ignoreBits?.includes(index) ? 0 : number
}

export function devicesMatch(device: IDeviceMeta, lDevice: IDeviceMeta): boolean {
  return device === lDevice || device.productId === lDevice.productId && device.vendorId === lDevice.vendorId
}

export function isDeviceController(device: IDeviceMeta): boolean {
  return (device.usage === 5 && device.usagePage === 1)
  || (device.usage === 4 && device.usagePage === 1)
  || device.product.toLowerCase().indexOf("controller") >= 0
  || device.product.toLowerCase().indexOf("game") >= 0
  || device.product.toLowerCase().indexOf("joystick") >= 0;
}

export function getDeviceLabel(device: IDeviceMeta) {
  let stringRef = device.product?.trim() || ''

  if (device.manufacturer) {
    stringRef += ' by '+ device.manufacturer
  }

  return stringRef
}
