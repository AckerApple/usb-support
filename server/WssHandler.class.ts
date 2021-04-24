import { DeviceProductLayout, IDeviceMeta, WssMessage } from '../shared/typings'
import { listenToDeviceByMeta, listDevices } from './index.utils'
import { SocketMessageType } from '../shared/enums'
import { GameController } from './GameController'
import { scope, controlConfigs } from './index'
import { devicesMatch } from '../index.shared'
import { Subscription } from 'rxjs'
import { ack } from 'ack-x/js/ack'
import * as WebSocket from 'ws'
import * as path from 'path'
import * as fs from 'fs'

export class HandlerClass {
  subs = new Subscription()
  controlSubs: {control: GameController, sub: Subscription}[] = []

  constructor(public ws: WebSocket.Server) {}

  destroy() {
    this.subs.unsubscribe()
  }

  refresh() {
    this.emitDevices()
    this.emitListeners()
  }

  reestablish() {
    scope.usbListeners.filter(control => this.isControlSubscribed(control))
      .forEach(control => this.subscribeToController(control))
    this.emitListeners()
    return this.emitSavedControllers()
  }

  emitDevices() {
    const devices = listDevices()
    console.log('devices', devices.length)
    this.send(SocketMessageType.DEVICES, devices)
  }

  /** send ws message of who we are listening to */
  emitListeners() {
    const devices = scope.usbListeners.map(gameController => gameController.deviceMeta)
    console.log('listeners', devices.length)
    this.send(SocketMessageType.LISTENERS, devices)
    console.log('sent listener update')
    return this
  }

  unsubscribeDevice(device: IDeviceMeta) {
    const gameController = scope.usbListeners.find(gc => devicesMatch(gc.deviceMeta, device))
    if (gameController) {
      scope.usbListeners = scope.usbListeners.filter(
        gc => !devicesMatch(gc.deviceMeta, device)
      )
      gameController.close()
      this.controlSubs = this.controlSubs.filter(item => {
        if (item.control.deviceMeta === device) {
          item.sub.unsubscribe()
          return false
        }

        return true
      })
      this.emitListeners()
    }
  }

  async listenToDevice(device: IDeviceMeta): Promise<void> {
    // are we already listening?
    let gameController = scope.usbListeners.find(gc => devicesMatch(gc.deviceMeta, device))
    if (!gameController) {
      gameController = await listenToDeviceByMeta(device)
      scope.usbListeners.push( gameController )
    }

    // are we already subscribed?
    if (this.isControlSubscribed(gameController)) {
      return
    }

    this.subscribeToController(gameController)
    this.emitListeners()
  }

  isControlSubscribed(controller: GameController) {
    return this.controlSubs.find(item => item.control === controller)
  }

  subscribeToController(control: GameController) {
    const deviceSub = control.change.subscribe(event => {
      this.send(
        SocketMessageType.DEVICEEVENT_CHANGE,
        {device: control.deviceMeta, event}
      )
    })

    this.controlSubs.push({
      control, sub: deviceSub
    })

    this.subs.add(deviceSub)
  }

  send(type: SocketMessageType, data: any) {
    this.ws.send(JSON.stringify({
      type, data
    }))
    return this
  }

  emitSavedControllers() {
    return this.send(SocketMessageType.SAVEDCONTROLLERS, controlConfigs)
  }

  saveController(controller: DeviceProductLayout) {
    const {vendorId, productId} = controller.deviceMeta
    const vendorOb = controlConfigs[vendorId] = controlConfigs[vendorId] || {}

    vendorOb[productId] = controller

    const filePath = path.join(__dirname, '../controllers.json')
    fs.writeFileSync(filePath, JSON.stringify(controlConfigs, null, 2))
    // controlConfigs
    // controllers.json
  }

  handleMessage(request: WssMessage) {
    switch (request.type) {
      case SocketMessageType.SAVEDCONTROLLERS:
        this.saveController(request.data);
        break

      case SocketMessageType.GETSAVEDCONTROLLERS:
        this.emitSavedControllers();
        break

      case SocketMessageType.REFRESH:
        this.refresh()
        break

      case SocketMessageType.LISTENTODEVICE:
        this.listenToDevice(request.data).catch(err => this.sendError(err))
        break

      case SocketMessageType.UNSUBSCRIBEDEVICE:
        this.unsubscribeDevice(request.data)
        break

      default:
        console.error('Unknown message type ' + request.type)
    }
  }

  sendError(err) {
    const errObject = ack.error(err).toObject()
    this.send(SocketMessageType.ERROR, errObject)
  }
}