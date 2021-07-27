var usbDetect = require('usb-detection') // todo: change to import

import { InputControlMonitor } from "./InputControlMonitor.class"
import { DeviceProductLayout } from "./typings"
import { Connection } from "./Connection.class"
import { devicesMatch, getDeviceLabel } from "./index.utils"


export class UsbConnection extends Connection {
  monitor: InputControlMonitor = new InputControlMonitor()
  listeners: {[index: string]: any} = {}

  constructor(public controllerConfig: DeviceProductLayout) {
    super()

    // anytime its time to connect, lets do the connecting
    this.$connect.subscribe(() =>
      this.usbConnect()
    )

    this.startUsbMonitoring()
  }

  /** Be informed of USB device changes */
  startUsbMonitoring() {
    // officially turns on monitoring
    usbDetect.startMonitoring()

    // Be informed of when device goes down or back up
    usbDetect.on('change', device => {
      if (devicesMatch(device, this.controllerConfig.meta)) {
        // this.$connect.next()
        this.connect()
      }
    })

    /*usbDetect.on('error', (err) => {
      console.error('usb error', err)
    })*/

    // monitors when usb goes down
    this.listeners.uncaughtException = err => {
      if (isUsbError(err)) {
        return this.$down.next(err)
      }
    }
    process.on('uncaughtException', this.listeners.uncaughtException)

    this.listeners.beforeExit = () => {
      // console.warn('server.beforeExit')
      usbDetect.stopMonitoring()
      this.$closed.next()
      process.exit(1)
    }
    process.on('beforeExit', this.listeners.beforeExit)

    this.listeners.exit = () => {
      // console.warn('server.exit')
      usbDetect.stopMonitoring()
      this.$closed.next()
      process.exit(1)
    }
    process.on('exit', this.listeners.exit)

    this.listeners.SIGINT = () => {
      // console.warn('server.SIGINT')
      usbDetect.stopMonitoring()
      this.$closed.next()
      process.exit(1)
    }
    process.on('SIGINT', this.listeners.SIGINT)
  }

  close() {
    super.close()
    usbDetect.stopMonitoring()
    process.removeListener('uncaughtException', this.listeners.uncaughtException)
    process.removeListener('beforeExit', this.listeners.beforeExit)
    process.removeListener('exit', this.listeners.exit)
    process.removeListener('SIGINT', this.listeners.SIGINT)
  }

  getDeviceName() {
    return getDeviceLabel(this.controllerConfig.meta)
  }

  usbConnect() {
    if (this.monitor.controllers.length) {
      this.monitor.reset()
    }

    try {
      this.monitor.monitorByConfig(this.controllerConfig)
      this.$connected.next()
      return this.controllerConfig
    } catch (err) {
      this.$failed.next(err)
    }
  }
}

export function isUsbError(err: Error) {
  return err.message.includes('HID') || err.message.includes('cannot open device')
}
