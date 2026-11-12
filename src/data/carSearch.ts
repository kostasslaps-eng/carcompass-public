import type { Car } from './schema'

/** Lower-case, accents removed: "Škoda" → "skoda". */
const fold = (s: string) => s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase()

/** Car picker filter (spec 12 §4.1): every word of the query must appear in make + model + generation + engine. */
export function filterCars(all: Car[], query: string): Car[] {
  const words = fold(query).split(/\s+/).filter(Boolean)
  if (!words.length) return all
  return all.filter((c) => {
    const text = fold(`${c.make} ${c.model} ${c.generation} ${c.engine.name}`)
    return words.every((w) => text.includes(w))
  })
}
