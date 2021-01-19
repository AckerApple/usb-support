import { IDeviceMetaState } from './app.component'

export default function decodeDeviceMetaState(metaState: IDeviceMetaState): string[] {
  const pressedButtons = []

  if (!metaState.map || !metaState.lastEvent) {
    return pressedButtons
  }

  const currentBits: number[] = metaState.lastEvent.data

  const changedMap: Record<string, any> = currentBits.reduce((all, current, index) => {
    Object.keys(metaState.map)
      .filter((buttonName) =>
        metaState.map[buttonName].pos === index && metaState.map[buttonName].idle !== current
      )
      .forEach(buttonName => all[buttonName] = metaState.map[buttonName])

      return all
  }, {})

  return Object.keys(changedMap).filter((buttonName) => {
    const current = changedMap[buttonName]
    const currentPos = current.pos
    const stateValue: number = currentBits[currentPos]

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
