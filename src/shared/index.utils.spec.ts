import { getPressMapByController, sumSets } from "./index.utils"
import * as json from "../test/eg-starts.DeviceProductLayout.json"
// import * as desktopJson from "../test/desktop-buttons.DeviceProductLayout.json"
// import { DeviceProductLayout, IButtonState } from "./typings"

describe('index.utils.ts', () => {
  describe('#sumSets', () => {
    it('3', () => {
      const results = sumSets([1,2])
      expect(results).toBeDefined()
      expect(results.sums).toBeDefined()
      expect(results.sets).toBeDefined()
      expect(results.sums.length).toBe(3)
      expect(results.sets.length).toBe(3)
      expect(results.sums).toContain(3)
      expect(results.sums).toContain(1)
      expect(results.sums).toContain(2)
    })

    it('4', () => {
      const results = sumSets([1,2,3,4])
      expect(results).toBeDefined()
      expect(results.sums).toBeDefined()
      expect(results.sets).toBeDefined()
      expect(results.sums.length).toBe(10)
      expect(results.sets.length).toBe(10)
    })
  })

  describe('#getPressMapByController', () => {
    /*it('json buttons', () => {
      const result = getPressMapByController(json)
      console.log('result', result)
    })

    it('json buttons', () => {
      const result = getPressMapByController(desktopJson)
      console.log('result', result)
    })*/

    it('two buttons', () => {
      const map = {
        letterC: {
          pos: 6, value: 16,
          idle: 0, updatedAt: 0,
        },
        letterB: {
          pos: 6, value: 8,
          idle: 0, updatedAt: 0,
        },
      }

      const results = getPressMapByController({idle: json.idle, map} as any)
      expect(results).toBeDefined()
      expect(Object.keys(results).length).toBe(4) // 3 combos + idle state
      expect(Object.keys(results)).toContain(json.idle.join(' '))
    })
  })
})
