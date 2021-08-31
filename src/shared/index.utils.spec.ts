import { sumSets } from "./index.utils"

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
})