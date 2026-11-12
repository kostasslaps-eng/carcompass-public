// URL helpers (ARCHITECTURE §9). Invalid params fall back to defaults.
import type { Car } from './data/schema'
import { clamp } from './domain/constants'
import { typicalKm } from './domain/mileage'

export const MAX_RESEARCH_KM = 400000
export const KM_STEP = 5000

export const int = (v: string | null) => {
  if (v === null || v.trim() === '') return null
  const n = Number(v)
  return Number.isFinite(n) ? Math.round(n) : null
}

/** Year + km for a car page; missing/invalid values → middle year at its typical mileage; always clamped. */
export function carParams(car: Car, search: URLSearchParams) {
  const year = clamp(int(search.get('year')) ?? Math.round((car.years.from + car.years.to) / 2), car.years.from, car.years.to)
  const kmRaw = int(search.get('km')) ?? Math.round(typicalKm(year) / KM_STEP) * KM_STEP
  return { year, km: clamp(kmRaw, 0, MAX_RESEARCH_KM) }
}

const q = (o: Record<string, number | undefined>) =>
  Object.entries(o)
    .filter(([, v]) => v !== undefined)
    .map(([k, v]) => `${k}=${v}`)
    .join('&')

export const researchUrl = (id: string, year: number, km: number) => `/research/${id}?${q({ year, km })}`
export const buyUrl = (id: string, year: number, km: number, price?: number) => `/buy/${id}?${q({ year, km, price })}`

/** Open another car "at the same year/km", clamped to its range. */
export const sameAgeUrl = (car: Car, year: number, km: number) =>
  researchUrl(car.id, clamp(year, car.years.from, car.years.to), km)

/** Remembers where the user was, so tabs and back links keep their place. In memory only. */
export const journey: { findSearch: string; car: { id: string; year: number; km: number } | null } = {
  findSearch: '',
  car: null,
}
