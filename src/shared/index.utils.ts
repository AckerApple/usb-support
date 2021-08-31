/** Files in here must be browser safe */

import { Device, HID } from "node-hid";
import { ControllerConfigs, DeviceProductLayout, IButtonState, IDeviceMeta } from "./typings";

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

export function isDeviceController(device: Device): boolean {
  if ((device.usage === 5 && device.usagePage === 1)
  || (device.usage === 4 && device.usagePage === 1)) {
    return true
  }

  if (!device.product) {
    return false
  }

  return device.product.toLowerCase().indexOf("controller") >= 0
  || device.product.toLowerCase().indexOf("game") >= 0
  || device.product.toLowerCase().indexOf("joystick") >= 0
}

export function getDeviceLabel(device: IDeviceMeta) {
  let stringRef = device.product?.trim() || ''

  if (device.manufacturer) {
    stringRef += ' by '+ device.manufacturer
  }

  return stringRef
}

/** returns every combination of combing positions of an array */
export function sumSets<T,W>(
  numsToSum: W[],
  $sum: (items: W[], index?: number) => T = (items: any[]) => items.reduce((a,b) => a + b, 0)
): {sums: T[], sets: W[][]} {
  var sums: T[] = [] // every possible sum (typically single number value)
  var sets: W[][] = [] // each index matches sums (the items in sum)

  function SubSets(
    read: W[], // starts with no values
    queued: W[] // starts with all values
  ) {
    if (read.length) {
      const total = $sum(read)// read.reduce($sum as any, startValue) as any
      sums.push(total) // record result of combing
      sets.push(read.slice()) // clone read array
    }

    if (read.length > 1) {
      SubSets(read.slice(1), [])
    }

    if (queued.length === 0) {
      return
    }

    const next = queued[0]

    const left = queued.slice(1)
    const newReads = [...read, next]
    SubSets(newReads, left) // move one over at a time
  }

  // igniter
  SubSets([], numsToSum)

  return {sums, sets}
}

/** a map of all possible button presses */
export function getPressMapByController(controller: DeviceProductLayout): PressMap {
  const data = Object.entries(controller.map)
  const idle = controller.idle ? controller.idle : [0,0,0,0,0,0,0,0]

  const results = sumSets(data,
    (items: [string, IButtonState][]) => {
      const idleClone = idle.slice()
      const processor = (set: [string, IButtonState]) => {
        const item = set[1]
        idleClone[item.pos] = idleClone[item.pos] + item.value - item.idle
      }
      items.forEach(processor)
      return idleClone
    }
  )

  const namedSets = results.sets.map(item => item.map(btn => btn[0])) as any
  const output = results.sums.reduce((all, now, index) => {
    all[now.join(' ')] = namedSets[index]
    return all
  },{} as PressMap)

  output[idle.join(' ')] = []

  return output
}

interface PressMap {
  [bits: string]: string[]
}