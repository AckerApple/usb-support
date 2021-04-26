import { ButtonsMap, DeviceProductLayout, IButtonState } from './typings'

export default decodeDeviceMetaState

export function decodeDeviceMetaState(
  metaState: DeviceProductLayout, event: number[]
): string[] {
  const pressedButtons = []

  if (!metaState.map || !event) {
    return pressedButtons
  }

  const changedMap = getButtonMapByEvent(metaState.map, event)

  return Object.keys(changedMap).filter((buttonName) => {
    const current = changedMap[buttonName]
    const currentPos = current.pos
    const stateValue: number = event[currentPos]

    // direct value match
    if (current.value === stateValue) {
      return true
    } else {
      const currentValue: number = current.value - current.idle

      // combined value match
      const match = Object.keys(changedMap).find((otherBtnName) => {
        if (otherBtnName === buttonName) {
          return false
        }

        const compareMeta = changedMap[otherBtnName]

        if (compareMeta.pos !== current.pos) {
          return false
        }

        const compareValue: number = compareMeta.value - compareMeta.idle
        const testValue = current.idle + compareValue + currentValue//15 + 16 + 16 === 47
        if (testValue === stateValue) {
          return true
        }
      })

      if (match) {
        return true
      }
    }

    return false
  })
}

function getButtonMapByEvent(map: ButtonsMap, currentBits: number[]): {[buttonName: string]: IButtonState} {
  return currentBits.reduce((all, current, index) => {
    Object.keys(map)
      .filter((buttonName) =>
        map[buttonName].pos === index && map[buttonName].idle !== current
      )
      .forEach(buttonName => all[buttonName] = map[buttonName])

      return all
  }, {})
}
