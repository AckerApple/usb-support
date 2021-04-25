import { ControllerConfigs, IDeviceMeta, WssMessage } from '../shared/typings'
import { listenToDeviceByMeta, listDevices } from './index.utils'
import { SocketMessageType } from '../shared/enums'
import { GameController } from './GameController'
import { cleanseDeviceEvent, devicesMatch, eventsMatch, getControlConfigByDevice, isDeviceEventsSame } from '../index.shared'
import { Subject, Subscription } from 'rxjs'

export class HandlerClass {
  lastEvent: number[]
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

  destroy() {
    this.subs.unsubscribe()
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

  subscribeToController(control: GameController) {
    const deviceSub = control.change.subscribe(event => {
      const config = getControlConfigByDevice(this.controllerConfigs, control.meta)

      if (config) {
        event = cleanseDeviceEvent(config, event)
        if (this.lastEvent && eventsMatch(event, this.lastEvent)) {
          return // no real change. Perhaps ignored pins
        }
        this.lastEvent = event
      }

      this.deviceEvent.next({device: control.meta, event})
    })

    this.controlSubs.push({
      control, sub: deviceSub
    })

    this.subs.add(deviceSub)
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