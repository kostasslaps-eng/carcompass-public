// Mirrors the JSON schema in docs/CarCompass_research_handoff.md plus the Phase 14 fields (family, segment,
// alternative kind/tradeOff). Supersedes data/validate.py, which predates those fields.
import { z } from 'zod'

const str = (max: number) => z.string().min(1).max(max)
const num = z.number()
const intRange = (min: number, max: number) => z.number().int().min(min).max(max)

export const FUELS = ['petrol', 'diesel', 'hybrid', 'plugin-hybrid', 'electric'] as const
export const BODY_TYPES = ['hatchback', 'sedan', 'wagon', 'suv', 'coupe', 'convertible', 'mpv'] as const
export const VERDICTS = ['recommended', 'caution', 'avoid'] as const
export const FITS = ['good', 'ok', 'poor'] as const
export const FREQUENCIES = ['rare', 'common', 'very-common'] as const
export const SEVERITIES = ['minor', 'costly', 'major'] as const
export const SEGMENTS = ['city', 'compact', 'family', 'executive', 'sporty', 'suv-small', 'suv-large'] as const
const kebab = /^[a-z0-9]+(-[a-z0-9]+)*$/

const ProblemSchema = z.strictObject({
  id: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/),
  name: str(40),
  explanation: str(140),
  mileageKmFrom: num.min(0),
  mileageKmTo: num.nullable(),
  frequency: z.enum(FREQUENCIES),
  severity: z.enum(SEVERITIES),
  repairCostEurMin: num.min(0),
  repairCostEurMax: num.min(0),
  symptoms: z.array(str(60)).min(1).max(3),
  howToCheck: str(140),
  appliesTo: z.string().nullable(),
})

export const CarSchema = z
  .strictObject({
    id: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/),
    make: str(60),
    model: str(60),
    generation: str(60),
    /** Cars sharing a family are versions of one model; used for the Find "Skip" line. */
    family: z.string().regex(kebab),
    segment: z.enum(SEGMENTS),
    years: z.strictObject({ from: intRange(1990, 2030), to: intRange(1990, 2030) }),
    engine: z.strictObject({
      name: str(80),
      code: z.string().nullable(),
      fuel: z.enum(FUELS),
      powerHp: num,
      torqueNm: num.nullable(),
      zeroToHundredSec: num.positive(),
      consumptionL100km: num.nullable(),
      consumptionKwh100km: num.nullable(),
    }),
    gearboxes: z
      .array(z.strictObject({ type: z.enum(['manual', 'automatic']), name: str(80), code: z.string().nullable() }))
      .min(1),
    bodyTypes: z.array(z.enum(BODY_TYPES)).min(1),
    seats: num.nullable(),
    bootLitres: num.nullable(),
    ratings: z.strictObject({
      reliability: intRange(1, 10),
      verdict: z.enum(VERDICTS),
      usageFit: z.strictObject({ city: z.enum(FITS), highway: z.enum(FITS), mixed: z.enum(FITS) }),
    }),
    prices: z.array(z.strictObject({ year: num, mileageKm: num, priceEur: num.positive() })).min(3).max(5),
    priceSource: str(300),
    costs: z.strictObject({
      maintenancePerYearEur: num,
      commonParts: z
        .array(
          z.strictObject({ item: str(80), costEurMin: num, costEurMax: num, intervalKm: num.nullable() }),
        )
        .min(2)
        .max(5),
    }),
    problems: z.array(ProblemSchema).min(3).max(8),
    pros: z.array(str(60)).min(3).max(5),
    cons: z.array(str(60)).min(3).max(5),
    verdictText: str(200),
    ownerSummary: str(300),
    alternatives: z
      .array(
        z.strictObject({
          id: z.string(),
          kind: z.enum(['similar', 'safest']),
          reason: str(100),
          tradeOff: str(100).nullable(),
        }),
      )
      .max(3),
    checklist: z.strictObject({
      checks: z.array(str(120)).min(3).max(6),
      documents: z.array(str(100)).min(1).max(4),
      redFlags: z.array(str(120)).min(1).max(4),
    }),
    photos: z
      .array(
        z.strictObject({
          role: z.enum(['main', 'interior', 'rear', 'other']),
          fileUrl: z.string().startsWith('https://upload.wikimedia.org/'),
          pageUrl: z.string().startsWith('https://commons.wikimedia.org/wiki/File:'),
          author: str(200),
          license: str(60),
        }),
      )
      .min(1)
      .max(3),
    sources: z.array(z.strictObject({ title: str(200), url: z.string().url() })).min(2).max(4),
    confidence: z.strictObject({ overall: z.enum(['high', 'medium', 'low']), notes: z.string().nullable() }),
  })
  .superRefine((c, ctx) => {
    const fail = (message: string) => ctx.addIssue({ code: 'custom', message })
    if (c.years.from > c.years.to) fail('years.from > years.to')
    if (c.photos[0].role !== 'main') fail('first photo must be "main"')
    if (c.ratings.verdict !== 'recommended' && !c.alternatives.some((a) => a.kind === 'similar'))
      fail('caution/avoid cars need a "similar" alternative')
    for (const a of c.alternatives) if (a.kind === 'safest' && a.tradeOff == null) fail(`${a.id}: safest needs a tradeOff`)
    if (c.alternatives.some((a) => a.id === c.id)) fail('car lists itself as an alternative')
    const electric = c.engine.fuel === 'electric'
    if (electric && c.engine.consumptionKwh100km == null) fail('electric car needs consumptionKwh100km')
    if (!electric && c.engine.consumptionL100km == null) fail('combustion car needs consumptionL100km')
    for (const p of c.problems) if (p.repairCostEurMin > p.repairCostEurMax) fail(`problem ${p.id}: min > max cost`)
    if (new Set(c.problems.map((p) => p.id)).size !== c.problems.length) fail('duplicate problem ids')
  })

