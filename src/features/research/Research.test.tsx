import { fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { beforeEach, expect, test } from 'vitest'
import { getCar } from '../../data'
import { eurRange } from '../../domain/format'
import { estimate, typicalRange } from '../../domain/price'
import { typicalKm } from '../../domain/mileage'
import { KM_STEP } from '../../routes'
import { Research } from './Research'

beforeEach(() => localStorage.clear())

function Where() {
  const l = useLocation()
  return <output data-testid="where">{l.pathname + l.search}</output>
}

const renderAt = (url: string) =>
  render(
    <MemoryRouter initialEntries={[url]}>
      <Routes>
        <Route path="/research/:carId?" element={<Research />} />
        <Route path="/buy/:carId" element={<Where />} />
      </Routes>
      <Where />
    </MemoryRouter>,
  )

test('BMW 320d, 2009, 180,000 km: Bottom line names the biggest risk now with its cost', () => {
  renderAt('/research/bmw-3-e90-320d-n47?year=2009&km=180000')
  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('BMW 3 Series E90 / E91 320d 2.0 diesel')
  const bottom = screen.getByTestId('bottom-line')
  expect(bottom).toHaveTextContent('Avoid at 180,000 km')
  expect(within(bottom).getByTestId('verdict')).toHaveTextContent(/^Avoid unless/)
  expect(bottom).toHaveTextContent('Biggest risk now: Timing chain stretch (rear) · €1,000–5,000 to fix')
  expect(bottom).toHaveTextContent(/Typical asking price: €[\d,]+–€[\d,]+/)
})

test('problem rows: first one open, the rest closed; a term tap shows its meaning without toggling the row', () => {
  renderAt('/research/bmw-3-e90-320d-n47?year=2009&km=180000')
  const rows = within(screen.getByTestId('group-now')).getAllByTestId('problem-row')
  const toggle = (row: HTMLElement) => within(row).getByTestId('problem-toggle')
  expect(rows[0]).toHaveAttribute('data-problem-id', 'timing-chain')
  expect(toggle(rows[0])).toHaveAttribute('aria-expanded', 'true')
  expect(toggle(rows[1])).toHaveAttribute('aria-expanded', 'false')
  expect(within(rows[1]).queryByText(/How to check:/)).not.toBeVisible()
  const term = within(rows[1]).getAllByRole('button')[0] // a glossary term in the closed row's title
  fireEvent.click(term)
  expect(toggle(rows[1])).toHaveAttribute('aria-expanded', 'false')
  expect(within(rows[1]).getAllByRole('note')[0]).toBeVisible()
  fireEvent.click(toggle(rows[1]))
  expect(within(rows[1]).getByText(/How to check:/)).toBeVisible()
  expect(screen.getByText(/Check now · \d/)).toBeInTheDocument()
})

test('car picker: search finds Škoda by "skoda", keyboard and Esc work', () => {
  renderAt('/research/bmw-3-e90-320d-n47?year=2009&km=180000')
  const change = screen.getByTestId('change-car')
  change.focus()
  fireEvent.click(change)
  const search = screen.getByTestId('car-picker-search')
  expect(search).toHaveFocus()
  fireEvent.change(search, { target: { value: 'skoda' } })
  const picker = screen.getByTestId('car-picker')
  expect(within(picker).getAllByRole('button').map((b) => b.dataset.testid)).toEqual([
    'car-option-skoda-fabia-2-12htp',
    'car-option-skoda-kodiaq-20tdi',
    'car-option-skoda-octavia-2-19tdi',
    'car-option-skoda-octavia-2-18tsi',
  ])
  fireEvent.keyDown(document, { key: 'Escape' })
  expect(screen.queryByTestId('car-picker')).not.toBeInTheDocument()
  expect(change).toHaveFocus()

  fireEvent.click(change)
  fireEvent.click(screen.getByTestId('car-option-toyota-avensis-t27-18'))
  expect(screen.getAllByTestId('where')[0]).toHaveTextContent('/research/toyota-avensis-t27-18?year=2009&km=180000')
})

test('alternatives open at the same year/km, clamped to that car', () => {
  renderAt('/research/bmw-3-e90-320d-n47?year=2009&km=180000')
  const link = within(screen.getByTestId('alternatives')).getByRole('link', { name: /Toyota Avensis/ })
  expect(link).toHaveAttribute('href', '/research/toyota-avensis-t27-18?year=2009&km=180000')
})

test('"I\'m going to see one" carries car, year and km', () => {
  renderAt('/research/toyota-avensis-t27-18?year=2015&km=195000')
  fireEvent.click(screen.getByTestId('going-to-see'))
  expect(screen.getAllByTestId('where')[0]).toHaveTextContent('/buy/toyota-avensis-t27-18?year=2015&km=195000')
})

test('free recall shows "Free — recall"; 0 km window shows "Any mileage"', () => {
  renderAt('/research/hyundai-kona-electric-64?year=2020&km=60000')
  const text = document.body.textContent!
  expect(text).toContain('Free — recall')
  expect(text).toContain('Any mileage')
})

test('unknown car shows the friendly state', () => {
  renderAt('/research/not-a-car')
  expect(screen.getByTestId('unknown-car')).toHaveTextContent('Not in our demo database')
})

test('invalid year/km fall back and clamp', () => {
  renderAt('/research/toyota-avensis-t27-18?year=1990&km=-5')
  expect(screen.getByTestId('year-select')).toHaveValue('2009')
  expect(screen.getByRole('heading', { name: /At 0 km/ })).toBeInTheDocument()
})

test('a 2009 car at 20,000 km shows the odometer warning in the Bottom line; a normal mileage shows none', () => {
  const { unmount } = renderAt('/research/bmw-3-e90-320d-n47?year=2009&km=20000')
  expect(within(screen.getByTestId('bottom-line')).getByTestId('mileage-note')).toHaveTextContent(
    'Unusually low mileage for a 2009 car — check the VIN history for a rolled-back odometer.',
  )
  unmount()
  renderAt('/research/bmw-3-e90-320d-n47?year=2009&km=250000')
  expect(screen.queryByTestId('mileage-note')).toBeNull()
})

test('a year without enough ads shows no price range (spec 14 §4): Focus 1.6, 2018', () => {
  renderAt('/research/ford-focus-3-16tivct?year=2018&km=100000')
  const line = within(screen.getByTestId('bottom-line')).getByText(/Typical asking price/).closest('p')!
  expect(line).toHaveTextContent('Not enough ads for a 2018 car to estimate a price.')
  expect(line).not.toHaveTextContent('€')
  expect(screen.getByTestId('price-source')).toHaveTextContent('Not enough ads for a 2018 car to estimate a price.')
})

test('alternatives (spec B.2): "Similar, but safer" and "Safest choice" with trade-off, 0–100 and price', () => {
  renderAt('/research/bmw-3-e90-320d-n47?year=2009&km=180000')
  const similar = screen.getByTestId('alt-similar')
  expect(within(similar).getByRole('heading', { level: 3 })).toHaveTextContent('Similar, but safer')
  expect(similar).toHaveTextContent('BMW 3 Series E90 / E91 325i 2.5 straight-six 218 hp')
  expect(similar).toHaveTextContent('0–100 km/h: 7 s (this car 7.9 s)')
  // 325i is built 2005–2007: priced at 2007, the same km.
  expect(similar).toHaveTextContent(eurRange(typicalRange(estimate(getCar('bmw-3-e90-325i-n52')!, 2007, 180000))))
  expect(within(similar).getByRole('link', { name: /325i/ })).toHaveAttribute('href', '/research/bmw-3-e90-325i-n52?year=2007&km=180000')

  const safest = screen.getByTestId('alt-safest')
  expect(within(safest).getByRole('heading', { level: 3 })).toHaveTextContent('Safest choice')
  expect(safest).toHaveTextContent('Toyota Avensis')
  expect(safest).toHaveTextContent('Trade-off: Slower (9.4 s) and less sporty')
  expect(safest).toHaveTextContent('Excellent') // reliability word
  expect(safest).toHaveTextContent(eurRange(typicalRange(estimate(getCar('toyota-avensis-t27-18')!, 2009, 180000))))
})

test('an alternative without ads for that year shows the "Not enough ads" note, never a range', () => {
  // Focus 1.0 EcoBoost 2018 → its similar pick, the Focus 1.6, has no ads after 2014.
  renderAt('/research/ford-focus-3-10ecoboost?year=2018&km=90000')
  expect(screen.getByTestId('alt-similar')).toHaveTextContent('Not enough ads for a 2018 car to estimate a price.')
})

test('picking a car on an empty page starts at that year\'s typical mileage, not 0 km', () => {
  renderAt('/research')
  fireEvent.click(screen.getByTestId('change-car'))
  fireEvent.click(screen.getByTestId('car-option-toyota-avensis-t27-18'))
  const km = Math.round(typicalKm(2018) / KM_STEP) * KM_STEP
  expect(km).toBeGreaterThan(0)
  expect(screen.getAllByTestId('where')[0]).toHaveTextContent(`/research/toyota-avensis-t27-18?year=2018&km=${km}`)
  expect(screen.queryByTestId('mileage-note')).toBeNull()
})
