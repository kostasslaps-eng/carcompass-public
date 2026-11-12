import { expect, test } from 'vitest'
import { DEFAULTS, findQuery, parseFind } from './params'

const p = (s: string) => parseFind(new URLSearchParams(s))

test('empty query gives the spec defaults', () => {
  expect(p('')).toEqual(DEFAULTS)
})

test('round-trips through the URL', () => {
  const f = { ...DEFAULTS, budget: 25000, bodies: ['suv' as const], fuels: ['hybrid' as const], gearbox: 'automatic' as const, usage: 'highway' as const, weights: [0, 0.5, 0.5] as [number, number, number] }
  expect(p(findQuery(f))).toEqual(f)
  expect(findQuery(f)).toContain('w=0,50,50')
})

test('invalid values fall back to defaults or get clamped', () => {
  const f = p('budget=abc&yf=2030&yt=1990&km=5&body=boat,suv,suv&fuel=steam&gear=cvt&use=space&w=1,-2,3')
  expect(f.budget).toBe(10000)
  expect([f.yearFrom, f.yearTo]).toEqual([2004, 2025]) // swapped and clamped
  expect(f.maxKm).toBe(50000)
  expect(f.bodies).toEqual(['suv'])
  expect(f.fuels).toEqual([])
  expect(f.gearbox).toBeNull()
  expect(f.usage).toBe('mixed')
  expect(f.weights).toEqual(DEFAULTS.weights)
})

test('budget snaps to €500 steps', () => {
  expect(p('budget=10249').budget).toBe(10000)
  expect(p('budget=999999').budget).toBe(35000)
})
