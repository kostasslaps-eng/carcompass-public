// Find inputs ⇄ URL query (ARCHITECTURE §9): #/find?budget=&yf=&yt=&km=&body=&fuel=&gear=&use=&w=
import type { BodyType, Fuel, Usage } from '../../data/schema'
import { clamp } from '../../domain/constants'
import type { FindInputs } from '../../domain/ranking'
import { BALANCED, type Weights } from '../../domain/triangle'
import { int } from '../../routes'

export const LIMITS = {
  budget: { min: 1000, max: 35000, step: 500 },
  years: { min: 2004, max: 2025 },
  km: { min: 50000, max: 350000, step: 10000 },
}
export const BODY_OPTIONS: { value: BodyType; label: string }[] = [
  { value: 'hatchback', label: 'Hatchback' },
  { value: 'sedan', label: 'Sedan' },
  { value: 'wagon', label: 'Wagon' },
  { value: 'suv', label: 'SUV' },
  { value: 'coupe', label: 'Coupe' },
]
export const FUEL_OPTIONS: { value: Fuel; label: string }[] = [
  { value: 'petrol', label: 'Petrol' },
  { value: 'diesel', label: 'Diesel' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'electric', label: 'Electric' },
]
export const USAGE_OPTIONS: { value: Usage; label: string }[] = [
  { value: 'city', label: 'City' },
  { value: 'highway', label: 'Highway' },
  { value: 'mixed', label: 'Mixed' },
]

export const DEFAULTS: FindInputs = {
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

const snap = (v: number, step: number, min: number, max: number) => clamp(Math.round(v / step) * step, min, max)
const list = <T extends string>(v: string | null, allowed: readonly T[]) =>
  [...new Set((v ?? '').split(',').filter((x): x is T => allowed.includes(x as T)))]

function parseWeights(v: string | null): Weights {
  const parts = (v ?? '').split(',').map(Number)
  if (parts.length !== 3 || parts.some((x) => !Number.isFinite(x) || x < 0)) return BALANCED
  const sum = parts[0] + parts[1] + parts[2]
  return sum > 0 ? [parts[0] / sum, parts[1] / sum, parts[2] / sum] : BALANCED
}

export function parseFind(q: URLSearchParams): FindInputs {
  const { budget: B, years: Y, km: K } = LIMITS
  let yf = clamp(int(q.get('yf')) ?? DEFAULTS.yearFrom, Y.min, Y.max)
  let yt = clamp(int(q.get('yt')) ?? DEFAULTS.yearTo, Y.min, Y.max)
  if (yf > yt) [yf, yt] = [yt, yf]
  const gear = q.get('gear')
  const use = q.get('use')
  return {
    budget: snap(int(q.get('budget')) ?? DEFAULTS.budget, B.step, B.min, B.max),
    yearFrom: yf,
    yearTo: yt,
    maxKm: snap(int(q.get('km')) ?? DEFAULTS.maxKm, K.step, K.min, K.max),
    bodies: list(q.get('body'), BODY_OPTIONS.map((o) => o.value)),
    fuels: list(q.get('fuel'), FUEL_OPTIONS.map((o) => o.value)),
    gearbox: gear === 'manual' || gear === 'automatic' ? gear : null,
    usage: use === 'city' || use === 'highway' || use === 'mixed' ? use : DEFAULTS.usage,
    weights: parseWeights(q.get('w')),
  }
}

/** Weights as whole percents, e.g. "50,50,0". */
export const weightsParam = (w: Weights) => w.map((x) => Math.round(x * 100)).join(',')

export function findQuery(f: FindInputs): string {
  const q = new URLSearchParams()
  q.set('budget', String(f.budget))
  q.set('yf', String(f.yearFrom))
  q.set('yt', String(f.yearTo))
  q.set('km', String(f.maxKm))
  if (f.bodies.length) q.set('body', f.bodies.join(','))
  if (f.fuels.length) q.set('fuel', f.fuels.join(','))
  if (f.gearbox) q.set('gear', f.gearbox)
  q.set('use', f.usage)
  q.set('w', weightsParam(f.weights))
  return q.toString().replace(/%2C/g, ',')
}
