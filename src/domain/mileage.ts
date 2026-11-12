// ARCHITECTURE §5.2 (typical mileage) and §5.8 (mileage note).
import { clamp, DATA_YEAR, KM_PER_YEAR } from './constants'

export const typicalKm = (year: number) => clamp((DATA_YEAR + 0.5 - year) * KM_PER_YEAR, 15000, 350000)

/** Warn about suspiciously low or high mileage for the car's age (spec 13 A.5). */
export function mileageNote(year: number, km: number): { kind: 'low' | 'high'; text: string } | null {
  if (year <= DATA_YEAR - 3 && km < 0.5 * typicalKm(year))
    return {
      kind: 'low',
      text: `Unusually low mileage for a ${year} car — check the VIN history for a rolled-back odometer.`,
    }
  if (km > 1.5 * typicalKm(year) || km > 300000)
    return {
      kind: 'high',
      text: 'High mileage — expect wear items soon (clutch, suspension, bushes) and check the service history closely.',
    }
  return null
}
