// Plain-language wording for Research (spec 12 §4). Display only.
import type { Car } from '../../data/schema'
import { km as fmtKm } from '../../domain/format'
import { hasPrice, noPriceText } from '../../domain/price'

/** "First sentence." + "the rest" (the rest is '' for a one-sentence text). */
export function splitFirstSentence(text: string): [string, string] {
  const m = text.match(/^(.+?[.!?])\s+(.+)$/s)
  return m ? [m[1], m[2]] : [text, '']
}

/** "Based on 38 Lithuanian ads on autoplius.lt for 2009 cars with about 180,000 km (Nov 2026). …" */
export function priceSourceText(car: Car, year: number, km: number): string {
  if (!hasPrice(car, year)) return noPriceText(year)
  const german = car.priceSource.startsWith('mobile.de')
  // First number followed within a few plain words by "ads" ("80 diesel 530 ads" → 80, "only 9 Long Range AWD ads" → 9).
  const n = car.priceSource.match(/(\d+)(?:\s+[A-Za-z0-9/-]+){0,4}?\s+ads\b/)?.[1]
  const where = german ? 'German ads on mobile.de (too few Lithuanian ads)' : 'Lithuanian ads on autoplius.lt'
  const count = n && !german ? `${n} ` : ''
  return `Based on ${count}${where} for ${year} cars with about ${fmtKm(km)} (Nov 2026). An estimate of asking prices, not a valuation.`
}
