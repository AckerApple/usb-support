import { ButtonsMap, DeviceProductLayout, IButtonState } from './typings'

export default decodeDeviceMetaState

export function decodeDeviceMetaState(
  metaState: DeviceProductLayout,
  event: number[] // 8 bits
): string[] {
  const pressedButtons = []

  if (!metaState.map || !event) {
    return pressedButtons
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
    const alikes = Object.keys(changedMap)
    .filter(otherBtnName => {
      if (otherBtnName === buttonName) {
        return false
      }

      if (changedMap[otherBtnName].pos !== current.pos) {
        return false
      }

      return true
    })

    // combined value match
    const match = findButtonCombo(alikes, current, {changedMap, seekValue})

    if (match) {
      return true
    }

    return false
  })
}

function findButtonCombo(
  alikes: string[],
  current: IButtonState,
  {changedMap, seekValue, alreadytried = []}: {
    changedMap: {[buttonName: string]: IButtonState}
    seekValue: number
    alreadytried?: string[]
  }
): boolean {
  if (!alikes.length) {
    return false
  }

  const x = [current.value]

  alikes.forEach(name => {
    x.push( changedMap[name].value - current.idle )
  })

  const results = sumSets(x)
  return results.sums.includes(seekValue)
}

interface ButtonStates {
  [buttonName: string]: IButtonState
}

function getButtonMapByEvent(
  map: ButtonsMap,
  currentBits: number[] // 8
): ButtonStates {
  return currentBits.reduce((all, current, index) => {
    Object.keys(map)
      .filter((buttonName) =>
        map[buttonName].pos === index && map[buttonName].idle !== current
      )
      .forEach(buttonName => all[buttonName] = map[buttonName])

      return all
  }, {})
}

function sumSets(x: number[]): {sums: number[], sets: number[][]} {
  var sums: number[] = [];
  var sets: number[][] = [];

  function SubSets(read, queued){
   if( read.length == 4 || (read.length <= 4 && queued.length == 0) ){
    if( read.length > 0 ){
     var total = read.reduce(function(a,b){return a+b;},0);
     if(sums.indexOf(total)==-1){
      sums.push(total);
      sets.push(read.slice().sort());
     }
    }
   }else{
    SubSets(read.concat(queued[0]),queued.slice(1));
    SubSets(read,queued.slice(1));
   }
  }

  SubSets([],x)

  return {sums, sets}
}
