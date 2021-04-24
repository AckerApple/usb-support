import { DeviceProductLayout, WssMessage } from '../shared/typings'
import { socketPort } from '../shared/config.json'
import * as controllers from '../controllers.json'
import { HandlerClass } from './WssHandler.class'
import { GameController } from './GameController'
import * as WebSocket from 'ws'
import * as nconf from "nconf"
import { SocketMessageType } from '../shared/enums'

export const controlConfigs: {
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

export const scope: {
  connections: WebSocket.Server[]
  usbListeners: GameController[]
} = {
  connections: [],
  usbListeners: []
}

const serverConfig = { port: socketPort, host: '0.0.0.0' }
// const certPathRoot = path.join(__dirname,'../assets/')
// const certPath = path.join(certPathRoot + 'ackers-mac-mini.server.cert')
// const keyPath = path.join(certPathRoot + 'ackers-mac-mini.server.key')
const wss = new WebSocket.Server({
  noServer: true,
  // cert: fs.readFileSync(certPath),
  // key: fs.readFileSync(keyPath),
  ...serverConfig,
})

var usbDetect = require('usb-detection');
usbDetect.startMonitoring();
usbDetect.on('change', device => {
  console.log('usb change', {connections: scope.connections.length})
  setTimeout(() =>
    scope.connections.forEach(ws => new HandlerClass(ws).refresh())
  , 500)
});

wss.on('connection', ws => {
  scope.connections.push(ws)
  console.log('------ connection opened', {connections: scope.connections.length})

  // give latest on who we listening to already
  const handlerClass = new HandlerClass(ws).reestablish()

  ws.on('message', messageHandler(ws))
  ws.on('close', () => {
    console.log('------ closing connection', {connections: scope.connections.length})
    scope.connections = scope.connections.filter(conn => conn !== ws)
    handlerClass.destroy()
    console.log('------ connection closed', {connections: scope.connections.length})
  })
})

console.log('websocket listening on port ' + socketPort)

function messageHandler(ws) {
  const handlerClass = new HandlerClass(ws)
  return function messageHandler(message) {
    try {
      const request: WssMessage = JSON.parse(message)
      handlerClass.handleMessage(request)
    } catch (err) {
      console.error('Invalid message', {message, err})
    }
  }
}

const closer = () => wss.close()
process.once('exit', closer)
process.once('SIGINT', closer)
process.once('beforeExit', () => closer)