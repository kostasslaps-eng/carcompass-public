// ARCHITECTURE §5.6 — which problems matter at a given mileage.
import type { Problem } from '../data/schema'

export type ProblemGroup = 'now' | 'soon' | 'past' | 'later'
export const SOON_KM = 40000

export function problemGroup(p: Problem, km: number): ProblemGroup {
  const to = p.mileageKmTo ?? Infinity
  if (p.mileageKmFrom <= km && km <= to) return 'now'
  if (km < p.mileageKmFrom && p.mileageKmFrom <= km + SOON_KM) return 'soon'
  if (p.mileageKmTo !== null && p.mileageKmTo < km) return 'past'
  return 'later'
}

const SEVERITY_ORDER = { major: 0, costly: 1, minor: 2 } as const
const FREQUENCY_ORDER = { 'very-common': 0, common: 1, rare: 2 } as const

export const compareProblems = (a: Problem, b: Problem) =>
  SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity] || FREQUENCY_ORDER[a.frequency] - FREQUENCY_ORDER[b.frequency]

export function groupProblems(problems: Problem[], km: number): Record<ProblemGroup, Problem[]> {
  const groups: Record<ProblemGroup, Problem[]> = { now: [], soon: [], past: [], later: [] }
  for (const p of problems) groups[problemGroup(p, km)].push(p)
  for (const g of Object.values(groups)) g.sort(compareProblems)
  return groups
}

/** "Any mileage" / "From 120,000 km" / "120,000–200,000 km" */
export function mileageWindowText(p: Problem): string {
  const f = (n: number) => `${n.toLocaleString('en-US')} km`
  if (p.mileageKmFrom === 0) return p.mileageKmTo === null ? 'Any mileage' : `Up to ${f(p.mileageKmTo)}`
  return p.mileageKmTo === null ? `From ${f(p.mileageKmFrom)}` : `${p.mileageKmFrom.toLocaleString('en-US')}–${f(p.mileageKmTo)}`
}

/** "€500–3,000" or "Free — recall" */
export const repairCostText = (p: Problem) =>
  p.repairCostEurMax === 0
    ? 'Free — recall'
    : `€${p.repairCostEurMin.toLocaleString('en-US')}–${p.repairCostEurMax.toLocaleString('en-US')}`

/** The problem a buyer should know about first at this mileage: the top one due now, else the next one coming up. */
export function firstDueProblem(problems: Problem[], km: number): { group: 'now' | 'soon'; problem: Problem } | null {
  const g = groupProblems(problems, km)
  if (g.now[0]) return { group: 'now', problem: g.now[0] }
  if (g.soon[0]) return { group: 'soon', problem: g.soon[0] }
  return null
}

/** "Timing chain stretch (rear) · €1,000–5,000" */
export const problemWithCost = (p: Problem) => `${p.name} · ${repairCostText(p)}`