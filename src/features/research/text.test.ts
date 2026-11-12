import { expect, test } from 'vitest'
import { getCar } from '../../data'
import { priceSourceText, splitFirstSentence } from './text'

test('splitFirstSentence', () => {
  expect(splitFirstSentence('The chain stretches. It can snap. Fixing it is costly.')).toEqual([
    'The chain stretches.',
    'It can snap. Fixing it is costly.',
  ])
  expect(splitFirstSentence('Only one sentence here.')).toEqual(['Only one sentence here.', ''])
})

test('price source in plain words', () => {
  expect(priceSourceText(getCar('vw-passat-b6-20tdi-bkp')!, 2007, 300000)).toBe(
    'Based on 38 Lithuanian ads on autoplius.lt for 2007 cars with about 300,000 km (Nov 2026). An estimate of asking prices, not a valuation.',
  )
  expect(priceSourceText(getCar('hyundai-kona-electric-64')!, 2020, 60000)).toMatch(/^Based on German ads on mobile\.de/)
  expect(priceSourceText(getCar('bmw-5-f10-530d')!, 2014, 200000)).toMatch(/^Based on 80 Lithuanian ads/)
  expect(priceSourceText(getCar('tesla-model-3-lr')!, 2021, 80000)).toMatch(/^Based on 9 Lithuanian ads/)
})
