import { describe, it, expect } from 'vitest'

describe('Charity Contribution Validation', () => {
  it('should accept minimum 10% contribution', () => {
    const contribution = 10
    const isValid = contribution >= 10 && contribution <= 100
    
    expect(isValid).toBe(true)
  })

  it('should reject contribution below 10%', () => {
    const contribution = 9
    const isValid = contribution >= 10 && contribution <= 100
    
    expect(isValid).toBe(false)
  })

  it('should accept maximum 100% contribution', () => {
    const contribution = 100
    const isValid = contribution >= 10 && contribution <= 100
    
    expect(isValid).toBe(true)
  })

  it('should reject contribution above 100%', () => {
    const contribution = 101
    const isValid = contribution >= 10 && contribution <= 100
    
    expect(isValid).toBe(false)
  })
})

describe('Contribution Calculation', () => {
  it('should calculate contribution amount correctly', () => {
    const subscriptionAmount = 9.99
    const contributionPercentage = 10
    const charityAmount = subscriptionAmount * (contributionPercentage / 100)
    
    expect(charityAmount).toBeCloseTo(0.999, 2)
  })

  it('should handle higher contribution percentages', () => {
    const subscriptionAmount = 9.99
    const contributionPercentage = 50
    const charityAmount = subscriptionAmount * (contributionPercentage / 100)
    
    expect(charityAmount).toBeCloseTo(4.995, 2)
  })
})
