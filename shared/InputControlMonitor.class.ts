import { Subscription, Subject } from 'rxjs';
import { decodeDeviceMetaState, getControlHander } from './index'
import { ControllerHandler } from './Handler.class';
import { DeviceProductLayout } from './typings';

export class InputControlMonitor {
  $change: Subject<string[]> = new Subject()
  subs = new Subscription()
  lastPressed: string[] = []
  controllers: ControllerHandler[] = []

  monitorByConfig(config: DeviceProductLayout) {
    const handler = this.getControlHandlerByConfig(config)
    return this.monitorControl(handler)
  }

  getControlHandlerByConfig(config: DeviceProductLayout): ControllerHandler {
    return getControlHander(config)
  }

  reset() {
    this.controllers.forEach(control =>
      control.subs.unsubscribe()
    )

    this.controllers.length = 0

    this.subs.unsubscribe()

    // cause new subscription to work
    this.subs = new Subscription()
  }

  monitorControl(controller: ControllerHandler) {
    this.subs.add(
      controller.deviceEvent.subscribe(deviceEvent => {
        // console.log('inputs pressed')
        this.lastPressed = decodeDeviceMetaState(controller.config, deviceEvent)
        this.$change.next(this.lastPressed)
      })
    )

    this.subs.add(
      controller.subscribe()
    )

    return this
  }
}
