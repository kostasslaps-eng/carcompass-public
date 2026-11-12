import { describe, expect, test } from 'vitest'
import { cars, getCar } from '../data'
import { betterInstead, evaluateCar, rank, rankAll, type FindInputs, type RankedCar } from './ranking'
import { buildScores } from './scores'
import { BALANCED } from './triangle'

const scores = buildScores(cars)
const base: FindInputs = {
  budget: 10000,
  yearFrom: 2008,
  yearTo: 2020,
  maxKm: 250000,
  bodies: [],
  fuels: [],
  gearbox: null,
  usage: 'mixed',
  weights: BALANCED,
}
const ids = (list: { car: { id: string } }[]) => list.map((r) => r.car.id)

// ARCHITECTURE §5.7 regression table — Phase 14 (50 cars), from the data-merge spec §6 (expected values from the
// planning chat's independent calculation; do not edit them to match the code).
const missed = (list: RankedCar[]) => list.map((r) => r.missed.join('+'))

describe('§5.7 regression scenarios (Phase 14, 50 cars)', () => {
  test('R1 €10,000, 2008–2020, ≤250k, any, Mixed, Reliable + Budget', () => {
    const r = rank(cars, scores, { ...base, weights: [0.5, 0.5, 0] })
    expect(ids(r.best)).toEqual(['toyota-auris-2-hybrid', 'mazda-3-bm-20', 'honda-civic-8-18'])
    expect(ids(r.close)).toEqual(['nissan-leaf-ze1-40', 'bmw-3-e90-325i-n52', 'vw-golf-7-gti'])
    expect(missed(r.close)).toEqual(['budget', 'years', 'budget'])
    expect(ids(r.avoid)).toEqual(['skoda-fabia-2-12htp', 'ford-focus-3-10ecoboost', 'bmw-3-e90-320d-n47'])
  })

  test('R2 €25,000, 2010–2025, ≤200k, Automatic, Highway, Reliable + Performance', () => {
    const r = rank(cars, scores, {
      ...base,
      budget: 25000,
      yearFrom: 2010,
      yearTo: 2025,
      maxKm: 200000,
      gearbox: 'automatic',
      usage: 'highway',
      weights: [0, 0.5, 0.5],
    })
    expect(ids(r.best)).toEqual(['bmw-5-f10-530d', 'vw-golf-7-gti', 'mazda-6-gj-25'])
    expect(ids(r.close)).toEqual(['toyota-rav4-5-hybrid', 'bmw-3-e90-325i-n52', 'honda-civic-8-22ictdi'])
    expect(missed(r.close)).toEqual(['budget', 'years', 'gearbox'])
    expect(ids(r.avoid)).toEqual(['audi-a4-b8-20tfsi', 'skoda-octavia-2-18tsi', 'bmw-3-e90-320d-n47'])
  })

  test('R3 €5,000, 2004–2020, ≤300k, Hatchback, City, Max budget', () => {
    const r = rank(cars, scores, {
      ...base,
      budget: 5000,
      yearFrom: 2004,
      yearTo: 2020,
      maxKm: 300000,
      bodies: ['hatchback'],
      usage: 'city',
      weights: [1, 0, 0],
    })
    expect(ids(r.best)).toEqual(['toyota-yaris-3-133', 'ford-fiesta-7-125', 'ford-focus-3-16tivct'])
    expect(ids(r.close)).toEqual(['toyota-avensis-t27-18', 'vw-golf-7-16tdi', 'vw-passat-b7-20tdi'])
    expect(missed(r.close)).toEqual(['body', 'budget', 'body'])
    expect(ids(r.avoid)).toEqual(['skoda-fabia-2-12htp', 'ford-focus-3-10ecoboost', 'peugeot-308-t9-12puretech'])
  })

  test('R4 €15,000, 2012–2025, ≤200k, SUV, Mixed, Balanced', () => {
    const r = rank(cars, scores, { ...base, budget: 15000, yearFrom: 2012, yearTo: 2025, maxKm: 200000, bodies: ['suv'] })
    expect(ids(r.best)).toEqual(['honda-crv-4-20', 'kia-sportage-ql-16gdi', 'nissan-qashqai-j11-15dci'])
    expect(ids(r.close)).toEqual(['mazda-3-bm-20', 'nissan-leaf-ze1-40', 'mazda-6-gj-25'])
    expect(missed(r.close)).toEqual(['body', 'body', 'body'])
    expect(ids(r.avoid)).toEqual(['nissan-qashqai-j11-12digt', 'landrover-discovery-sport-td4'])
  })

  test('€35,000, all years, ≤350k, Max budget: no car priced above €15,000 in best', () => {
    const r = rank(cars, scores, { ...base, budget: 35000, yearFrom: 2004, yearTo: 2025, maxKm: 350000, weights: [1, 0, 0] })
    expect(ids(r.best)).toEqual(['ford-fiesta-7-125', 'ford-focus-3-16tivct', 'honda-civic-8-18'])
    for (const x of r.best) expect((x.affordable ?? x.cheapest!).price, x.car.id).toBeLessThanOrEqual(15000)
  })

  // Same inputs as the spec §6 betterInstead case (2004–2025, ≤350k); the 325i is built 2005–2007.
  test('€5,000, 2004–2025, ≤350k, Max performance: best never misses the budget; no Tesla in best or close', () => {
    const r = rank(cars, scores, { ...base, budget: 5000, yearFrom: 2004, yearTo: 2025, maxKm: 350000, weights: [0, 0, 1] })
    expect(ids(r.best)).toEqual(['bmw-3-e90-325i-n52', 'honda-civic-8-18', 'honda-civic-8-22ictdi'])
    expect(r.best.every((x) => !x.missed.includes('budget'))).toBe(true)
    expect([...ids(r.best), ...ids(r.close)].filter((id) => id.startsWith('tesla'))).toEqual([])
  })
})

