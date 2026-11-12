// Static data, bundled at build time. Validation runs in tests and once at dev startup (see validate.ts).
import rawCars from '../../data/cars.json'
import rawChecklist from '../../data/general-checklist.json'
import rawGlossary from '../../data/glossary.json'
import rawManifest from './photo-manifest.json'
import type { Car, GeneralChecklist, GlossaryEntry, PhotoManifest } from './schema'

export const cars = rawCars as unknown as Car[]
export const glossary = rawGlossary as GlossaryEntry[]
export const generalChecklist = rawChecklist as GeneralChecklist
export const photoManifest = rawManifest as PhotoManifest

const byId = new Map(cars.map((c) => [c.id, c]))
export const getCar = (id: string | null | undefined): Car | undefined => (id ? byId.get(id) : undefined)

/** "Toyota Avensis III (T27) 1.8 Valvematic" */
export const carName = (c: Car) => `${c.make} ${c.model} ${c.generation} ${c.engine.name}`
/** "Toyota Avensis" — for tags and compact places. */
export const carShortName = (c: Car) => `${c.make} ${c.model}`
