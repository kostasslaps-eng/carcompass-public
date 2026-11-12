// ARCHITECTURE §5.1. All scores 1–10 (unrounded; round to 1 decimal only for display).
import type { Car } from '../data/schema'
import { ANNUAL_KM, clamp, ELECTRICITY_PRICE_EUR, FREQ_WEIGHT, FUEL_PRICE_EUR } from './constants'

export interface CarScores {
  reliability: number
  performance: number
  runningCosts: number
  /** € per year at ANNUAL_KM — shown on Research. */
  fuelPerYear: number
  /** maintenance + fuel + repair risk; internal only. */
  annualCost: number
}

export const performanceScore = (car: Car) => clamp(10 - ((car.engine.zeroToHundredSec - 4) * 9) / 8, 1, 10)

export function fuelPerYear(car: Car): number {
  const e = car.engine
  const per100 =
    e.fuel === 'electric' ? (e.consumptionKwh100km ?? 0) * ELECTRICITY_PRICE_EUR : (e.consumptionL100km ?? 0) * FUEL_PRICE_EUR[e.fuel]
  return (ANNUAL_KM / 100) * per100
}

export const repairRisk = (car: Car) =>
  car.problems.reduce((sum, p) => sum + (FREQ_WEIGHT[p.frequency] * (p.repairCostEurMin + p.repairCostEurMax)) / 2 / 3, 0)

export const annualCost = (car: Car) => car.costs.maintenancePerYearEur + fuelPerYear(car) + repairRisk(car)

/** Running-cost scores are relative to the whole dataset, so scores are built for all cars at once. */
export function buildScores(cars: Car[]): Map<string, CarScores> {
  const annual = cars.map(annualCost)
  const min = Math.min(...annual)
  const max = Math.max(...annual)
  return new Map(
    cars.map((car, i) => [
      car.id,
      {
        reliability: car.ratings.reliability,
        performance: performanceScore(car),
        runningCosts: max === min ? 10 : clamp(10 - ((annual[i] - min) / (max - min)) * 9, 1, 10),
        fuelPerYear: fuelPerYear(car),
        annualCost: annual[i],
      },
    ]),
  )
}

/** One-word label for a 1–10 score bar. */
export const scoreWord = (s: number) => (s >= 8 ? 'Excellent' : s >= 6.5 ? 'Good' : s >= 4.5 ? 'Average' : s >= 3 ? 'Weak' : 'Poor')

// Display helpers (spec 12 §1.3). They only change how a score is shown, never the score itself.
/** 1–10 score → 1–5 filled bar segments. */
export const scoreBars = (s: number) => clamp(Math.round(s / 2), 1, 5)

/** Running-cost score (higher = cheaper) → plain word for "Cost to run". */
export const costWord = (s: number) =>
  s >= 8 ? 'Very low' : s >= 6.5 ? 'Low' : s >= 4.5 ? 'Medium' : s >= 3 ? 'High' : 'Very high'
