import * as WebSocket from 'ws'
import { listDevices } from '../index.utils'


const wss = new WebSocket.Server({ port: 8080 })
let connections: WebSocket.Server[] = []

var usbDetect = require('usb-detection');
usbDetect.startMonitoring();
usbDetect.on('change', device => {
  console.log('usb change', {connections: connections.length})
  setTimeout(() => {
    connections.forEach(ws => new HandlerClass(ws).refresh());
  }, 500)
});

wss.on('connection', ws => {
  connections.push(ws)
  console.log('connection opened', {connections: connections.length})
  ws.on('message', messageHandler(ws))
  ws.on('close', () => {
    connections = connections.filter(conn => conn !== ws)
    console.log('connection closed', {connections: connections.length})
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
    const devices = listDevices()

    console.log('devices', devices.length)

    const reply = {
      type: 'devices', devices
    }

    this.ws.send(JSON.stringify(reply))
  }
}