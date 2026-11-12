import { cars, generalChecklist, glossary, photoManifest } from './index'
import { CarsSchema, ChecklistSchema, GlossarySchema, PhotoManifestSchema } from './schema'

/** Returns a list of readable problems with the data files; empty = all valid. */
export function validateData(): string[] {
  const checks = [
    ['data/cars.json', CarsSchema.safeParse(cars)],
    ['data/glossary.json', GlossarySchema.safeParse(glossary)],
    ['data/general-checklist.json', ChecklistSchema.safeParse(generalChecklist)],
    ['src/data/photo-manifest.json', PhotoManifestSchema.safeParse(photoManifest)],
  ] as const
  return checks.flatMap(([file, r]) =>
    r.success ? [] : r.error.issues.map((i) => `${file} › ${i.path.join('.') || '(root)'}: ${i.message}`),
  )
}
