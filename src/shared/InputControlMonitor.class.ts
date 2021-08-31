import { Subscription, Subject } from 'rxjs';
import { decodeDeviceMetaState, getControlHander } from './index'
import { ControllerHandler } from './Handler.class';
import { DeviceProductLayout } from './typings';
import { sumSets } from './index.utils';

export class InputControlMonitor {
  $change: Subject<string[]> = new Subject()
  subs = new Subscription()
  lastPressed: string[] = []
  controllers: ControllerHandler[] = [] // maybe unused

  monitorByConfig(config: DeviceProductLayout) {
    const handler = this.getControlHandlerByConfig(config)
    return this.monitorControl(handler)
  }

  getControlHandlerByConfig(config: DeviceProductLayout): ControllerHandler {
    return getControlHander(config)
  }

  reset() {
    /* maybe unused */
      this.controllers.forEach(control =>
        control.subs.unsubscribe()
      )

      this.controllers.length = 0
    /* end: maybe unused */

    this.subs.unsubscribe()

    // cause new subscription to work
    this.subs = new Subscription()
  }

  monitorControl(controller: ControllerHandler) {
    // const possibleButtons = getPossibleBtnMap(controller)

    this.subs.add(
      controller.deviceEvent.subscribe(deviceEvent => {
        // todo: use a map to decode instead of runtime
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


/*function getPossibleBtnMap(
  config: DeviceProductLayout
): {[numbers: string]: string[]} {
  const possibles = sumSets()
}*/