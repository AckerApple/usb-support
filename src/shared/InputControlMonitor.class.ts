import { Subscription, Subject } from 'rxjs';
import { decodeDeviceMetaState, getControlHander } from './index'
import { ControllerHandler } from './Handler.class';
import { DeviceProductLayout } from './typings';
import { getPressMapByController, sumSets } from './index.utils';

export class InputControlMonitor {
  $change: Subject<string[]> = new Subject() // pressed
  $unpresses: Subject<string[]> = new Subject() // buttons detected as having been released

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
    // build a map of every possible button combination
    const possibleButtons = getPressMapByController(controller.config)

    this.subs.add(
      controller.deviceEvent.subscribe(deviceEvent => {
        // todo: use a map to decode instead of runtime
        // this.lastPressed = decodeDeviceMetaState(controller.config, deviceEvent)
        const bitKey = deviceEvent.join(' ')
        const pressed = possibleButtons[bitKey]

        /* no longer pressed detection (performance gain instead of listening to $change and un-pressing every call) */
          const unpressed = this.lastPressed
            .filter(oldPress => !pressed.includes(oldPress))

          if (unpressed.length) {
            this.$unpresses.next(unpressed)
          }
        /* end */

        this.lastPressed = [...(pressed || [])] // clone incase others alter whats return (performance hit)
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