describe('ranking rules', () => {
  test('best and more hold full matches only; close has exactly one miss', () => {
    const r = rank(cars, scores, base)
    expect([...r.best, ...r.more].every((x) => x.missed.length === 0 && x.car.ratings.verdict !== 'avoid')).toBe(true)
    expect(r.close.every((x) => x.missed.length === 1)).toBe(true)
    expect(r.close.length).toBeLessThanOrEqual(3)
  })

  test('a budget miss is "close" only up to 30 % over budget', () => {
    const r = rank(cars, scores, { ...base, budget: 5000 })
    for (const x of r.close.filter((c) => c.missed[0] === 'budget')) expect(x.gap).toBeLessThanOrEqual(1500)
  })

  test('closest: when nothing fits or is close, the 3 best non-avoid cars (results never empty)', () => {
    const r = rank(cars, scores, { ...base, budget: 1000, bodies: ['coupe'], fuels: ['electric'] })
    expect(r.best).toEqual([])
    expect(r.close).toEqual([])
    expect(r.closest).toHaveLength(3)
    expect(rank(cars, scores, base).closest).toEqual([])
  })

  test('budget score: 1–10 across the query, cheapest to own = 10; scores rounded to 2 decimals', () => {
    const all = rankAll(cars, scores, base)
    const b = all.map((x) => x.budgetScore)
    expect(Math.max(...b)).toBe(10)
    expect(Math.min(...b)).toBe(1)
    for (const x of all) expect(Math.round(x.score * 100) / 100).toBe(x.score)
  })

  test('sorted by score, then reliability, then id', () => {
    const all = rankAll(cars, scores, base)
    for (let i = 1; i < all.length; i++) {
      const [a, b] = [all[i - 1], all[i]]
      expect(a.score > b.score || (a.score === b.score && a.car.ratings.reliability >= b.car.ratings.reliability)).toBe(true)
    }
  })

  test('criteria count only what the user set; years, budget and usage always count', () => {
    const r = evaluateCar(cars[0], base)
    expect(r.criteria).toEqual(['years', 'budget', 'usage'])
    const r2 = evaluateCar(cars[0], { ...base, bodies: ['suv'], fuels: ['petrol'], gearbox: 'manual' })
    expect(r2.criteria).toEqual(['years', 'budget', 'body', 'fuel', 'gearbox', 'usage'])
    expect(r2.missed).toEqual(['body', 'fuel'])
  })

  test('Find never prices a Focus 1.6 newer than 2014 (no ads for those years, spec 14 §4)', () => {
    const focus = getCar('ford-focus-3-16tivct')!
    for (const budget of [2000, 5000, 10000, 30000])
      for (const yearFrom of [2008, 2015, 2017]) {
        const r = evaluateCar(focus, { ...base, budget, yearFrom, yearTo: 2025 })
        expect((r.affordable ?? r.cheapest)!.year, `€${budget} from ${yearFrom}`).toBeLessThanOrEqual(2014)
        if (yearFrom > 2014) expect(r.missed).toContain('years')
      }
  })

  test('affordable point is the newest year within budget; otherwise a gap is reported', () => {
    const r = evaluateCar(getCar('toyota-avensis-t27-18')!, base)
    expect(r.affordable!.price).toBeLessThanOrEqual(10000)
    const r2 = evaluateCar(getCar('toyota-rav4-5-hybrid')!, base)
    expect(r2.affordable).toBeNull()
    expect(r2.gap).toBeGreaterThan(0)
    expect(r2.missed).toContain('budget')
  })

  test('no year overlap counts as a missed criterion', () => {
    const r = evaluateCar(getCar('vw-passat-b6-20tdi-bkp')!, { ...base, yearFrom: 2012 })
    expect(r.missed).toContain('years')
  })
})

