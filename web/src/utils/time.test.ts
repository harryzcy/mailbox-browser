import { describe, expect, it } from 'vitest'

import { getNextMonthYear, getPreviousMonthYear } from 'utils/time'

describe('getNextMonthYear', () => {
  it('should return the next month and same year', () => {
    const result = getNextMonthYear(5, 2024)
    expect(result).toEqual({ month: 6, year: 2024 })
  })

  it('should return January and next year when month is December', () => {
    const result = getNextMonthYear(12, 2024)
    expect(result).toEqual({ month: 1, year: 2025 })
  })
})

describe('getPreviousMonthYear', () => {
  it('should return the previous month and same year', () => {
    const result = getPreviousMonthYear(5, 2024)
    expect(result).toEqual({ month: 4, year: 2024 })
  })

  it('should return December and previous year when month is January', () => {
    const result = getPreviousMonthYear(1, 2024)
    expect(result).toEqual({ month: 12, year: 2023 })
  })
})
