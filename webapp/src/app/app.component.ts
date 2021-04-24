import { Component } from '@angular/core'
import { WssMessage, IDeviceMeta } from '../../../shared/typings'
import { SocketMessageType } from '../../../shared/enums'
import GameControlEvents from './GameControlEvents'
import mapController from './mapController.function'
import { socketHost, socketPort } from '../../../shared/config.json'
import { devicesMatch, isDeviceController } from '../../../index.shared'
import decodeDeviceMetaState from './decodeControllerButtonStates.function'
import { ack } from 'ack-x/js/ack'

export interface IDeviceMetaState extends IDeviceMeta {
  subscribed: boolean
  lastEvent: any
  map?: {
    [buttonName: string]: {
      pressed: boolean
      idle?: number
      pos: number
    }
  } // populated if matched to savedController
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

  devices: IDeviceMetaState[] = []
  listeners: IDeviceMetaState[] = []
  controllers: IDeviceMeta[] = []
  nonControllers: IDeviceMeta[] = []
  savedControllers: Record<string, any> = {}
  savedController: Record<string, any>

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
    this.log('initializing')

    this.debug.state = 'constructing'
    window.onerror = err => this.error(typeof(err) === 'string' ? new Error(err) : err)

    this.log('making socket connection handshake')

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
      this.fetchUsbDevices()
      this.fetchSavedControllers()
      this.debug.state = 'socket opened'
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

      try {
        const data: WssMessage = JSON.parse(e.data)
        this.debug.lastWssData = data
        this.handleMessage(data)
      } catch (err) {
        console.log('e.data', e)
        this.error(err, 'client message failed');
        (this.debug.socket as any).error = err
      }
    }
  }

  mapController(controller: GameControlEvents) {
    mapController(controller)
  }

  handleMessage(data: WssMessage) {
    switch (data.type) {
      case SocketMessageType.DEVICES:
        console.log('data.data', data)
        this.devices = data.data
        this.controllers = this.devices.filter(device => isDeviceController(device))
        this.nonControllers = this.devices.filter(device => !isDeviceController(device))
        this.log('controllers', this.controllers)
        this.log('other devices', this.nonControllers)
        break;

      case SocketMessageType.SAVEDCONTROLLERS:
        if (data.data) {
          this.savedControllers = data.data
          this.log('savedControllers', data.data)
        }
        break;

      case SocketMessageType.LISTENERS:
        const devices = data.data
        this.log({
          message: `listeners update received ${devices.length}`
        })
        this.listeners = devices
        this.listeners.forEach(lDevice => {
          this.devices.forEach(device => {
            if (devicesMatch(device, lDevice)) {
              device.subscribed = true
            }
          })
        })
        break

      case SocketMessageType.DEVICEEVENT_CHANGE:
        const event = data.data.event
        const eventDevice = data.data.device

        // this.log({message: `device change event`, data})
        const matchedListener = this.listeners.find(
          device => devicesMatch(device, eventDevice)
        )

        if (matchedListener) {
          matchedListener.lastEvent = event

          if (this.savedController && devicesMatch(matchedListener, this.savedController.deviceMeta)) {
            const pressedKeyNames = decodeDeviceMetaState(matchedListener)
            matchedListener.pressed = pressedKeyNames
            matchedListener.map = this.savedController.map

            Object.entries(matchedListener.map).forEach(current => {
              const key = current[0]
              current[1].pressed = pressedKeyNames.includes(key)
            })
          }
        }
        break

      case SocketMessageType.ERROR:
        this.error(data.data)
        break

      default:
        this.warn('unknown event type', data.type)
    }
  }

  addTestController() {
    this.controllers.push(testController)
    this.devices.push({
      subscribed: false,
      lastEvent: {},
      ...testController
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

  listenToDevice(device: IDeviceMetaState) {
    let stringRef = device.product?.trim() || ''

    if (device.manufacturer) {
      stringRef += ' by '+ device.manufacturer
    }

    this.log({
      message: `attempting to listen to ${stringRef}`, device
    })

    let type: SocketMessageType = SocketMessageType.LISTENTODEVICE

    const deviceMatch = this.listeners.find(xDevice=>devicesMatch(device, xDevice))
    if(deviceMatch){
      type = SocketMessageType.UNSUBSCRIBEDEVICE
      delete device.subscribed
      delete deviceMatch.subscribed
      this.log({
        message: `Unsubscribed from ${stringRef}`
      })
    }

    console.log('current', this.savedControllers)
    const savedControllers =  Object.values(this.savedControllers).reduce((all, current) => [...all,...Object.values(current)], [])
    const savedController = savedControllers.find(xSaved=>devicesMatch(device, xSaved.deviceMeta))

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

  error(error: Event | Error, ...extra) {
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