import { ControllerConfigs, DeviceProductLayout, IDeviceMeta, WssMessage } from '../shared/typings'
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
    scope.usbListeners.forEach(control => this.paramDeviceSub(control))
    this.emitListeners()
    return this.emitSavedControllers()
  }

  paramDeviceSub(control: GameController) {
    if (this.isControlSubscribed(control)) {
      return
    }

    this.subscribeToController(control)
    if (control.idle) {
      this.send(SocketMessageType.DEVICEEVENT_CHANGE, {device: control.meta, event: control.idle})
    }
  }

  emitDevices() {
    const devices = listDevices()
    this.send(SocketMessageType.DEVICES, devices)
  }

  /** send ws message of who we are listening to */
  emitListeners() {
    const devices = scope.usbListeners.map(gameController => gameController.meta)
    this.send(SocketMessageType.LISTENERS, devices)
    console.log('sent listener update', devices.length)
    return this
  }

  unsubscribeDevice(device: IDeviceMeta) {
    const gameController = scope.usbListeners.find(gc => devicesMatch(gc.meta, device))
    if (gameController) {
      scope.usbListeners = scope.usbListeners.filter(
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
      this.emitListeners()
    }
  }

  async listenToDevice(device: IDeviceMeta): Promise<void> {
    // are we already listening?
    let gameController = scope.usbListeners.find(gc => devicesMatch(gc.meta, device))
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
    // usbListeners
    return this.controlSubs.find(item => devicesMatch(item.control.meta, controller.meta))
  }

  getSavedController(device: IDeviceMeta): DeviceProductLayout | undefined {
    const vendorId = String(device.vendorId)
    const productId = String(device.productId)
    const products = controlConfigs[vendorId]

    if (!products) {
      return
    }

    return products[productId]
  }

  subscribeToController(control: GameController) {
    const deviceSub = control.change.subscribe(event => {
      this.send(
        SocketMessageType.DEVICEEVENT_CHANGE,
        {device: control.meta, event}
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
    const {vendorId, productId} = controller.meta
    const vendorOb = controlConfigs[vendorId] = controlConfigs[vendorId] || {}

    vendorOb[productId] = controller
    this.saveControllers(controlConfigs)
  }

  saveControllers(data: ControllerConfigs) {
    Object.keys(controlConfigs).forEach(vendorId => delete controlConfigs[vendorId])
    Object.keys(data).forEach(vendorId => controlConfigs[vendorId] = data[vendorId])

    const filePath = path.join(__dirname, '../controllers.json')
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
  }

  handleMessage(request: WssMessage) {
    switch (request.type) {
      case SocketMessageType.SAVECONTROLLERS:
        console.log('saving controllers')
        this.saveControllers(request.data);
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