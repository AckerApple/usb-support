import { Component } from '@angular/core'
import { DeviceProductLayout, ControllerConfigs, ButtonsMap, WssMessage, IDeviceMeta } from '../../../shared/typings'
import { SocketMessageType } from '../../../shared/enums'
import GameControlEvents from './GameControlEvents'
import mapController from './mapController.function'
import {
  // socketHost,
  socketPort } from '../../../shared/config.json'
import { devicesMatch, isDeviceController } from '../../../index.shared'
import decodeDeviceMetaState from './decodeControllerButtonStates.function'
import { ack } from 'ack-x/js/ack'
import { textChangeRangeIsUnchanged } from 'typescript'

const socketHost = window.location.hostname

export interface IDeviceMetaState {
  meta: IDeviceMeta
  idle?: number[]
  recording?: boolean
  subscribed?: boolean
  lastEvent?: number[]
  map?: ButtonsMap // populated if matched to savedController
  pressed?: string[] // populated if matched to savedController
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'webapp'
  wsUrl = `ws://${socketHost}:${socketPort}`
  connection: WebSocket
  reconnectInterval: number

  devices: IDeviceMetaState[] = []
  listeners: IDeviceMetaState[] = []
  controllers: IDeviceMeta[] = []
  nonControllers: IDeviceMeta[] = []
  savedControllers: ControllerConfigs = {}
  savedController: DeviceProductLayout // One controller being reviewed


  debug: DebugData = {
    state: 'initializing',
    messages: 0,
    url: this.wsUrl,
    socket: {},
    lastWssData: {},
    lastPayload: {},
    lastLogs: {
      info:{}
    }
  }

  constructor() {
    this.debug.state = 'constructing'
    window.onerror = err => this.error(typeof(err) === 'string' ? new Error(err) : err)
  }

  ngOnInit(){
    this.log('connecting to websocket', this.wsUrl)
    try {
      this.connect()
      this.debug.state = 'constructed'
      this.log('web socket connected')
    } catch (err) {
      this.error(err, {
        message: 'Could not connect to web sockets',
      })
    }
  }

  connect() {
    if (this.reconnectInterval) {
      clearInterval(this.reconnectInterval)
      delete this.reconnectInterval
    }

    this.connection = new WebSocket(this.wsUrl)
    this.connection.onopen = () => {
      this.log('web socket handshake successful')
      this.fetchUsbDevices()
      this.fetchSavedControllers()
      this.debug.state = 'socket opened'

      this.connection.onclose = () => {
        this.reconnectInterval = setInterval(() => {
          this.log({message: 'attempting ws reconnect...'})
          this.connect()
        }, 3000)
      }
    }


    this.connection.onerror = (ev: Event): any => {
      this.error(
        ev,
        {message: `Socket error`},
      )
    }

    this.connection.onmessage = (e) => {
      this.debug.state = 'message-received'
      ++this.debug.messages

      let data: WssMessage

      try {
        data = JSON.parse(e.data)
        this.debug.lastWssData = data
      } catch (err) {
        console.log('e.data', e)
        this.error(err, 'client message failed');
        (this.debug.socket as any).error = err
      }

      try {
        this.handleMessage(data)
      } catch (err) {
        this.error({error:err, data}, `error executing message ${data.type}`);
        throw err
      }
    }
  }

  mapController(controller: GameControlEvents) {
    mapController(controller)
  }

  toggleDeviceRecord(deviceMeta: IDeviceMetaState) {
    deviceMeta.recording = !deviceMeta.recording
  }

  devicesUpdate(data: IDeviceMeta[]) {
    data.forEach((device, index) => {
      this.devices[index] = this.devices[index] || {meta: device}
      this.devices[index].meta = device
    })

    const devices = this.devices.map(device => device.meta)
    this.controllers = devices.filter(device => isDeviceController(device))
    this.nonControllers = devices.filter(device => !isDeviceController(device))

    this.log('controllers', this.controllers)
    this.log('other devices', this.nonControllers)
  }

