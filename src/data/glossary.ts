import type { GlossaryEntry } from './schema'

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/**
 * One regex matching any glossary term or alias as a whole word (optional plural "s"/"es"), case-insensitive.
 * Longest phrases come first so "wet timing belt" wins over "timing belt" and "e-CVT" over "CVT".
 */
export function buildGlossaryMatcher(entries: GlossaryEntry[]) {
  const lookup = new Map<string, GlossaryEntry>()
  for (const e of entries) for (const p of [e.term, ...e.aliases]) lookup.set(p.toLowerCase(), e)
  const phrases = [...lookup.keys()].sort((a, b) => b.length - a.length).map(escape)
  const regex = new RegExp(`(?<![\\p{L}\\p{N}])(${phrases.join('|')})(?:e?s)?(?![\\p{L}\\p{N}])`, 'giu')
  return { regex, entryFor: (match: string) => lookup.get(match.toLowerCase()) }
}

export type GlossaryPart = string | { text: string; entry: GlossaryEntry }

/** Splits text into plain strings and glossary hits (first occurrence of each term only). */
export function splitGlossary(text: string, matcher: ReturnType<typeof buildGlossaryMatcher>): GlossaryPart[] {
  const parts: GlossaryPart[] = []
  const seen = new Set<string>()
  let last = 0
  for (const m of text.matchAll(matcher.regex)) {
    const entry = matcher.entryFor(m[1])
    if (!entry || seen.has(entry.term)) continue
    seen.add(entry.term)
    parts.push(text.slice(last, m.index), { text: m[0], entry })
    last = m.index + m[0].length
  }
  parts.push(text.slice(last))
  return parts.filter((p) => p !== '')
}
