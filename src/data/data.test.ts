import { describe, expect, test } from 'vitest'
import { pricedYears } from '../domain/price'
import { buildGlossaryMatcher } from './glossary'
import { cars, generalChecklist, glossary } from './index'
import { validateData } from './validate'

describe('data files', () => {
  test('all data files are valid', () => {
    expect(validateData()).toEqual([])
  })

  test('50 cars with unique ids, every alternative exists', () => {
    const ids = cars.map((c) => c.id)
    expect(ids).toHaveLength(50)
    expect(new Set(ids).size).toBe(50)
    for (const c of cars) for (const a of c.alternatives) expect(ids, `${c.id} → ${a.id}`).toContain(a.id)
  })

  test('alternative rules (spec B.1): similar for caution/avoid, safest has a trade-off, never an avoid car', () => {
    const byId = new Map(cars.map((c) => [c.id, c]))
    for (const c of cars) {
      if (c.ratings.verdict !== 'recommended')
        expect(c.alternatives.some((a) => a.kind === 'similar'), `${c.id} needs a similar`).toBe(true)
      for (const a of c.alternatives) {
        if (a.kind === 'safest') expect(a.tradeOff, `${c.id} → ${a.id} trade-off`).not.toBeNull()
        expect(byId.get(a.id)?.ratings.verdict, `${c.id} → ${a.id}`).not.toBe('avoid')
        expect(a.id).not.toBe(c.id)
      }
    }
  })

  test('every family with 2+ cars shares the same make', () => {
    const makes = new Map<string, Set<string>>()
    for (const c of cars) makes.set(c.family, (makes.get(c.family) ?? new Set()).add(c.make))
    for (const [family, set] of makes) expect([...set], family).toHaveLength(1)
  })

  test('lists cars whose priced years are narrower than their years (info only, spec 14 §4)', () => {
    const narrowed = cars
      .map((c) => ({ c, p: pricedYears(c) }))
      .filter(({ c, p }) => p.from > c.years.from || p.to < c.years.to)
      .map(({ c, p }) => `${c.id}: built ${c.years.from}–${c.years.to}, priced ${p.from}–${p.to}`)
    console.info(`Priced years narrower than years:\n${narrowed.join('\n')}`)
    expect(narrowed.length).toBeLessThan(cars.length)
  })

  test('checklist item ids are unique', () => {
    const ids = generalChecklist.sections.flatMap((s) => s.items.map((i) => i.id))
    expect(new Set(ids).size).toBe(ids.length)
  })

  test('every glossary term appears somewhere in the data', () => {
    const text = JSON.stringify([cars, generalChecklist])
    for (const entry of glossary) {
      const { regex } = buildGlossaryMatcher([entry])
      expect(regex.test(text), `"${entry.term}" not found in data`).toBe(true)
    }
  })

  test('glossary terms and aliases are unique', () => {
    const all = glossary.flatMap((e) => [e.term, ...e.aliases].map((s) => s.toLowerCase()))
    expect(new Set(all).size).toBe(all.length)
  })
})

describe('glossary matcher', () => {
  const { regex, entryFor } = buildGlossaryMatcher(glossary)
  const matches = (s: string) => [...s.matchAll(regex)].map((m) => entryFor(m[1])?.term)

  test('prefers the longest phrase and handles plurals', () => {
    expect(matches('Wet timing belt breaking up')).toEqual(['wet timing belt'])
    expect(matches('e-CVT (hybrid automatic)')).toEqual(['e-CVT'])
    expect(matches('Piezo injectors and glow plugs')).toEqual(['piezo injector', 'glow plug'])
  })

  test('whole words only', () => {
    expect(matches('provincial driving')).toEqual([])
    expect(matches('twin-turbo engine')).toEqual(['turbo'])
  })
})
