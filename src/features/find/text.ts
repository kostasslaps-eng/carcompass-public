// Wording for Find result cards (spec 12 §3). Display only: ranking and price formulas are untouched.
import { cars } from '../../data'
import type { Car } from '../../data/schema'
import { eur, eurRange, km } from '../../domain/format'
import { estimate, typicalRange } from '../../domain/price'
import { firstDueProblem, problemWithCost } from '../../domain/problems'
import { betterInstead, type CarFit, type Criterion, type FindInputs } from '../../domain/ranking'
import { KM_STEP } from '../../routes'

const BODY_WORD: Record<string, string> = { hatchback: 'hatchback', sedan: 'sedan', wagon: 'wagon', suv: 'SUV', coupe: 'coupe', convertible: 'convertible', mpv: 'MPV' }
const FUEL_WORD: Record<string, string> = { petrol: 'petrol', diesel: 'diesel', hybrid: 'hybrid', 'plugin-hybrid': 'plug-in hybrid', electric: 'electric' }
const cap = (s: string) => s[0].toUpperCase() + s.slice(1)

/** What a car misses, in plain words (spec 13 A.3): "€1,200 over budget", "Not a wagon", "Petrol, not diesel"… */
export function missText(m: Criterion, r: CarFit, f: FindInputs): string {
  switch (m) {
    case 'budget':
      return `${eur(Math.round(r.gap / 100) * 100)} over budget`
    case 'body':
      return `Not ${/^(?:[aeiou]|SUV|MPV)/.test(BODY_WORD[f.bodies[0]]) ? 'an' : 'a'} ${f.bodies.map((b) => BODY_WORD[b]).join(' or ')}`
    case 'fuel':
      return `${cap(FUEL_WORD[r.car.engine.fuel])}, not ${f.fuels.map((x) => FUEL_WORD[x]).join(' or ')}`
    case 'gearbox':
      return f.gearbox === 'automatic' ? 'Manual only' : 'Automatic only'
    case 'usage':
      return `Not ideal for ${f.usage} driving`
    case 'years':
      return 'Outside your years'
  }
}

/** "Fits all your needs" / "Misses 1 of 4: €1,200 over budget" */
export function matchLine(r: CarFit, f: FindInputs): string {
  if (!r.missed.length) return 'Fits all your needs'
  return `Misses ${r.missed.length} of ${r.criteria.length}: ${r.missed.map((m) => missText(m, r, f)).join(', ')}`
}

/** Year/km the user would actually find within budget (or the cheapest point in their search), km to the nearest 5,000. */
export const searchPoint = (r: CarFit) => {
  const p = r.affordable ?? r.cheapest!
  return { year: p.year, km: Math.round(p.km / KM_STEP) * KM_STEP }
}

/** The "SEARCH FOR" box: what to type into a listings site. The price is always a typical range. */
export function searchFor(r: CarFit) {
  const p = searchPoint(r)
  return {
    engine: r.car.engine.name,
    years: r.affordable ? `${p.year} or newer` : `Cheapest: ${p.year} models`,
    mileage: `up to ~${km(p.km)}`,
    fairPrice: eurRange(typicalRange(estimate(r.car, p.year, p.km))),
  }
}

/** "Watch:" line — the problem to know about at this mileage. */
export function watchLine(car: Car, atKm: number): string {
  const due = firstDueProblem(car.problems, atKm)
  return due ? problemWithCost(due.problem) : 'No serious known problems at this mileage.'
}

/** "Skip:" line — an avoid version of the same model family (needs the optional `family` field; none set yet). */
export function skipFor(car: Car, all: Car[]): string | null {
  if (!car.family) return null
  const bad = all.find((c) => c.id !== car.id && c.family === car.family && c.ratings.verdict === 'avoid')
  return bad ? `Skip: ${bad.engine.name} — ${bad.problems[0].name}` : null
}

/** "Toyota Avensis 1.8 Valvematic (safest choice)" / "BMW 3 Series 325i … — outside your years" (spec B.3). */
export function betterInsteadText(avoid: Car, f: FindInputs): string | null {
  const b = betterInstead(avoid, f, cars)
  if (!b) return null
  const name = `${b.car.make} ${b.car.model} ${b.car.engine.name}`
  if (b.missed.length) return `${name} — ${b.missed.map((m) => missText(m, b, f).replace(/^./, (c) => c.toLowerCase())).join(', ')}`
  return b.kind === 'safest' ? `${name} (safest choice)` : name
}
