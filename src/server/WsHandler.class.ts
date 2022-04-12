import { ControllerConfigs, DeviceProductLayout, IDeviceMeta, WssMessage } from '../shared/typings'
import { SocketMessageType } from "../shared/enums"
import * as controllers from '../../controllers.json'
import { HandlerClass } from "../shared/Handler.class"
import { ackExpose as ack } from 'ack-x/js/ack'
import * as WebSocket from 'ws'
import { scope } from './server.start'
import * as path from 'path'
import * as fs from 'fs'
import { savedControllerToConfigs } from '../shared/index.utils'
import { GameController } from '../shared/GameController'

export const controlConfigs: ControllerConfigs = controllers

export default class WsHandler extends HandlerClass {
  constructor(
    public ws: WebSocket,
    public controllerConfigs: ControllerConfigs,
    public listeners: GameController[],
  ) {
    super(controllerConfigs, listeners)

    this.subs.add(
      this.error.subscribe(err =>
        this.send(SocketMessageType.ERROR, ack.error(err).toObject())
      )
    )
    
    this.subs.add(
      this.deviceEvent.subscribe(data =>
        this.send(SocketMessageType.DEVICEEVENT_CHANGE, {device: data.device, event: data.event})
      )
    )

    this.subs.add(
      this.deviceUnsubscribed.subscribe(() =>
        this.emitListeners()
      )
    )
    
    this.subs.add(
      this.deviceListenActive.subscribe(() =>
        this.emitListeners()
      )
    )
  }

  reestablish() {
    scope.usbListeners.forEach(control => this.paramDeviceSub(control))
    this.emitListeners()
    return this.emitSavedControllers()
  }

  send(type: SocketMessageType, data: any) {
    this.ws.send(JSON.stringify({
      type, data
    }))
    return this
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

  emitSavedControllers() {
    return this.send(SocketMessageType.SAVEDCONTROLLERS, controlConfigs)
  }

  saveController(controller: DeviceProductLayout) {
    savedControllerToConfigs(controller, controlConfigs)
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
      case SocketMessageType.REFRESH:
        this.refresh()
        break

      case SocketMessageType.SAVECONTROLLERS:
        console.log('saving controllers')
        this.saveControllers(request.data);
        break

      case SocketMessageType.GETSAVEDCONTROLLERS:
        this.emitSavedControllers();
        break

      default:
        super.handleMessage(request)
    }
  }

  emitDevices() {
    const devices = this.listDevices()
    this.send(SocketMessageType.DEVICES, devices)
  }

  /** send ws message of who we are listening to */
  emitListeners() {
    const devices = scope.usbListeners.map(gameController => gameController.meta)
    this.send(SocketMessageType.LISTENERS, devices)
    console.log('sent listener update', devices.length)
    return this
  }

  refresh() {
    this.emitDevices()
    this.emitListeners()
  }
}
