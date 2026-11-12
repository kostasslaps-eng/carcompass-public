import { expect, test } from 'vitest'
import { filterCars } from './carSearch'
import { cars } from './index'

const ids = (q: string) => filterCars(cars, q).map((c) => c.id)

test('empty query returns every car', () => {
  expect(ids('')).toHaveLength(cars.length)
  expect(ids('   ')).toHaveLength(cars.length)
})

test('accent- and case-insensitive: "skoda" finds Škoda', () => {
  expect(ids('skoda').sort()).toEqual(['skoda-fabia-2-12htp', 'skoda-kodiaq-20tdi', 'skoda-octavia-2-18tsi', 'skoda-octavia-2-19tdi'])
  expect(ids('ŠKODA')).toHaveLength(4)
})

test('matches make, model, generation and engine; every word must match', () => {
  expect(ids('avensis 1.8')).toEqual(['toyota-avensis-t27-18'])
  expect(ids('e90')).toEqual(['bmw-3-e90-320d-n47', 'bmw-3-e90-335i-n54', 'bmw-3-e90-325i-n52'])
  expect(ids('bmw 320d')).toEqual(['bmw-3-e90-320d-n47'])
  expect(ids('tdi')).toEqual(expect.arrayContaining(['vw-passat-b6-20tdi-bkp', 'skoda-octavia-2-19tdi', 'skoda-kodiaq-20tdi']))
  expect(ids('zzz')).toEqual([])
})
