import { Component } from '@angular/core'
import { IDeviceMeta } from '../../../shared/typings'
import GameControlEvents from './GameControlEvents'
import mapController from './mapController.function'
import { socketHost, socketPort } from '../../../shared/config.json'
import { devicesMatch, isDeviceController } from '../../../index.shared'
import decodeDeviceMetaState from './decodeControllerButtonStates.function'

export interface IDeviceMetaState extends IDeviceMeta {
  subscribed: boolean
  lastEvent: any
  map?: any // populated if matched to savedController
  pressed?: string[] // populated if matched to savedController
}
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'webapp'
  url = `ws://${socketHost}:${socketPort}`
  connection = new WebSocket(this.url)

  devices: IDeviceMetaState[] = []
  listeners: IDeviceMetaState[] = []
  controllers: IDeviceMeta[] = []
  nonControllers: IDeviceMeta[] = []
  savedControllers: Record<string, any>
  savedController: Record<string, any>

  debug = {
    state: 'initializing',
    messages: 0,
    url: this.url,
    socket: {},
    lastSubscription: {},
    lastPayload: {},
  }

  constructor() {
    console.log('initializing')

    this.debug.state = 'constructing'
    window.onerror = function (msg, url, line) {
      this.debug.windowError = {msg, url, line}
    }

    console.log('making socket connection handshake')

    this.connection.onopen = () => {
      // connection.send('Message From Client')
      console.log('web socket handshake successful')
      this.fetchUsbDevices()
      this.fetchSavedControllers()
      this.debug.state = 'socket opened'
    }

    this.connection.onerror = (ev: Event): any => {
      (this.debug.socket as any).error = JSON.stringify(ev, Object.getOwnPropertyNames(ev));
      console.log(`Socket error`, (ev as any).message, JSON.stringify(ev, null, 2))
    }

    this.connection.onmessage = (e) => {
      this.debug.state = 'message-received'
      ++this.debug.messages
      this.debug.lastSubscription = e

      try {
        const data = JSON.parse(e.data)
        this.handleMessage(data)
      } catch (err) {
        console.error('client message failed', err);
        (this.debug.socket as any).error = err
      }
    }
    this.debug.state = 'constructed'
  }

  mapController(controller: GameControlEvents) {
    mapController(controller)
  }

  handleMessage(data) {
    switch (data.type) {
      case 'devices':
        this.devices = data.devices
        this.controllers = this.devices.filter(device => isDeviceController(device))
        this.nonControllers = this.devices.filter(device => !isDeviceController(device))
        console.log('devices', data.devices.length, this.devices.length)
        break;

      case 'savedControllers':
        this.savedControllers = data.controllers
        console.log('savedControllers', data.controllers)
        break;

      case 'listeners':
        this.listeners = data.devices
        this.listeners.forEach(lDevice => {
          this.devices.forEach(device => {
            if (devicesMatch(device, lDevice)) {
              device.subscribed = true
            }
          })
        })
        break

      case 'deviceEvent.change':
        const matchedListener = this.listeners.find(device => devicesMatch(device, data.device))

        if (matchedListener) {
          matchedListener.lastEvent = data.event

          if (this.savedController && devicesMatch(matchedListener, this.savedController.deviceMeta)) {
            matchedListener.pressed = decodeDeviceMetaState(matchedListener)
            matchedListener.map = this.savedController.map
          }
        }

        break

      default:
        console.warn('unknown event type', data.type)
    }
  }

  fetchSavedControllers() {
    const payload = {
      type: 'getSavedControllers'
    }

    this.connection.send(JSON.stringify(payload))
  }

  fetchUsbDevices() {
    const payload = {
      type: 'refresh'
    }

    this.connection.send(JSON.stringify(payload))
  }

  getSavedControllers() {
    const payload = {
      type: 'getSavedControllers'
    }

    this.connection.send(JSON.stringify(payload))
  }

  listenToDevice(device: IDeviceMetaState) {
    const payload = {
      type: 'listenToDevice', device
    }

    const deviceMatch = this.listeners.find(xDevice=>devicesMatch(device, xDevice))
    if(deviceMatch){
      payload.type = 'unsubscribeToDevice'
      delete device.subscribed
      delete deviceMatch.subscribed
    }

    const savedControllers =  Object.values(this.savedControllers).reduce((all, current) => [...all,...Object.values(current)], [])
    const savedController = savedControllers.find(xSaved=>devicesMatch(device, xSaved.deviceMeta))

    if (savedController) {
      this.savedController = savedController
    }

    this.debug.lastPayload = payload
    this.connection.send(JSON.stringify(payload))
  }
}
