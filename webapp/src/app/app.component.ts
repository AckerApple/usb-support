import { Component } from '@angular/core'
import { DeviceProductLayout, ControllerConfigs, WssMessage, IDeviceMeta } from '../../../shared/typings'
import { SocketMessageType } from '../../../shared/enums'
import GameControlEvents from '../../../shared/GameControlEvents'
import mapController from './mapController.function'
import { socketPort } from '../../../shared/config.json'
import { relayOn, relayOff } from './relayPositions'
import { getDeviceLabel, getControlConfigByDevice, eventsMatch, devicesMatch, isDeviceController } from '../../../shared/index.utils'
import decodeDeviceMetaState from '../../../shared/decodeControllerButtonStates.function'
import { ack } from 'ack-x/js/ack'
import { copyText, DebugData, download, IDeviceMetaState, testController } from './app.utils'

const socketHost = window.location.hostname

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

  command = '0x00, 0xFE, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00'
  relayOn = relayOn
  relayOff = relayOff

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
    this.connection = new WebSocket(this.wsUrl)
    this.connection.onopen = () => {
      this.log('web socket handshake successful')

      if (this.reconnectInterval) {
        clearInterval(this.reconnectInterval)
        delete this.reconnectInterval
      }

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
        // console.log('e.data', e)
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
      this.devices[index] = this.devices[index] || {meta: device, map: {}}
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
        this.onDeviceEventChange(data.data.event, data.data.device)
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
        meta: device, subscribed: true, map: {}
      }

      const saved = this.getControlConfigByDevice(device)

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

  getControlConfigByDevice(device: IDeviceMeta): DeviceProductLayout | undefined {
    return getControlConfigByDevice(this.savedControllers, device)
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
    const pressedKeyNames = decodeDeviceMetaState(matchedListener, matchedListener.lastEvent)
    matchedListener.pressed = pressedKeyNames
    matchedListener.map = matchedListener.map || {}

    if(matchedListener.recording && !pressedKeyNames.length) {
      this.recordDeviceEvent(matchedListener)
    }

    // loop each known button and set its pressed property
    Object.entries(matchedListener.map).forEach(([key, buttonMap]) => {
      buttonMap.pressed = pressedKeyNames.includes(key)
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
    const vendorId = controller.meta.vendorId
    const products = this.savedControllers[vendorId] = this.savedControllers[vendorId] || {}
    const productId = controller.meta.productId

    const saveData = controllerSaveFormat(controller)
    products[productId] = saveData // update local info

    this.saveControllers()
  }

  saveControllers() {
    const controllers: ControllerConfigs = {}

    Object.keys(this.savedControllers).forEach(vendorId => {
      const products = this.savedControllers[vendorId]
      controllers[vendorId] = controllers[vendorId] || {}

      Object.keys(products).forEach(productId => {
        const product = this.savedControllers[vendorId][productId]
        controllers[vendorId][productId] = controllerSaveFormat(product)
      });
    });

    this.wssSend(SocketMessageType.SAVECONTROLLERS, controllers)
  }

  addTestController() {
    this.controllers.push(testController)
    this.devices.push({
      map: {},
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

  writeToDevice(device: IDeviceMetaState, command: number[]) {
    this.wssSend(SocketMessageType.WRITETODEVICE, {device: device.meta, command})
  }

  writeToDeviceByString(device: IDeviceMetaState, command: string[]) {
    const sendCommand = command.map(x => parseInt(Number(x.trim()) as any, 10) || 0) as any
    this.writeToDevice(device, sendCommand)
  }

  toggleDeviceConnection(device: IDeviceMeta): boolean {
    const deviceMatch = this.listeners.find(xDevice => devicesMatch(device, xDevice.meta))
    if(deviceMatch){
      delete deviceMatch.subscribed
      const controller = this.deviceToController(deviceMatch.meta);

      (controller as any).subscribed = false

      console.log('controller --- ', controller);
      const stringRef = getDeviceLabel(device)

      this.log({
        message: `Unsubscribed from ${stringRef}`
      })

      this.wssSend(SocketMessageType.UNSUBSCRIBEDEVICE, device)
      return false
    }
    return true
  }

  listenToDevice(device: IDeviceMeta) {
    // console.log('device', device)
    const stringRef = getDeviceLabel(device)

    this.log({
      message: `attempting to listen to ${stringRef}`, device
    })

    const savedControllers =  Object.values(this.savedControllers).reduce((all, current) => [...all,...Object.values(current)], [])
    const savedController = savedControllers.find(
      xSaved => devicesMatch(device, xSaved.meta)
    )

    if (savedController) {
      this.savedController = savedController
    }

    // already connected so disconnect?
    const isConnected = this.toggleDeviceConnection(device)
    if (!isConnected) {
      return
    }

    this.log({
      message: `requesting web socket to listen to ${stringRef}`
    })

    this.wssSend(SocketMessageType.LISTENTODEVICE, device)

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
    // console.log('lastLogs.error updated')
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

  toggleIgnoreDeviceBit(item: IDeviceMetaState, index: number) {
    item.ignoreBits = item.ignoreBits || []

    const ignoreIndex = item.ignoreBits.indexOf(index)

    if (ignoreIndex===-1) {
      return item.ignoreBits.push(index)
    }

    item.ignoreBits.splice(ignoreIndex, 1)
  }

  downloadController(controller: DeviceProductLayout) {
    const filename = getDeviceLabel(controller.meta) + '.json'
    const data = JSON.stringify(controller, null, 2)
    download(filename, data)
  }

  copyController(controller: DeviceProductLayout) {
    copyText(JSON.stringify(controller, null, 2))
  }
}

function controllerSaveFormat(controller: IDeviceMetaState) {
  const saveData = { ...controller }
  delete saveData.lastEvent
  delete saveData.subscribed
  delete saveData.recording
  delete saveData.pressed
  return saveData
}

function hexEncode(string){
  var hex, i;

  var result = "";
  for (i=0; i < string.length; i++) {
      hex = string.charCodeAt(i).toString(16);
      result += ("000"+hex).slice(-4);
  }

  return result
}