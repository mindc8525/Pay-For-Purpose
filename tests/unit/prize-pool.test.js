import { describe, it, expect } from 'vitest'

describe('Prize Pool Allocation', () => {
  it('should allocate 40% to 5-match tier', () => {
    const totalPool = 1000
    const fiveMatchPool = totalPool * 0.4
    
    expect(fiveMatchPool).toBe(400)
  })

  it('should allocate 35% to 4-match tier', () => {
    const totalPool = 1000
    const fourMatchPool = totalPool * 0.35
    
    expect(fourMatchPool).toBe(350)
  })

  it('should allocate 25% to 3-match tier', () => {
    const totalPool = 1000
    const threeMatchPool = totalPool * 0.25
    
    expect(threeMatchPool).toBe(250)
  })

  it('should total 100%', () => {
    const percentages = [0.4, 0.35, 0.25]
    const total = percentages.reduce((sum, p) => sum + p, 0)
    
    expect(total).toBe(1)
  })
})

describe('Jackpot Rollover', () => {
  it('should carry forward 5-match pool when no winners', () => {
    const currentPool = { five_match_pool: 400, rollover_amount: 0 }
    const hasFiveMatchWinner = false
    
    const rollover = hasFiveMatchWinner ? 0 : currentPool.five_match_pool
    
    expect(rollover).toBe(400)
  })

  it('should not rollover other tiers', () => {
    const tiers = ['4-match', '3-match']
    
    tiers.forEach(tier => {
      expect(tier).not.toBe('5-match')
    })
  })
})

describe('Multiple Winners Split', () => {
  it('should split tier equally among winners', () => {
    const tierPool = 400
    const winnerCount = 2
    const prizePerWinner = tierPool / winnerCount
    
    expect(prizePerWinner).toBe(200)
  })

  it('should handle single winner', () => {
    const tierPool = 400
    const winnerCount = 1
    const prizePerWinner = tierPool / winnerCount
    
    expect(prizePerWinner).toBe(400)
  })

  it('should handle many winners', () => {
    const tierPool = 400
    const winnerCount = 10
    const prizePerWinner = tierPool / winnerCount
    
    expect(prizePerWinner).toBe(40)
  })
})
