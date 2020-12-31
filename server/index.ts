import * as WebSocket from 'ws'
import { GameController } from '../GameController';
import { listenToDeviceByMeta, listDevices } from '../index.utils'
import { IDeviceMeta } from '../typings';

const scope: {
  connections: WebSocket.Server[]
  usbListeners: GameController[]
} = {
  connections: [],
  usbListeners: []
}

const wss = new WebSocket.Server({ port: 8080 })

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

console.log('websocket listening on port 8080')

function messageHandler(ws) {
  const handlerClass = new HandlerClass(ws)
  return function messageHandler(message) {
    try {
      const request = JSON.parse(message)
      console.log('parsed message', request)

      switch (request.type) {
        case 'refresh':
          handlerClass.refresh()
          break

        case 'listenToDevice':
          handlerClass.listenToDevice(request.device)
          break

        default:
          console.error('Unknown message type' + request.type)
      }
    } catch (err) {
      console.log(`Invalid message => ${message}`)
      console.error(err);
    }
  }
}

class HandlerClass {
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
    const payload = {
      type: 'listeners',
      devices: scope.usbListeners.map(gameController => gameController.deviceMeta)
    }
    this.ws.send(JSON.stringify(payload))
  }

  async listenToDevice(device: IDeviceMeta) {
    const gameController = await listenToDeviceByMeta(device)
    gameController.events.addListener('change', event => {

      console.log('changed')
      this.ws.send(JSON.stringify({
        type: 'deviceEvent.change', device, event
      }))
    })
    scope.usbListeners.push( gameController )
    this.emitListeners()
  }
}
