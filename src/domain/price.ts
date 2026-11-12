// ARCHITECTURE §5.3. Always a "typical asking price" range, never a valuation.
import type { Car } from '../data/schema'
import { clamp } from './constants'
import { eurRange } from './format'
import { typicalKm } from './mileage'

/** 1.5 % of the price per 10,000 km away from the typical mileage for that year (assumption; shown on About). */
export const MILEAGE_RATE = 0.015
/** The mileage adjustment never goes beyond ±20 %. */
export const MILEAGE_CAP = 0.2

export const mileageFactor = (km: number, year: number) =>
  clamp(1 - (MILEAGE_RATE * (km - typicalKm(year))) / 10000, 1 - MILEAGE_CAP, 1 + MILEAGE_CAP)

/**
 * Typical asking price (spec 13 A.1): each price point is first normalised to the typical mileage of its year,
 * points are weighted by year distance only, and the result is adjusted to the requested km.
 * So the estimate never rises as km rises.
 */
export function estimate(car: Car, year: number, km: number): number {
  const y = clamp(year, car.years.from, car.years.to)
  let num = 0
  let den = 0
  for (const p of car.prices) {
    const norm = p.priceEur / mileageFactor(p.mileageKm, p.year)
    const w = 1 / (Math.abs(p.year - y) + 0.5) ** 2
    num += w * norm
    den += w
  }
  return (num / den) * mileageFactor(km, y)
}

/** Years we can price (spec 14 §4): the price points' years ±1, inside the car's own years. */
export function pricedYears(car: Car): { from: number; to: number } {
  const ys = car.prices.map((p) => p.year)
  return { from: Math.max(car.years.from, Math.min(...ys) - 1), to: Math.min(car.years.to, Math.max(...ys) + 1) }
}

/** False when there are not enough ads for that year: show "Not enough ads…", never a range. */
export const hasPrice = (car: Car, year: number) => {
  const p = pricedYears(car)
  return p.from <= year && year <= p.to
}

export const noPriceText = (year: number) => `Not enough ads for a ${year} car to estimate a price.`

const round100 = (x: number) => Math.round(x / 100) * 100

export const typicalRange = (est: number): [number, number] => [round100(est * 0.9), round100(est * 1.1)]

/** "€8,600–€10,600", or the "Not enough ads" note for a year without a price. */
export const typicalPriceText = (car: Car, year: number, km: number) =>
  hasPrice(car, year) ? eurRange(typicalRange(estimate(car, year, km))) : noPriceText(year)

export type PriceCheck = 'cheap' | 'fair' | 'above'

export function priceCheck(asking: number, est: number): PriceCheck {
  if (asking < 0.8 * est) return 'cheap'
  if (asking <= 1.15 * est) return 'fair'
  return 'above'
}
