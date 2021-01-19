import * as WebSocket from 'ws'
import { GameController } from './GameController';
import { devicesMatch } from '../index.shared'
import { listenToDeviceByMeta, listDevices } from './index.utils'
import { IDeviceMeta } from '../shared/typings';
import { socketPort } from '../shared/config.json'
import * as controllers from '../controllers.json'
import { Subscription } from 'rxjs';

const scope: {
  connections: WebSocket.Server[]
  usbListeners: GameController[]
} = {
  connections: [],
  usbListeners: []
}

const wss = new WebSocket.Server({
  port: socketPort,
  host: 'ackers-mac-mini.local'
})

var usbDetect = require('usb-detection');
usbDetect.startMonitoring();
usbDetect.on('change', device => {
  console.log('usb change', {connections: scope.connections.length})
  setTimeout(() => {
    scope.connections.forEach(ws => new HandlerClass(ws).refresh());
  }, 500)
});

wss.on('connection', ws => {
  scope.connections.push(ws)
  console.log('connection opened', {connections: scope.connections.length})
  ws.on('message', messageHandler(ws))
  ws.on('close', () => {
    scope.connections = scope.connections.filter(conn => conn !== ws)
    console.log('connection closed', {connections: scope.connections.length})
  })
  // ws.send('Hello! Message From Server!!')
})

console.log('websocket listening on port ' + socketPort)

function messageHandler(ws) {
  const handlerClass = new HandlerClass(ws)
  return function messageHandler(message) {
    try {
      const request = JSON.parse(message)
      console.log('parsed message', request)

      switch (request.type) {
        case 'getSavedControllers':
          handlerClass.emitSavedControllers();
          break

        case 'refresh':
          handlerClass.refresh()
          break

        case 'listenToDevice':
          handlerClass.listenToDevice(request.device)
          break

        case 'unsubscribeToDevice':
          handlerClass.unsubscribeToDevice(request.device)
          break

        default:
          console.error('Unknown message type' + request.type)
      }
    } catch (err) {
      console.error('Invalid message', {message, err})
    }
  }
}

class HandlerClass {
  subs = new Subscription()

  constructor(public ws: WebSocket.Server) {}

  refresh() {
    this.emitDevices()
    this.emitListeners()
  }

  emitDevices() {
    const devices = listDevices()

    console.log('devices', devices.length)

    const payload = {
      type: 'devices', devices
    }

    this.ws.send(JSON.stringify(payload))
  }

  emitListeners() {
    const devices = scope.usbListeners.map(gameController => gameController.deviceMeta)
    const payload = {
      type: 'listeners', devices
    }
    console.log('devices', devices.length)
    this.ws.send(JSON.stringify(payload))
  }

  unsubscribeToDevice(device: IDeviceMeta) {
    const gameController = scope.usbListeners.find(gc => devicesMatch(gc.deviceMeta, device))
    if (gameController) {
      scope.usbListeners = scope.usbListeners.filter(
        gc => !devicesMatch(gc.deviceMeta, device)
      )
      gameController.close()
      this.emitListeners()
    }
  }

  async listenToDevice(device: IDeviceMeta) {
    let gameController = scope.usbListeners.find(gc => devicesMatch(gc.deviceMeta, device))

    if (!gameController) {
      gameController = await listenToDeviceByMeta(device)
      scope.usbListeners.push( gameController )
    }

    gameController.subs.add(
      gameController.change.subscribe(event => {
        this.ws.send(JSON.stringify({
          type: 'deviceEvent.change', device, event
        }))
      })
    )

    this.emitListeners()
  }

  emitSavedControllers() {
    this.ws.send(JSON.stringify({
      type: 'savedControllers', controllers
    }))
  }
}

const closer = () => wss.close()
process.once('exit', closer)
process.once('SIGINT', closer)
process.once('beforeExit', () => closer)