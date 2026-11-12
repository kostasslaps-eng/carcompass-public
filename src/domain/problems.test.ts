import { describe, expect, test } from 'vitest'
import { generalChecklist, getCar } from '../data'
import type { Problem } from '../data/schema'
import { buildChecklist, OVERLAPS, topChecks } from './checklist'
import { eur, eurRange, km } from './format'
import { groupProblems, mileageWindowText, problemGroup, repairCostText } from './problems'

const p = (over: Partial<Problem>): Problem => ({
  id: 'x',
  name: 'X',
  explanation: 'x',
  mileageKmFrom: 100000,
  mileageKmTo: 150000,
  frequency: 'common',
  severity: 'costly',
  repairCostEurMin: 100,
  repairCostEurMax: 200,
  symptoms: ['x'],
  howToCheck: 'x',
  appliesTo: null,
  ...over,
})

describe('problem groups (§5.6)', () => {
  test('window boundaries', () => {
    const prob = p({})
    expect(problemGroup(prob, 100000)).toBe('now')
    expect(problemGroup(prob, 150000)).toBe('now')
    expect(problemGroup(prob, 60000)).toBe('soon') // starts within 40,000 km
    expect(problemGroup(prob, 59999)).toBe('later')
    expect(problemGroup(prob, 150001)).toBe('past')
  })

  test('mileageKmTo null never becomes past', () => {
    const prob = p({ mileageKmTo: null })
    expect(problemGroup(prob, 999999)).toBe('now')
    expect(problemGroup(prob, 0)).toBe('later')
  })

  test('0 km start counts as now at 0 km', () => {
    expect(problemGroup(p({ mileageKmFrom: 0, mileageKmTo: null }), 0)).toBe('now')
    expect(problemGroup(p({ mileageKmFrom: 0, mileageKmTo: 50000 }), 0)).toBe('now')
  })

  test('order: severity, then frequency', () => {
    const list = [
      p({ id: 'minor', severity: 'minor', frequency: 'very-common' }),
      p({ id: 'costly-rare', severity: 'costly', frequency: 'rare' }),
      p({ id: 'major', severity: 'major', frequency: 'rare' }),
      p({ id: 'costly-vc', severity: 'costly', frequency: 'very-common' }),
    ]
    expect(groupProblems(list, 120000).now.map((x) => x.id)).toEqual(['major', 'costly-vc', 'costly-rare', 'minor'])
  })

  test('BMW 320d at 180,000 km has the rear timing chain under Now', () => {
    const bmw = getCar('bmw-3-e90-320d-n47')!
    expect(groupProblems(bmw.problems, 180000).now.map((x) => x.name)).toContain('Timing chain stretch (rear)')
  })

  test('labels', () => {
    expect(mileageWindowText(p({ mileageKmFrom: 0, mileageKmTo: null }))).toBe('Any mileage')
    expect(mileageWindowText(p({ mileageKmTo: null }))).toBe('From 100,000 km')
    expect(mileageWindowText(p({}))).toBe('100,000–150,000 km')
    expect(repairCostText(p({ repairCostEurMin: 0, repairCostEurMax: 0 }))).toBe('Free — recall')
    expect(repairCostText(p({ repairCostEurMin: 500, repairCostEurMax: 3000 }))).toBe('€500–3,000')
  })
})

describe('checklist assembly', () => {
  const avensis = getCar('toyota-avensis-t27-18')!

  test('sections in order with general + car-specific items', () => {
    const sections = buildChecklist(avensis, 195000, generalChecklist)
    expect(sections.map((s) => s.id)).toEqual(['before', 'seller', 'car', 'drive', 'redflags'])
    const seller = sections[1].items
    expect(seller.slice(0, avensis.checklist.documents.length).every((i) => i.carSpecific)).toBe(true)
    expect(seller.at(-1)!.carSpecific).toBe(false)
    expect(sections[4].items.filter((i) => i.carSpecific)).toHaveLength(avensis.checklist.redFlags.length)
  })

  test('adds howToCheck for now/soon/past problems only', () => {
    const at = 195000
    const expected = avensis.problems.filter((x) => problemGroup(x, at) !== 'later').map((x) => `p-${x.id}`)
    const carItems = buildChecklist(avensis, at, generalChecklist)[2].items.filter((i) => i.id.startsWith('p-'))
    expect(carItems.map((i) => i.id).sort()).toEqual(expected.sort())
    const later = avensis.problems.filter((x) => problemGroup(x, at) === 'later')
    for (const l of later) expect(carItems.find((i) => i.id === `p-${l.id}`)).toBeUndefined()
  })

  test('item ids are unique and stable across mileages', () => {
    const a = buildChecklist(avensis, 50000, generalChecklist).flatMap((s) => s.items.map((i) => i.id))
    expect(new Set(a).size).toBe(a.length)
    const b = buildChecklist(avensis, 250000, generalChecklist).flatMap((s) => s.items.map((i) => i.id))
    expect(b.filter((id) => id.startsWith('g-'))).toEqual(a.filter((id) => id.startsWith('g-')))
  })
})

