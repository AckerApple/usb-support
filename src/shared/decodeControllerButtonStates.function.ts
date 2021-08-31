import { sumSets } from './index.utils'
import { ButtonsMap, DeviceProductLayout, IButtonState } from './typings'

export default decodeDeviceMetaState

/** runtime decode button presses
 * - Todo: More performance using a map of all possible presses instead of using this
*/
export function decodeDeviceMetaState(
  metaState: DeviceProductLayout,
  event: number[] // 8 bits
): string[] {
  if (!metaState.map || !event) {
    return []
  }

  const changedMap: ButtonStates = getButtonMapByEvent(metaState.map, event)

  return Object.keys(changedMap).filter((buttonName) => {
    const current = changedMap[buttonName]
    const currentPos = current.pos
    const seekValue: number = event[currentPos]

    // does another matching position have an exact match?
    const otherHasExact = Object.values(changedMap)
      .find(btnMap => btnMap.pos === currentPos && btnMap !== current && btnMap.value === seekValue)
    if (otherHasExact) {
      return false
    }

    // direct value match
    if (current.value === seekValue) {
      return true
    }

    // items on the same pos
    const alikes = getSamePosButtons(buttonName, changedMap)

    // combined value match
    const match = findButtonCombo(alikes, current, {changedMap, seekValue})

    if (match) {
      return true
    }

    return false
  })
}

export function getSamePosButtons(buttonName: string, changedMap: ButtonStates) {
  return Object.keys(changedMap)
  .filter(otherBtnName => {
    if (otherBtnName === buttonName) {
      return false
    }

    if (changedMap[otherBtnName].pos !== changedMap[buttonName].pos) {
      return false
    }

    return true
  })
}

/** determines if multiple button pressed  */
export function findButtonCombo(
  alikes: string[], // two or more button names
  current: IButtonState,
  {changedMap, seekValue}: {
    changedMap: {[buttonName: string]: IButtonState}
    seekValue: number
  }
): boolean {
  if (!alikes.length) {
    return false
  }

  const x: IButtonState[] = [current]

  alikes.forEach(name => {
    x.push( changedMap[name] )
  })

  const results = sumSets(x, (b: IButtonState[]) => {
    return b.reduce((a,b) => a + b.value - current.idle, 0)
  }) // get every possible combination

  return results.sets.find((items, index) => {
    // remove all singular possible combinations
    if (items.length === 1) {
      const isTheCurrentOne = items[0].value === current.value || items[0].value === current.value + current.idle
      if (!isTheCurrentOne) {
        return false
      }
    }

    // possible set must include current value
    if (!items.includes(current)) {
      return false
    }

    if (seekValue === results.sums[index]) {
      return true
    }
  }) !== undefined
}

interface ButtonStates {
  [buttonName: string]: IButtonState
}

function getButtonMapByEvent(
  map: ButtonsMap,
  currentBits: number[] // length === 8
): ButtonStates {
  return currentBits.reduce((all, current, index) => {
    Object.keys(map)
      .filter((buttonName) =>
        map[buttonName].pos === index && map[buttonName].idle !== current
      )
      .forEach((buttonName: string) => all[buttonName] = map[buttonName])

      return all
  }, {} as ButtonStates)
}
