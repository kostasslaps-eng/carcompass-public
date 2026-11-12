// ARCHITECTURE §5.5 — Find ranking. Do not tweak constants without the owner's OK.
import type { BodyType, Car, Fuel, Usage } from '../data/schema'
import { clamp, USAGE_BONUS, VERDICT_PENALTY } from './constants'
import { typicalKm } from './mileage'
import { estimate, pricedYears } from './price'
import { annualCost, type CarScores } from './scores'
import type { Weights } from './triangle'

export interface FindInputs {
  budget: number
  yearFrom: number
  yearTo: number
  maxKm: number
  bodies: BodyType[]
  fuels: Fuel[]
  gearbox: 'manual' | 'automatic' | null
  usage: Usage
  weights: Weights
}

export type Criterion = 'years' | 'budget' | 'body' | 'fuel' | 'gearbox' | 'usage'

/** How one car fits the user's needs (no score: the budget score depends on every car in the query). */
export interface CarFit {
  car: Car
  /** Criteria the user set (years, budget and usage always count). */
  criteria: Criterion[]
  missed: Criterion[]
  /** Newest year within budget, at the km we assumed for it. */
  affordable: { year: number; km: number; price: number } | null
  /** € over budget at the oldest year in range, when nothing is affordable. */
  gap: number
  /** The oldest-year point used for the gap (shown as "cheapest in your years"); null when affordable. */
  cheapest: { year: number; km: number; price: number } | null
}

export interface RankedCar extends CarFit {
  score: number
  /** Find's "Budget" corner: cheap to buy and run, relative to the other cars in this query (spec 13 A.2). */
  budgetScore: number
}

/** A used car loses about 10 % of its price per year (assumption; shown on About). */
export const DEPRECIATION_RATE = 0.1
/** A one-criterion miss on budget still counts as "close" up to 30 % over budget (spec 13 A.3). */
export const CLOSE_BUDGET_GAP = 0.3

export function evaluateCar(car: Car, f: FindInputs): CarFit {
  // Only years with enough ads count (spec 14 §4): a 2018 Focus 1.6 must not borrow 2013 prices.
  const years = pricedYears(car)
  const lo = Math.max(years.from, f.yearFrom)
  const hi = Math.min(years.to, f.yearTo)
  const yearsMet = lo <= hi
  // shortcut: with no year overlap the budget is judged on the car's own priced years (years is already a miss).
  const [from, to] = yearsMet ? [lo, hi] : [years.from, years.to]

  let affordable: CarFit['affordable'] = null
  for (let y = to; y >= from; y--) {
    const km = Math.min(typicalKm(y), f.maxKm)
    const price = estimate(car, y, km)
    if (price <= f.budget) {
      affordable = { year: y, km, price }
      break
    }
  }
  const oldestKm = Math.min(typicalKm(from), f.maxKm)
  const cheapest = affordable ? null : { year: from, km: oldestKm, price: estimate(car, from, oldestKm) }
  const gap = cheapest ? cheapest.price - f.budget : 0

  const criteria: Criterion[] = ['years', 'budget']
  const missed: Criterion[] = []
  if (!yearsMet) missed.push('years')
  if (!affordable) missed.push('budget')
  if (f.bodies.length) {
    criteria.push('body')
    if (!car.bodyTypes.some((b) => f.bodies.includes(b))) missed.push('body')
  }
  if (f.fuels.length) {
    criteria.push('fuel')
    if (!f.fuels.includes(car.engine.fuel)) missed.push('fuel')
  }
  if (f.gearbox) {
    criteria.push('gearbox')
    if (!car.gearboxes.some((g) => g.type === f.gearbox)) missed.push('gearbox')
  }
  criteria.push('usage')
  if (car.ratings.usageFit[f.usage] === 'poor') missed.push('usage')

  return { car, criteria, missed, affordable, gap: Math.max(0, gap), cheapest }
}

/** Every car scored and sorted (score desc, then reliability desc, then id). */
export function rankAll(cars: Car[], scores: Map<string, CarScores>, f: FindInputs): RankedCar[] {
  const fits = cars.map((c) => evaluateCar(c, f))
  // Yearly cost to own = running costs (§5.1) + value lost, at the price the card shows.
  const own = fits.map((r) => annualCost(r.car) + DEPRECIATION_RATE * (r.affordable ?? r.cheapest!).price)
  const min = Math.min(...own)
  const max = Math.max(...own)
  const [wB, wR, wP] = f.weights
  return fits
    .map((r, i) => {
      const s = scores.get(r.car.id)!
      const budgetScore = max === min ? 10 : clamp(10 - ((own[i] - min) / (max - min)) * 9, 1, 10)
      const triangle = wB * budgetScore + wR * s.reliability + wP * s.performance
      const fit = r.car.ratings.usageFit[f.usage]
      const penalty = 2.5 * r.missed.length + (r.gap > 0 ? Math.min(3, (10 * r.gap) / f.budget) : 0)
      const raw = triangle + USAGE_BONUS[fit] - penalty - VERDICT_PENALTY[r.car.ratings.verdict]
      // Round before sorting: exact ties exist in the real data.
      return { ...r, budgetScore, score: Math.round(raw * 100) / 100 }
    })
    .sort(
      (a, b) =>
        b.score - a.score ||
        b.car.ratings.reliability - a.car.ratings.reliability ||
        (a.car.id < b.car.id ? -1 : a.car.id > b.car.id ? 1 : 0),
    )
}

export interface FindResults {
  /** Full matches, top 3. */
  best: RankedCar[]
  /** One missed criterion (a budget miss only up to 30 % over), at most 3. */
  close: RankedCar[]
  /** Full matches 4–8. */
  more: RankedCar[]
  avoid: RankedCar[]
  /** Only when best and close are both empty: the 3 highest-scoring non-avoid cars, so results are never empty. */
  closest: RankedCar[]
}

export function rank(cars: Car[], scores: Map<string, CarScores>, f: FindInputs): FindResults {
  const ranked = rankAll(cars, scores, f)
  const ok = ranked.filter((r) => r.car.ratings.verdict !== 'avoid')
  const full = ok.filter((r) => r.missed.length === 0)
  const close = ok
    .filter((r) => r.missed.length === 1 && (r.missed[0] !== 'budget' || r.gap <= CLOSE_BUDGET_GAP * f.budget))
    .slice(0, 3)
  const best = full.slice(0, 3)
  return {
    best,
    close,
    more: full.slice(3, 8),
    avoid: ranked.filter((r) => r.car.ratings.verdict === 'avoid' && r.missed.length === 0).slice(0, 3),
    closest: best.length || close.length ? [] : ok.slice(0, 3),
  }
}

/**
 * "Better instead" for an avoid card (spec B.3): the first `similar` alternative that fits everything, else the first
 * `safest` that fits, else the first `similar` with what it misses. Null when the car lists no alternatives.
 */
export function betterInstead(
  avoid: Car,
  f: FindInputs,
  cars: Car[],
): (CarFit & { kind: Car['alternatives'][number]['kind'] }) | null {
  const fits = avoid.alternatives.flatMap((a) => {
    const alt = cars.find((c) => c.id === a.id)
    return alt ? [{ ...evaluateCar(alt, f), kind: a.kind }] : []
  })
  const ok = (kind: string) => fits.find((x) => x.kind === kind && x.missed.length === 0)
  return ok('similar') ?? ok('safest') ?? fits.find((x) => x.kind === 'similar') ?? fits[0] ?? null
}