  handleMessage(data: WssMessage) {
    switch (data.type) {
      case SocketMessageType.DEVICES:
        this.devicesUpdate(data.data)
        break;

      case SocketMessageType.SAVEDCONTROLLERS:
        if (data.data) {
          this.savedControllers = data.data
          this.log('savedControllers', data.data)
        }
        break;

      case SocketMessageType.LISTENERS:
        this.onListeners(data.data)
        break

      case SocketMessageType.DEVICEEVENT_CHANGE:
        this.onDeviceEventChange(data.data.event.data, data.data.device)
        break

      case SocketMessageType.ERROR:
        this.error(data.data)
        break

      default:
        this.warn('unknown event type', data.type)
    }
  }

  onListeners(devices: IDeviceMeta[]) {
    this.log({message: `listeners update received`, devices})

    this.listeners.length = devices.length

    devices.forEach((device,index) => {
      this.listeners[index] = this.listeners[index] || {
        meta: device, subscribed: true
      }

      const saved = this.getSavedControlByDevice(device)

      if (saved) {
        Object.assign(this.listeners[index], saved)
      }

      this.listeners[index].meta = device
    })

    this.controllers.forEach(controller => {
      const find = this.listeners.find(lDevice =>
        devicesMatch(controller, lDevice.meta)
      )

      if (find) {
        return (controller as any).subscribed = true
      }
      delete (controller as any).subscribed
    })

  }

  getSavedControlByDevice(device: IDeviceMeta): DeviceProductLayout | undefined {
    const vendorId = String(device.vendorId)
    const productId = String(device.productId)
    const products = this.savedControllers[vendorId]

    if (!products) {
      return
    }

    return products[productId]
  }

  onDeviceEventChange(event: number[], device: IDeviceMeta) {
    const matchedListener = this.listeners.find(
      listener => devicesMatch(listener.meta, device)
    )

    // no match? no work to do
    if (!matchedListener) {
      return
    }
    matchedListener.lastEvent = event
    const listener = this.getDeviceListener(device)
    if (listener) {
      this.processDeviceUpdate(matchedListener)
    }
  }

  getDeviceListener(device: IDeviceMeta): IDeviceMetaState | undefined {
    return this.listeners.find(listener => devicesMatch(listener.meta, device))
  }

  processDeviceUpdate(matchedListener: IDeviceMetaState) {
    console.log(0, matchedListener)
    const pressedKeyNames = decodeDeviceMetaState(matchedListener)
    matchedListener.pressed = pressedKeyNames
    matchedListener.map = matchedListener.map || {}

    if(matchedListener.recording && !pressedKeyNames.length) {
      this.recordDeviceEvent(matchedListener)
    }

    // loop each known button and set its pressed property
    Object.entries(matchedListener.map).forEach(current => {
      const key = current[0]
      current[1].pressed = pressedKeyNames.includes(key)
    })
  }

  recordDeviceEvent(matchedListener: IDeviceMetaState) {
    const idleMap = matchedListener.idle
    const pressedKeyNames = matchedListener.pressed
    const isIdle = eventsMatch(matchedListener.lastEvent, idleMap)
    if (isIdle) {
      return
    }

    const event = matchedListener.lastEvent
    for (let index = event.length - 1; index >= 0; --index) {
      if (event[index] != idleMap[index]) {
        matchedListener.map[`unknown${Object.keys(matchedListener.map).length}`] = {
          pos: index,
          value: event[index],
          idle: idleMap[index],
          updatedAt: Date.now(),
        }
      }
    }

    console.log('5 recording event came in', {
      map: matchedListener.map, pressedKeyNames, lastEvent:matchedListener.lastEvent
    })
  }

  confirmDeleteController(controller: DeviceProductLayout) {
    if (!confirm(`confirm delete ${getDeviceLabel(controller.meta)}`)) {
      return
    }

    const vendorId = String(controller.meta.vendorId)
    const productId = String(controller.meta.productId)
    const products = this.savedControllers[vendorId]
    delete products[productId]

    this.saveControllers()
  }

  saveController(controller: IDeviceMetaState) {
    const products = this.savedControllers[controller.meta.vendorId]
    products[controller.meta.productId] = {
      meta: controller.meta,
      map: controller.map,
      idle: controller.idle,
    }
    this.saveControllers()
  }

