import { describe, expect, test } from 'vitest'
import { cars, getCar } from '../../data'
import type { Car } from '../../data/schema'
import { evaluateCar, rank } from '../../domain/ranking'
import { buildScores } from '../../domain/scores'
import { DEFAULTS } from './params'
import { betterInsteadText, matchLine, searchFor, skipFor, watchLine } from './text'

const scores = buildScores(cars)
const rb = { ...DEFAULTS, weights: [0.5, 0.5, 0] as [number, number, number] }

describe('SEARCH FOR box (spec 12 §3.2)', () => {
  test('affordable car: engine, "year or newer", mileage, fair price as a range', () => {
    const auris = rank(cars, scores, rb).best[0]
    expect(auris.car.id).toBe('toyota-auris-2-hybrid')
    const s = searchFor(auris)
    expect(s.engine).toBe('1.8 Hybrid (136 hp system)')
    expect(s.years).toMatch(/^\d{4} or newer$/)
    expect(s.mileage).toMatch(/^up to ~\d{1,3},\d{3} km$/)
    expect(s.fairPrice).toMatch(/^€[\d,]+–€[\d,]+$/) // never a single number
  })

  test('over-budget car shows its cheapest year instead', () => {
    const rav4 = getCar('toyota-rav4-5-hybrid')!
    const r = evaluateCar(rav4, DEFAULTS)
    expect(searchFor(r).years).toMatch(/^Cheapest: \d{4} models$/)
  })
})

describe('Watch line', () => {
  test('first problem due now, with its repair cost', () => {
    expect(watchLine(getCar('bmw-3-e90-320d-n47')!, 180000)).toBe('Timing chain stretch (rear) · €1,000–5,000')
  })
  test('falls back to "coming up", then to a calm line', () => {
    const car = getCar('toyota-avensis-t27-18')!
    const quiet = { ...car, problems: car.problems.map((p) => ({ ...p, mileageKmFrom: 900000, mileageKmTo: null })) }
    expect(watchLine(quiet, 10000)).toBe('No serious known problems at this mileage.')
  })
})

describe('Skip line (family field)', () => {
  const base = getCar('vw-golf-7-gti')!
  const fixture = (id: string, verdict: Car['ratings']['verdict'], family = ''): Car => ({
    ...base,
    id,
    family,
    ratings: { ...base.ratings, verdict },
  })
  test('names an avoid car from the same family', () => {
    const good = fixture('a', 'recommended', 'golf-7')
    const bad = fixture('b', 'avoid', 'golf-7')
    expect(skipFor(good, [good, bad, fixture('c', 'avoid', 'other')])).toBe(
      `Skip: ${base.engine.name} — ${base.problems[0].name}`,
    )
  })
  test('nothing without a family, and never itself', () => {
    expect(skipFor(fixture('a', 'avoid'), [fixture('b', 'avoid')])).toBeNull()
    const self = fixture('a', 'avoid', 'x')
    expect(skipFor(self, [self])).toBeNull()
  })
  test('fills from the data (spec B.4): the Focus 1.6 card names the 1.0 EcoBoost', () => {
    expect(skipFor(getCar('ford-focus-3-16tivct')!, cars)).toBe('Skip: 1.0 EcoBoost 125 — Wet timing belt breaking up')
  })
})

describe('match line', () => {
  test('full match vs misses', () => {
    const r = rank(cars, scores, rb)
    expect(matchLine(r.best[0], rb)).toBe('Fits all your needs')
    const rav4 = getCar('toyota-rav4-5-hybrid')!
    expect(matchLine(evaluateCar(rav4, DEFAULTS), DEFAULTS)).toMatch(/^Misses 1 of 3: €[\d,]+ over budget$/)
  })
})

describe('"Better instead" line (spec B.3)', () => {
  const text = (id: string, f = rb) => betterInsteadText(getCar(id)!, f)
  test('full match: the car name; a safest pick says so', () => {
    expect(text('skoda-fabia-2-12htp')).toBe('Ford Fiesta 1.25 Duratec 82 hp')
    expect(text('bmw-3-e90-320d-n47')).toBe('Toyota Avensis 1.8 Valvematic (safest choice)')
  })
  test('no alternative fits: the first similar plus its misses in plain words', () => {
    expect(text('bmw-3-e90-320d-n47', { ...rb, yearFrom: 2019, yearTo: 2020 })).toBe(
      'BMW 3 Series 325i 2.5 straight-six 218 hp — outside your years',
    )
  })
})
