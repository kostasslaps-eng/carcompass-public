import { describe, expect, test } from 'vitest'
import { cars, getCar } from '../data'
import { mileageNote, typicalKm } from './mileage'
import { estimate, hasPrice, mileageFactor, priceCheck, pricedYears, typicalRange } from './price'
import { buildScores, costWord, performanceScore, scoreBars, scoreWord } from './scores'

describe('price estimate (§5.3, mileage-aware since Phase 13)', () => {
  // Spot checks from the logic-fixes spec A.1 (±1%).
  test.each([
    ['toyota-avensis-t27-18', 2015, 195000, 9600],
    ['mercedes-e-w212-e220cdi', 2013, 250000, 10430],
    ['toyota-rav4-5-hybrid', 2021, 80000, 29880],
    ['bmw-3-e90-320d-n47', 2011, 100000, 5900],
    ['bmw-3-e90-320d-n47', 2011, 300000, 4650],
  ])('%s %i / %i km ≈ €%i', (id, year, km, expected) => {
    const e = estimate(getCar(id)!, year, km)
    expect(Math.abs(e - expected) / expected).toBeLessThan(0.01)
  })

  test('never increases as km increases (every car, every year, 0–400,000 km)', () => {
    for (const car of cars)
      for (let y = car.years.from; y <= car.years.to; y++) {
        let prev = Infinity
        for (let km = 0; km <= 400000; km += 10000) {
          const e = estimate(car, y, km)
          expect(e, `${car.id} ${y} ${km} km`).toBeLessThanOrEqual(prev)
          prev = e
        }
      }
  })

  test('mileage factor: 1.5% per 10,000 km from typical, capped at ±20%', () => {
    expect(mileageFactor(typicalKm(2015), 2015)).toBe(1)
    expect(mileageFactor(typicalKm(2015) + 100000, 2015)).toBeCloseTo(0.85)
    expect(mileageFactor(typicalKm(2015) + 900000, 2015)).toBeCloseTo(0.8)
    expect(mileageFactor(0, 2015)).toBeCloseTo(1.2)
  })

  test('year is clamped to the car range', () => {
    const avensis = getCar('toyota-avensis-t27-18')!
    expect(estimate(avensis, 2030, 100000)).toBe(estimate(avensis, 2018, 100000))
  })

  test('typical range is ±10%, rounded to €100', () => {
    expect(typicalRange(9450)).toEqual([8500, 10400])
    expect(typicalRange(9449)).toEqual([8500, 10400])
  })
})

describe('price check thresholds', () => {
  test.each([
    [7999, 'cheap'],
    [8000, 'fair'],
    [11500, 'fair'],
    [11501, 'above'],
  ])('asking %i vs estimate 10,000 → %s', (asking, result) => {
    expect(priceCheck(asking, 10000)).toBe(result)
  })
})

describe('typical mileage (§5.2)', () => {
  test('17,000 km per year, clamped 15k–350k', () => {
    expect(typicalKm(2015)).toBe(195500)
    expect(typicalKm(2026)).toBe(15000)
    expect(typicalKm(2000)).toBe(350000)
  })
})

describe('scores (§5.1)', () => {
  const scores = buildScores(cars)
  test('performance maps 0–100 time to 1–10', () => {
    const car = getCar('toyota-avensis-t27-18')!
    expect(performanceScore({ ...car, engine: { ...car.engine, zeroToHundredSec: 4 } })).toBe(10)
    expect(performanceScore({ ...car, engine: { ...car.engine, zeroToHundredSec: 12 } })).toBe(1)
    expect(performanceScore({ ...car, engine: { ...car.engine, zeroToHundredSec: 30 } })).toBe(1)
  })
  test('running costs span 1–10 across the dataset; higher = cheaper', () => {
    const rc = [...scores.values()].map((s) => s.runningCosts)
    expect(Math.min(...rc)).toBe(1)
    expect(Math.max(...rc)).toBe(10)
    const cheap = [...scores.values()].sort((a, b) => a.annualCost - b.annualCost)[0]
    expect(cheap.runningCosts).toBe(10)
  })
  test('electric cars use kWh × €0.25', () => {
    const kona = getCar('hyundai-kona-electric-64')!
    expect(scores.get(kona.id)!.fuelPerYear).toBeCloseTo(150 * kona.engine.consumptionKwh100km! * 0.25)
  })
  test('score words', () => {
    expect([9, 7, 5, 3.5, 1].map(scoreWord)).toEqual(['Excellent', 'Good', 'Average', 'Weak', 'Poor'])
  })
})

describe('display helpers (spec 12 §1.3)', () => {
  test('scoreBars: score/2 rounded, clamped to 1–5', () => {
    expect([1, 2, 4.9, 5, 8, 9, 10, 0].map(scoreBars)).toEqual([1, 1, 2, 3, 4, 5, 5, 1])
  })
  test('costWord: higher running-cost score = cheaper', () => {
    expect([8, 6.5, 4.5, 3, 2.9].map(costWord)).toEqual(['Very low', 'Low', 'Medium', 'High', 'Very high'])
  })
})

describe('mileage note (spec 13 A.5)', () => {
  test('low: a car 3+ years old with under half its typical mileage', () => {
    expect(mileageNote(2009, 20000)?.kind).toBe('low')
    expect(mileageNote(2009, 20000)?.text).toBe(
      'Unusually low mileage for a 2009 car — check the VIN history for a rolled-back odometer.',
    )
    const half = 0.5 * typicalKm(2015)
    expect(mileageNote(2015, half - 1)?.kind).toBe('low')
    expect(mileageNote(2015, half)).toBeNull()
  })
  test('a new car is never flagged as low', () => {
    expect(mileageNote(2024, 0)).toBeNull() // 2026 − 3 = 2023 is the newest year checked
    expect(mileageNote(2023, 0)?.kind).toBe('low')
  })
  test('high: over 1.5 × typical, or over 300,000 km', () => {
    expect(mileageNote(2020, 1.5 * typicalKm(2020) + 1)?.kind).toBe('high')
    expect(mileageNote(2020, 1.5 * typicalKm(2020))).toBeNull()
    expect(mileageNote(2005, 300001)?.kind).toBe('high')
    expect(mileageNote(2005, 300000)).toBeNull()
    expect(mileageNote(2015, typicalKm(2015))).toBeNull()
  })
})

describe('price coverage (spec 14 §4)', () => {
  const focus = getCar('ford-focus-3-16tivct')!
  test('priced years = the price points ±1 year, inside the car\'s own years', () => {
    expect(pricedYears(focus)).toEqual({ from: 2011, to: 2014 })
    expect(hasPrice(focus, 2014)).toBe(true)
    expect(hasPrice(focus, 2018)).toBe(false)
    expect(hasPrice(focus, 2010)).toBe(false)
    const avensis = getCar('toyota-avensis-t27-18')!
    expect(pricedYears(avensis)).toEqual(avensis.years)
  })
})
