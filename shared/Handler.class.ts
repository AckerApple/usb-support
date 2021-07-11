import { ControllerConfigs, DeviceProductLayout, IDeviceMeta, WssMessage } from './typings'
import { getGameControllerByMeta } from './index'
import { SocketMessageType } from './enums'
import { GameController } from './GameController'
import { cleanseDeviceEvent, devicesMatch, eventsMatch } from './index.utils'
import { getControlConfigByDevice } from './index.utils'
import { listDevices } from './usb-hid'
import { Subject, Subscription } from 'rxjs'

export class HandlerClass {
  deviceEvent: Subject<{device: IDeviceMeta, event: number[]}> = new Subject()
  error: Subject<Error> = new Subject()
  deviceUnsubscribed: Subject<IDeviceMeta> = new Subject()
  deviceListenActive: Subject<IDeviceMeta> = new Subject()

  subs = new Subscription()
  controlSubs: {control: GameController, sub: Subscription}[] = []

  listDevices = listDevices

  constructor(
    public controllerConfigs?: ControllerConfigs,
    public listeners?: GameController[],
  ) {}

  getControllerHandler(device: IDeviceMeta, gameController: GameController) {
    const config: DeviceProductLayout = getControlConfigByDevice(this.controllerConfigs, device)
    return new ControllerHandler(config, gameController)
  }

  destroy() {
    this.subs.unsubscribe()
    this.listeners.forEach(control => control.close())
  }

  paramDeviceSub(control: GameController) {
    if (this.isControlSubscribed(control)) {
      return
    }

    this.subscribeToController(control)

    if (control.idle) {
      this.deviceEvent.next({device: control.meta, event: control.idle})
    }
  }

  subscribeToController(control: GameController): Subscription {
    const device = control.meta
    // const config: DeviceProductLayout = getControlConfigByDevice(this.controllerConfigs, device)
    const controlHandler = this.getControllerHandler(device, control)
    const deviceSub = controlHandler.subscribe()

    this.subs.add(
      controlHandler.deviceEvent.subscribe(event =>
        this.deviceEvent.next({device, event})
      )
    )

    this.controlSubs.push({
      control, sub: deviceSub
    })

    this.subs.add(deviceSub)

    return deviceSub
  }

  unsubscribeDevice(device: IDeviceMeta) {
    const gameController = this.listeners.find(gc => devicesMatch(gc.meta, device))

    if (!gameController) {
      return
    }

    this.listeners.find(
      (gc, index) => {
        if (devicesMatch(gc.meta, device)) {
          this.listeners.splice(index, 1)
          return true
        }
      }
    )

    gameController.close()
    this.controlSubs = this.controlSubs.filter(item => {
      if (devicesMatch(item.control.meta, device)) {
        item.sub.unsubscribe()
        return false
      }

      return true
    })
    this.deviceUnsubscribed.next(device)
  }

  async listenToDevice(device: IDeviceMeta): Promise<void> {
    // are we already listening?
    let gameController = this.listeners.find(gc => devicesMatch(gc.meta, device))
    if (!gameController) {
      gameController = getGameControllerByMeta(device)
      this.listeners.push( gameController )
    }

    gameController.$error.subscribe(err => {
      console.error('controller error', err)
    })

    this.listenToController(gameController)
  }

  async writeToDevice(device: IDeviceMeta, command: any[]): Promise<void> {
    // are we already listening?
    let gameController = this.listeners.find(gc => devicesMatch(gc.meta, device))
    if (!gameController) {
      gameController = getGameControllerByMeta(device)
      this.listeners.push( gameController )
    }

    gameController.write(command)
  }

  listenToController(gameController: GameController) {
    // are we already subscribed?
    if (this.isControlSubscribed(gameController)) {
      return
    }

    this.subscribeToController(gameController)
    this.deviceListenActive.next(gameController.meta)
  }

  isControlSubscribed(controller: GameController) {
    // usbListeners
    return this.controlSubs.find(item => devicesMatch(item.control.meta, controller.meta))
  }

  handleMessage(request: WssMessage) {
    switch (request.type) {
      case SocketMessageType.LISTENTODEVICE:
        this.listenToDevice(request.data).catch(err => this.error.next(err))
        break

        case SocketMessageType.WRITETODEVICE:
        this.writeToDevice(request.data.device, request.data.command).catch(err => this.error.next(err))
        break

      case SocketMessageType.UNSUBSCRIBEDEVICE:
        this.unsubscribeDevice(request.data)
        break

      default:
        console.error('Unknown message type ' + request.type)
    }
  }
}

export function getControlHander(config: DeviceProductLayout) {
  const control = getGameControllerByMeta(config.meta)
  return new ControllerHandler(config, control)
}

export class ControllerHandler {
  lastEvent: number[]
  deviceEvent: Subject<number[]> = new Subject()
  subs: Subscription = new Subscription()

  constructor(
    public config: DeviceProductLayout,
    public control: GameController
  ) {}

  subscribe(): Subscription {
    this.control.listen() // new HID.HID call

    const deviceSub = this.control.change.subscribe((event: number[]) => {
      if (this.config) {
        event = cleanseDeviceEvent(this.config, event)
        if (this.lastEvent && eventsMatch(event, this.lastEvent)) {
          return // no real change. Perhaps ignored pins
        }
        this.lastEvent = event
      }

      this.deviceEvent.next(event)
    })

    this.subs.add(deviceSub)

    return deviceSub
  }
}