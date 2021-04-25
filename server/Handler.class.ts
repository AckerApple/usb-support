import { ControllerConfigs, DeviceProductLayout, IDeviceMeta, WssMessage } from '../shared/typings'
import { listenToDeviceByMeta, listDevices } from './index.utils'
import { SocketMessageType } from '../shared/enums'
import { GameController } from './GameController'
import { cleanseDeviceEvent, devicesMatch, eventsMatch, getControlConfigByDevice, isDeviceEventsSame } from '../index.shared'
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

  getDeviceHandler(device: IDeviceMeta) {
    const config: DeviceProductLayout = getControlConfigByDevice(this.controllerConfigs, device)
    return new DeviceHandler(config)
  }

  destroy() {
    this.subs.unsubscribe()
  }

  paramDeviceSub(control: GameController) {
    if (this.isControlSubscribed(control)) {
      return
    }

    const deviceSub = this.getDeviceHandler(control.meta).subscribeToController(control)

    this.controlSubs.push({
      control, sub: deviceSub
    })

    this.subs.add(deviceSub)

    if (control.idle) {
      this.deviceEvent.next({device: control.meta, event: control.idle})
    }
  }

  unsubscribeDevice(device: IDeviceMeta) {
    const gameController = this.listeners.find(gc => devicesMatch(gc.meta, device))
    if (gameController) {
      this.listeners = this.listeners.filter(
        gc => !devicesMatch(gc.meta, device)
      )
      gameController.close()
      this.controlSubs = this.controlSubs.filter(item => {
        if (item.control.meta === device) {
          item.sub.unsubscribe()
          return false
        }

        return true
      })
      this.deviceUnsubscribed.next(device)
    }
  }

  async listenToDevice(device: IDeviceMeta): Promise<void> {
    // are we already listening?
    let gameController = this.listeners.find(gc => devicesMatch(gc.meta, device))
    if (!gameController) {
      gameController = await listenToDeviceByMeta(device)
      this.listeners.push( gameController )
    }

    this.listenToController(gameController)
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

      case SocketMessageType.UNSUBSCRIBEDEVICE:
        this.unsubscribeDevice(request.data)
        break

      default:
        console.error('Unknown message type ' + request.type)
    }
  }
}

export class DeviceHandler {
  lastEvent: number[]
  deviceEvent: Subject<number[]> = new Subject()
  subs: Subscription = new Subscription()

  constructor(public config: DeviceProductLayout) {}

  subscribeToController(control: GameController): Subscription {
    const deviceSub = control.change.subscribe(event => {
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