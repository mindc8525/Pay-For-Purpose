import { describe, it, expect } from 'vitest'
import { RandomDrawStrategy, AlgorithmicDrawStrategy } from '@/server/services/draw-service'

describe('Draw Strategies', () => {
  describe('RandomDrawStrategy', () => {
    it('should generate exactly 5 numbers', () => {
      const strategy = new RandomDrawStrategy()
      const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
      const result = strategy.generate(numbers, {})
      
      expect(result).toHaveLength(5)
    })

    it('should return sorted numbers', () => {
      const strategy = new RandomDrawStrategy()
      const numbers = [10, 5, 3, 8, 1, 2, 7, 4, 6, 9]
      const result = strategy.generate(numbers, {})
      
      for (let i = 1; i < result.length; i++) {
        expect(result[i]).toBeGreaterThanOrEqual(result[i - 1])
      }
    })

    it('should only use numbers from input', () => {
      const strategy = new RandomDrawStrategy()
      const numbers = [1, 2, 3, 4, 5]
      const result = strategy.generate(numbers, {})
      
      result.forEach(n => {
        expect(numbers).toContain(n)
      })
    })

    it('should supplement pool when input has fewer than 5 numbers', () => {
      const strategy = new RandomDrawStrategy()
      const numbers = [12, 24]
      const result = strategy.generate(numbers, {})
      
      expect(result).toHaveLength(5)
      result.forEach(n => {
        expect(n).toBeGreaterThanOrEqual(1)
        expect(n).toBeLessThanOrEqual(45)
      })
    })
  })

  describe('AlgorithmicDrawStrategy', () => {
    it('should generate exactly 5 numbers', () => {
      const strategy = new AlgorithmicDrawStrategy()
      const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
      const result = strategy.generate(numbers, { frequency: {} })
      
      expect(result).toHaveLength(5)
    })

    it('should return sorted numbers', () => {
      const strategy = new AlgorithmicDrawStrategy()
      const numbers = [10, 5, 3, 8, 1, 2, 7, 4, 6, 9]
      const result = strategy.generate(numbers, { frequency: {} })
      
      for (let i = 1; i < result.length; i++) {
        expect(result[i]).toBeGreaterThanOrEqual(result[i - 1])
      }
    })

    it('should supplement pool when input has fewer than 5 numbers', () => {
      const strategy = new AlgorithmicDrawStrategy()
      const numbers = [7]
      const result = strategy.generate(numbers, { frequency: {} })
      
      expect(result).toHaveLength(5)
      result.forEach(n => {
        expect(n).toBeGreaterThanOrEqual(1)
        expect(n).toBeLessThanOrEqual(45)
      })
    })
  })
})
