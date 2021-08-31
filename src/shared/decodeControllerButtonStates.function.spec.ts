import decodeDeviceMetaState, { findButtonCombo, getSamePosButtons } from "./decodeControllerButtonStates.function"
import * as json from "../test/eg-starts.DeviceProductLayout.json"
import { ButtonsMap, DeviceProductLayout, IButtonState } from "./typings"

describe('decodeControllerButtonStates.function.spec.ts', () => {
  let testJson: DeviceProductLayout
  let map: ButtonsMap
  let entries: [string, IButtonState][]

  beforeEach(() => {
    testJson = JSON.parse(JSON.stringify(json)) // deep clone
    map = testJson.map
    entries = Object.entries(map)
  })

  describe('#decodeDeviceMetaState', () => {
    it('no buttons pressed', () => {
      const values = testJson.idle
      const result = decodeDeviceMetaState(testJson, values as any)
      expect(result).toBeDefined()
      expect(result.length).toBe(0)
    })

    it('1 button pressed', () => {
      const values = testJson.idle as number []
      values[entries[0][1].pos] = entries[0][1].value + entries[0][1].idle
      const result = decodeDeviceMetaState(testJson, values as any)
      expect(result).toBeDefined()
      expect(result.length).toBe(1)
      expect(result).toContain(entries[0][0])
    })

    describe('#findButtonCombo', () => {
      it('1 button true', () => {
        const alikes = getSamePosButtons('letterC', testJson.map)
        const result = findButtonCombo(alikes, testJson.map.letterC, {
          changedMap: testJson.map,
          seekValue: entries[0][1].idle + entries[0][1].value,
        })
        expect(result).toBe(true)
      })

      it('1 button false', () => {
        const alikes = getSamePosButtons('letterC', testJson.map)
        const result = findButtonCombo(alikes, testJson.map.letterC, {
          changedMap: testJson.map,
          seekValue: entries[0][1].idle + entries[1][1].value,
        })
        expect(result).toBe(false)
      })

      it('2 buttons true', () => {
        const alikes = getSamePosButtons('letterC', testJson.map)
        const result = findButtonCombo(alikes, testJson.map.letterC, {
          changedMap: testJson.map,
          seekValue: entries[0][1].idle + entries[0][1].value + entries[1][1].value,
        })
        expect(result).toBe(true)
      })

      it('2 buttons true - 1 false', () => {
        const alikes = getSamePosButtons('leftFlipper', testJson.map)
        const result = findButtonCombo(alikes, testJson.map.letterC, {
          changedMap: testJson.map,
          seekValue: entries[0][1].idle + entries[0][1].value + entries[1][1].value,
        })
        expect(result).toBe(false)
      })

      it('buttons false', () => {
        const alikes = getSamePosButtons('letterC', testJson.map)
        const result = findButtonCombo(alikes, testJson.map.letterC, {
          changedMap: testJson.map,
          seekValue: entries[0][1].idle,
        })
        expect(result).toBe(false)
      })
    })

    it('2 buttons pressed', () => {
      const values = testJson.idle as number[]
      expect(entries[0][1].pos).toBe(entries[1][1].pos)

      const value = entries[0][1].idle + entries[0][1].value + entries[1][1].value
      values[entries[0][1].pos] = value
      const result = decodeDeviceMetaState(testJson, values as any)

      expect(result).toBeDefined()
      expect(result.length).toBe(2)
      expect(result).toContain(entries[0][0])
      expect(result).toContain(entries[1][0])
    })
  })

  it('#getSamePosButtons', () => {
    const result = getSamePosButtons('letterC', {
      letterC: {
        pos: 6,
        value: 16,
        idle: 0,
        updatedAt: 1628363581162,
      },
      letterB: {
          pos: 6,
          value: 8,
          idle: 0,
          updatedAt: 1627154826288,
        },
      leftFlipper: {
        pos: 0,
        value: 0,
        idle: 127,
        updatedAt: 1619387577120,
      },
    })

    expect(result).toBeDefined()
    expect(result.length).toBe(1)
    expect(result[0]).toBe('letterB')
  })
})