export const CarsSchema = z.array(CarSchema).superRefine((cars, ctx) => {
  const ids = new Set(cars.map((c) => c.id))
  if (ids.size !== cars.length) ctx.addIssue({ code: 'custom', message: 'duplicate car ids' })
  const byId = new Map(cars.map((c) => [c.id, c]))
  const fail = (message: string) => ctx.addIssue({ code: 'custom', message })
  for (const c of cars)
    for (const a of c.alternatives) {
      const alt = byId.get(a.id)
      if (!alt) fail(`${c.id}: unknown alternative ${a.id}`)
      else if (alt.ratings.verdict === 'avoid') fail(`${c.id}: alternative ${a.id} is an avoid car`)
    }
  const makes = new Map<string, string>()
  for (const c of cars) {
    const m = makes.get(c.family) ?? c.make
    if (m !== c.make) fail(`family ${c.family} mixes makes ${m} and ${c.make}`)
    makes.set(c.family, m)
  }
})

export const GlossarySchema = z
  .array(z.strictObject({ term: str(40), aliases: z.array(str(60)), definition: str(120) }))
  .min(1)

export const ChecklistSchema = z.strictObject({
  sections: z
    .array(
      z.strictObject({
        id: z.enum(['before', 'seller', 'car', 'drive', 'redflags']),
        items: z.array(z.strictObject({ id: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/), text: str(120) })).min(1),
      }),
    )
    .length(5),
})

export const PhotoManifestSchema = z.record(
  z.string(),
  z.record(z.string(), z.strictObject({ width: num, height: num })),
)

export type Car = z.infer<typeof CarSchema>
export type Problem = z.infer<typeof ProblemSchema>
export type Fuel = Car['engine']['fuel']
export type BodyType = Car['bodyTypes'][number]
export type Verdict = Car['ratings']['verdict']
export type Segment = Car['segment']
export type Alternative = Car['alternatives'][number]
export type Fit = Car['ratings']['usageFit']['city']
export type Usage = keyof Car['ratings']['usageFit']
export type GlossaryEntry = z.infer<typeof GlossarySchema>[number]
export type GeneralChecklist = z.infer<typeof ChecklistSchema>
export type ChecklistSectionId = GeneralChecklist['sections'][number]['id']
export type PhotoManifest = z.infer<typeof PhotoManifestSchema>