describe('betterInstead (spec B.3, cases from the data-merge spec §6)', () => {
  const R1: FindInputs = { ...base, weights: [0.5, 0.5, 0] }
  const pick = (id: string, f: FindInputs) => {
    const b = betterInstead(getCar(id)!, f, cars)
    return b && [b.car.id, b.kind]
  }
  test.each([
    ['bmw-3-e90-320d-n47', R1, 'toyota-avensis-t27-18', 'safest'], // the 325i misses the years
    ['skoda-fabia-2-12htp', R1, 'ford-fiesta-7-125', 'similar'],
    ['ford-focus-3-10ecoboost', R1, 'ford-focus-3-16tivct', 'similar'],
    ['vw-passat-b6-20tdi-bkp', { ...R1, bodies: ['wagon'], fuels: ['diesel'] } as FindInputs, 'vw-passat-b7-20tdi', 'similar'],
    ['bmw-3-e90-320d-n47', { ...base, budget: 5000, yearFrom: 2004, yearTo: 2025, maxKm: 350000, weights: [0, 0, 1] } as FindInputs, 'bmw-3-e90-325i-n52', 'similar'],
  ])('%s → %s', (id, f, expected, kind) => {
    expect(pick(id, f)).toEqual([expected, kind])
  })

  test('no full match: the first similar, with its misses', () => {
    const b = betterInstead(getCar('bmw-3-e90-320d-n47')!, { ...R1, yearFrom: 2019, yearTo: 2020 }, cars)!
    expect(b.car.id).toBe('bmw-3-e90-325i-n52')
    expect(b.kind).toBe('similar')
    expect(b.missed).toContain('years')
  })

  test('Wagon + Diesel never suggests a non-wagon or non-diesel car when a matching alternative exists', () => {
    const f: FindInputs = { ...R1, bodies: ['wagon'], fuels: ['diesel'] }
    for (const c of cars.filter((x) => x.ratings.verdict === 'avoid')) {
      const b = betterInstead(c, f, cars)!
      const anyMatch = c.alternatives.some((a) => evaluateCar(getCar(a.id)!, f).missed.length === 0)
      if (anyMatch) expect(b.missed, `${c.id} → ${b.car.id}`).toEqual([])
    }
  })
})
