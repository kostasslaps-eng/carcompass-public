// PRODUCT_SPEC §4.4: general items + car-specific items + howToCheck of problems in now/soon/past.
import type { Car, ChecklistSectionId, GeneralChecklist } from '../data/schema'
import { compareProblems, problemGroup } from './problems'

export interface ChecklistItem {
  /** Stable per car (independent of mileage) so ticks survive changes. */
  id: string
  text: string
  carSpecific: boolean
}
export interface ChecklistSection {
  id: ChecklistSectionId
  title: string
  items: ChecklistItem[]
}

export const SECTION_TITLES: Record<ChecklistSectionId, string> = {
  before: 'Before you go',
  seller: 'Ask the seller for',
  car: 'At the car',
  drive: 'On the test drive',
  redflags: 'Walk away if',
}

export function buildChecklist(car: Car, km: number, general: GeneralChecklist): ChecklistSection[] {
  const g = (id: ChecklistSectionId): ChecklistItem[] =>
    general.sections.find((s) => s.id === id)!.items.map((i) => ({ id: `g-${i.id}`, text: i.text, carSpecific: false }))
  const own = (prefix: string, texts: string[]): ChecklistItem[] =>
    texts.map((text, i) => ({ id: `${prefix}-${i}`, text, carSpecific: true }))

  const order = { now: 0, soon: 1, past: 2, later: 3 }
  const problemChecks = car.problems
    .filter((p) => problemGroup(p, km) !== 'later')
    .sort((a, b) => order[problemGroup(a, km)] - order[problemGroup(b, km)] || compareProblems(a, b))
    .map((p) => ({ id: `p-${p.id}`, text: p.howToCheck, carSpecific: true }))

  const items: Record<ChecklistSectionId, ChecklistItem[]> = {
    before: g('before'),
    seller: [...own('doc', car.checklist.documents), ...g('seller')],
    car: [...own('check', car.checklist.checks), ...problemChecks, ...g('car')],
    drive: g('drive'),
    redflags: [...own('flag', car.checklist.redFlags), ...g('redflags')],
  }
  // Drop a general item when a car-specific item on this page already says the same thing.
  const carTexts = Object.values(items).flatMap((list) => list.filter((i) => i.carSpecific).map((i) => i.text))
  const duplicate = (i: ChecklistItem) => !i.carSpecific && carTexts.some((t) => OVERLAPS[i.id.slice(2)]?.test(t))
  return (Object.keys(items) as ChecklistSectionId[]).map((id) => ({
    id,
    title: SECTION_TITLES[id],
    items: items[id].filter((i) => !duplicate(i)),
  }))
}

/**
 * General item id → pattern of a car-specific item that duplicates it (spec 12 §5). Only clear duplicates, found by
 * checking all 50 cars (lists in PROGRESS.md, Phases 12c and 14). DSG / gearbox / reduction-gear / Multitronic /
 * S tronic / Haldex oil records are other fluids: not a match.
 */
export const OVERLAPS: Record<string, RegExp> = {
  'service-book': /^(?!.*\b(?:DSG|gearbox|reduction gear|Multitronic|S tronic|Haldex)\b).*(?:service (?:book|history)|oil change)/i,
  inspection: /technical inspection/i,
  panels: /panel gaps/i,
  ac: /A\/C on full cold/i,
}

/** "Top 5 for this car": VIN check, up to 3 problem checks (now → past → soon), filled with documents (spec 12 §5). */
export function topChecks(car: Car, km: number, general: GeneralChecklist): ChecklistItem[] {
  const all = buildChecklist(car, km, general).flatMap((s) => s.items)
  const groupOrder = { now: 0, past: 1, soon: 2, later: 3 }
  const problems = car.problems
    .filter((p) => problemGroup(p, km) !== 'later')
    .sort((a, b) => groupOrder[problemGroup(a, km)] - groupOrder[problemGroup(b, km)] || compareProblems(a, b))
    .slice(0, 3)
    .map((p) => `p-${p.id}`)
  const docs = car.checklist.documents.map((_, i) => `doc-${i}`)
  const ids = [...new Set(['g-vin-check', ...problems, ...docs])].slice(0, 5)
  return ids.map((id) => all.find((i) => i.id === id)).filter((i): i is ChecklistItem => !!i)
}
