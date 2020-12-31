import { Component } from '@angular/core';
import { IDeviceMeta } from '../../../typings';
import { isDeviceController } from '../../../isDeviceController';


interface IDeviceMetaState extends IDeviceMeta {
  subscribed: boolean
}
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'webapp'
  url = 'ws://localhost:8080'
  connection = new WebSocket(this.url)

  devices: IDeviceMetaState[] = []
  listeners: IDeviceMeta[] = []
  controllers: IDeviceMeta[] = []

  constructor() {
    console.log('making socket connection handshake')

    this.connection.onopen = () => {
      // connection.send('Message From Client')
      console.log('web socket handshake successful')
      this.fetchUsbDevices()
    }

    this.connection.onerror = (error) => {
      console.log(`WebSocket error: ${error}`)
    }

    this.connection.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data)
        switch (data.type) {
          case 'devices':
            this.devices = data.devices
            this.controllers = this.devices.filter(device => isDeviceController(device))
            console.log('devices', data.devices.length, this.devices.length)
            break;

          case 'listeners':
            this.listeners = data.devices
            this.listeners.forEach(lDevice => {
              this.devices.forEach(device => {
                if (device.productId === lDevice.productId && device.vendorId === lDevice.vendorId) {
                  device.subscribed = true
                }
              })
            })
            break

          case 'deviceEvent.change':
            console.log('deviceEvent.change', data.device, data.event)
            break

          default:
            console.warn('unknown event type', data.type)
        }
      } catch (err) {
        console.error('client message failed', err);
      }
    }
  }

  fetchUsbDevices() {
    const payload = {
      type: 'refresh'
    }

    this.connection.send(JSON.stringify(payload))
  }

  listenToDevice(device: IDeviceMeta) {
    const payload = {
      type: 'listenToDevice', device
    }

    this.connection.send(JSON.stringify(payload))
  }
}