  saveControllers() {
    this.wssSend(SocketMessageType.SAVECONTROLLERS, this.savedControllers)
  }

  addTestController() {
    this.controllers.push(testController)
    this.devices.push({
      subscribed: false,
      lastEvent: [],
      meta: testController
    })
  }

  fetchSavedControllers() {
    this.wssSend(SocketMessageType.GETSAVEDCONTROLLERS)
  }

  wssSend(type: SocketMessageType, data?: any) {
    const payload = {type, data}
    this.debug.lastPayload = payload
    this.connection.send(JSON.stringify(payload))
    return this
  }

  fetchUsbDevices() {
    this.wssSend(SocketMessageType.REFRESH)
  }

  getSavedControllers() {
    this.wssSend(SocketMessageType.GETSAVEDCONTROLLERS)
  }

  listenToDevice(device: IDeviceMeta) {
    console.log('device', device)
    const stringRef = getDeviceLabel(device)

    this.log({
      message: `attempting to listen to ${stringRef}`, device
    })

    let type: SocketMessageType = SocketMessageType.LISTENTODEVICE

    const deviceMatch = this.listeners.find(xDevice => devicesMatch(device, xDevice.meta))
    if(deviceMatch){
      type = SocketMessageType.UNSUBSCRIBEDEVICE
      delete deviceMatch.subscribed
      const controller = this.deviceToController(deviceMatch.meta);
      (controller as any).subscribed = false
      console.log('controller --- ', controller);

      this.log({
        message: `Unsubscribed from ${stringRef}`
      })
    }

    console.log('current', this.savedControllers)
    const savedControllers =  Object.values(this.savedControllers).reduce((all, current) => [...all,...Object.values(current)], [])
    const savedController = savedControllers.find(
      xSaved => devicesMatch(device, xSaved.meta)
    )

    if (savedController) {
      this.savedController = savedController
    }

    this.log({
      message: `requesting web socket to listen to ${stringRef}`
    })

    this.wssSend(type, device)

    if (device === testController) {
      this.handleMessage({
        type: SocketMessageType.LISTENERS,
        data: {
          devices: this.devices,
          controllers: this.controllers,
          event: {message:'test-event'},
          device
        }
      })
    }
  }

  deviceToController(device: IDeviceMeta) {
    return this.controllers.find(control => devicesMatch(device, control))
  }

  error(error: any, ...extra) {
    if (typeof error === 'string') {
      error = new Error(error)
    }
    const readable = ack.error(error).toObject()
    this.debug.lastLogs.error = {...readable, ...error, ...extra.reduce((all, one) => ({...all, ...one}), {})}
    console.log('lastLogs.error updated')
    console.error({error, ...extra})
  }

  warn(...data: any) {
    this.debug.lastLogs.info = data
    console.warn(data)
  }

  log(...data: any) {
    this.debug.lastLogs.info = data

    if (data[0].message) {
      return console.log(data[0].message, data)
    }

    console.log(data)
  }

  stringUpdateSavedController(controller: DeviceProductLayout, newData: string) {
    this.savedController = JSON.parse(newData)
    this.saveController(this.savedController)
  }
}

const testController: IDeviceMeta = {
  path: 'test-path',
  interface: -1,
  usage: -1,
  usagePage: -1,
  productId: -1,
  vendorId: -32,
  product: 'test-product',
  manufacturer: 'test-manu',
}

interface DebugData {
  state: 'initializing' | 'constructing' | 'constructed' | 'message-received' | 'socket opened'
  messages: number
  url: string
  socket: Record<string, any>,
  lastWssData: Record<string, any>,
  lastPayload: Record<string, any>,
  lastLogs: {
    info: Record<string, any>
    error?: Record<string, any>
  }
}

function getDeviceLabel(device: IDeviceMeta) {
  let stringRef = device.product?.trim() || ''

  if (device.manufacturer) {
    stringRef += ' by '+ device.manufacturer
  }

  return stringRef
}

function eventsMatch(event0: number[], event1: number[]) {
  return event0.every((item,index) => item === event1[index])
}