describe('format', () => {
  test('numbers', () => {
    expect(eur(9800)).toBe('€9,800')
    expect(km(195000)).toBe('195,000 km')
    expect(eurRange([8600, 10600])).toBe('€8,600–€10,600')
  })
})

describe('Before you buy (spec 12 §5)', () => {
  const avensis = getCar('toyota-avensis-t27-18')!

  test('overlap map: the general service-book item is dropped when the car has its own', () => {
    const ids = buildChecklist(avensis, 195000, generalChecklist).flatMap((s) => s.items.map((i) => i.id))
    expect(ids).toContain('doc-0') // "Service book with regular oil changes"
    expect(ids).not.toContain('g-service-book')
    // A DSG-only oil record is a different fluid: the general item stays.
    const passat = getCar('vw-passat-b6-20tdi-bkp')!
    expect(buildChecklist(passat, 200000, generalChecklist).flatMap((s) => s.items.map((i) => i.id))).toContain('g-service-book')
  })

  test('overlap patterns only match clear duplicates', () => {
    const re = OVERLAPS['service-book']
    expect(re.test('Oil change history')).toBe(true)
    expect(re.test('Toyota service history (needed for hybrid warranty extension)')).toBe(true)
    expect(re.test('DSG oil change receipts (automatic only)')).toBe(false)
    expect(re.test('Gearbox oil change invoice if over 150,000 km')).toBe(false)
    // Phase 14 re-scan (50 cars): other gearbox / AWD fluids aren't engine oil either.
    expect(re.test('Multitronic oil change record (automatics)')).toBe(false)
    expect(re.test('S tronic oil change records')).toBe(false)
    expect(re.test('Haldex oil changes every 60,000 km')).toBe(false)
  })

  test('Phase 14 re-scan: three more clear duplicates; near-misses keep the general item', () => {
    const general = (id: string) =>
      buildChecklist(getCar(id)!, 100000, generalChecklist)
        .flatMap((s) => s.items)
        .filter((i) => !i.carSpecific)
        .map((i) => i.id)
    expect(general('ford-fiesta-7-125')).not.toContain('g-inspection') // "Technical inspection report"
    expect(general('tesla-model-y-lr')).not.toContain('g-panels') // "Check panel gaps and paint in good light."
    expect(general('kia-sportage-ql-16gdi')).not.toContain('g-ac') // "Run the A/C on full cold for 10 minutes."
    expect(general('tesla-model-y-lr')).toContain('g-ac') // heating + A/C test is about the heat pump
    expect(general('bmw-3-e90-320d-n47')).toContain('g-inspection') // "…fails inspection" is a red flag, not the TA
    expect(general('vw-golf-7-r')).toContain('g-service-book') // only Haldex / DSG oil records
  })

  test('topChecks: VIN check, up to 3 problem checks (now, past, soon), filled with documents, no duplicates', () => {
    expect(topChecks(avensis, 195000, generalChecklist).map((i) => i.id)).toEqual([
      'g-vin-check',
      'p-valvematic-controller',
      'p-oil-consumption',
      'p-parking-brake',
      'doc-0',
    ])
    // Low mileage: nothing due yet, so documents fill the list.
    expect(topChecks(avensis, 10000, generalChecklist).map((i) => i.id)).toEqual(['g-vin-check', 'doc-0', 'doc-1', 'doc-2'])
    const ids = topChecks(avensis, 195000, generalChecklist).map((i) => i.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  test('past problems come before upcoming ones', () => {
    const bmw = getCar('bmw-3-e90-320d-n47')!
    const items = topChecks(bmw, 300000, generalChecklist)
    expect(items[0].id).toBe('g-vin-check')
    expect(items.length).toBeLessThanOrEqual(5)
  })
})
