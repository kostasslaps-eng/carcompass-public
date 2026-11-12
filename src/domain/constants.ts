// ARCHITECTURE §5 constants. DATA_YEAR is fixed (not the clock) so the demo stays stable.
export const DATA_YEAR = 2026
export const KM_PER_YEAR = 17000
export const ANNUAL_KM = 15000

/** €/litre, owner-provided, Lithuania Nov 2026. */
export const FUEL_PRICE_EUR = { petrol: 1.9, diesel: 2.3, hybrid: 1.9, 'plugin-hybrid': 1.9 } as const
/** €/kWh, assumption. */
export const ELECTRICITY_PRICE_EUR = 0.25

export const FREQ_WEIGHT = { rare: 0.1, common: 0.3, 'very-common': 0.5 } as const
export const USAGE_BONUS = { good: 0.5, ok: 0, poor: -1.5 } as const
export const VERDICT_PENALTY = { recommended: 0, caution: 1, avoid: 3 } as const

export const clamp = (x: number, min: number, max: number) => Math.min(max, Math.max(min, x))
