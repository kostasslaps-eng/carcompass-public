// UI number formats (DESIGN §6): €9,800 · 195,000 km · €8,600–€10,600
const n = (x: number) => Math.round(x).toLocaleString('en-US')

export const eur = (x: number) => `€${n(x)}`
export const km = (x: number) => `${n(x)} km`
export const eurRange = ([lo, hi]: [number, number]) => `€${n(lo)}–€${n(hi)}`
/** Nearest €100, for "around €9,800" lines. */
export const eurAround = (x: number) => eur(Math.round(x / 100) * 100)
