import * as WebSocket from 'ws'
import { GameController } from './GameController'
import { devicesMatch } from '../index.shared'
import { listenToDeviceByMeta, listDevices } from './index.utils'
import { DeviceProductLayout, IButtonState, IDeviceMeta } from '../shared/typings'
import { socketPort } from '../shared/config.json'
import * as controllers from '../controllers.json'
import { Subscription } from 'rxjs'
import { ack } from 'ack-x/js/ack'
import * as nconf from "nconf"

const controlConfigs: {
  [vendorId: string]: {
    [productId: string]: DeviceProductLayout
  }
} = controllers
nconf.argv().env() // read env params (setup config)

const ssl = nconf.get('ssl')
if(ssl) {
  console.log('ssl turned on')
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
} else {
  console.log('ssl turned off')
}

const scope: {
  connections: WebSocket.Server[]
  usbListeners: GameController[]
} = {
  connections: [],
  usbListeners: []
}

import * as fs from 'fs'
import * as path from 'path'

const serverConfig = {
  port: socketPort,
  host: 'ackers-mac-mini.local'
}
const certPathRoot = path.join(__dirname,'../assets/')
const certPath = path.join(certPathRoot + 'ackers-mac-mini.server.cert')
const keyPath = path.join(certPathRoot + 'ackers-mac-mini.server.key')
const wss = new WebSocket.Server({
  noServer: true,
  cert: fs.readFileSync(certPath),
  key: fs.readFileSync(keyPath),
  ...serverConfig,
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

  // give latest on who we listening to already
  new HandlerClass(ws).emitListeners()

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
      // console.log('parsed message', request)

      switch (request.type) {
        case 'saveController':
          handlerClass.saveController(request.data);
          break

        case 'getSavedControllers':
          handlerClass.emitSavedControllers();
          break

        case 'refresh':
          handlerClass.refresh()
          break

        case 'listenToDevice':
          handlerClass.listenToDevice(request.device).catch(sendError)
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

  function sendError(err) {
    const errObject = ack.error(err).toObject()
    console.log('called')
    sender('error', errObject)
  }

  function sender(
    type: string, // SocketMessageType
    data: any
  ) {
    ws.send(JSON.stringify({
      type, data
    }))
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
    console.log('sent listener update')
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

  async listenToDevice(device: IDeviceMeta): Promise<void> {
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
      type: 'savedControllers', controlConfigs
    }))
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
}

const closer = () => wss.close()
process.once('exit', closer)
process.once('SIGINT', closer)
process.once('beforeExit', () => closer)