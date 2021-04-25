import { socketPort } from '../shared/config.json'
import { GameController } from './GameController'
import { WssMessage } from '../shared/typings'
import WsHandler, { controlConfigs } from './WsHandler.class'
import * as WebSocket from 'ws'
import * as nconf from "nconf"

export const scope: {
  connections: WebSocket.Server[]
  usbListeners: GameController[]
} = {
  connections: [],
  usbListeners: []
}

export function startSocketServer() {
  const ssl = nconf.get('ssl')
  if(ssl) {
    console.log('ssl turned on')
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
  } else {
    console.log('ssl turned off')
  }

  nconf.argv().env() // read env params (setup config)

  const serverConfig = { port: socketPort, host: '0.0.0.0' }

  const wss = new WebSocket.Server({
    noServer: true,
    ...serverConfig,
  })

  wss.on('connection', ws => {
    scope.connections.push(ws)
    console.log('------ connection opened', {connections: scope.connections.length})

    // give latest on who we listening to already
    const handlerClass = new WsHandler(ws, controlConfigs, scope.usbListeners).reestablish()

    ws.on('message', messageHandler(ws, handlerClass))
    ws.on('close', () => {
      console.log('------ closing connection', {connections: scope.connections.length})
      scope.connections = scope.connections.filter(conn => conn !== ws)
      handlerClass.destroy()
      console.log('------ connection closed', {connections: scope.connections.length})
    })
  })

  console.log('websocket listening on port ' + socketPort)

  function messageHandler(
    ws: typeof WebSocket.Server, handlerClass: WsHandler
  ): (message: any) => void {
    // const handlerClass = new WsHandler(ws, handlerClass, scope.usbListeners)

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
}

function monitorUsbDeviceList() {
  var usbDetect = require('usb-detection');
  usbDetect.startMonitoring();
  usbDetect.on('change', device => {
    console.log('usb change', {connections: scope.connections.length})
    setTimeout(() =>
      scope.connections.forEach(ws =>
        new WsHandler(ws, controlConfigs, scope.usbListeners).refresh()
      )
    , 500) // delay broadcast list of device
  });
}

monitorUsbDeviceList()
startSocketServer()