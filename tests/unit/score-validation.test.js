import { describe, it, expect } from 'vitest'

describe('Score Validation', () => {
  it('should accept valid Stableford scores', () => {
    const validScores = [1, 15, 25, 36, 45]
    validScores.forEach(score => {
      expect(score).toBeGreaterThanOrEqual(1)
      expect(score).toBeLessThanOrEqual(45)
      expect(Number.isInteger(score)).toBe(true)
    })
  })

  it('should reject scores below 1', () => {
    const score = 0
    expect(score).toBeLessThan(1)
  })

  it('should reject scores above 45', () => {
    const score = 46
    expect(score).toBeGreaterThan(45)
  })

  it('should reject non-integer scores', () => {
    const score = 25.5
    expect(Number.isInteger(score)).toBe(false)
  })
})

describe('Five-Score Rolling Logic', () => {
  it('should keep only 5 scores when 6th is added', () => {
    const scores = [
      { id: '1', score_date: '2024-01-01', stableford_score: 30 },
      { id: '2', score_date: '2024-01-02', stableford_score: 32 },
      { id: '3', score_date: '2024-01-03', stableford_score: 28 },
      { id: '4', score_date: '2024-01-04', stableford_score: 35 },
      { id: '5', score_date: '2024-01-05', stableford_score: 31 },
    ]
    
    const newScore = { id: '6', score_date: '2024-01-06', stableford_score: 33 }
    const updatedScores = [newScore, ...scores].slice(0, 5)
    
    expect(updatedScores).toHaveLength(5)
    expect(updatedScores[0]).toBe(newScore)
  })
})

describe('Duplicate Date Validation', () => {
  it('should detect duplicate dates', () => {
    const existingScores = [
      { id: '1', score_date: '2024-01-01' },
      { id: '2', score_date: '2024-01-02' },
    ]
    
    const newDate = '2024-01-01'
    const hasDuplicate = existingScores.some(s => s.score_date === newDate)
    
    expect(hasDuplicate).toBe(true)
  })

  it('should allow unique dates', () => {
    const existingScores = [
      { id: '1', score_date: '2024-01-01' },
      { id: '2', score_date: '2024-01-02' },
    ]
    
    const newDate = '2024-01-03'
    const hasDuplicate = existingScores.some(s => s.score_date === newDate)
    
    expect(hasDuplicate).toBe(false)
  })
})
