import { fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, expect, test } from 'vitest'
import { Find } from './Find'

beforeEach(() => localStorage.clear())

const renderAt = (url: string) =>
  render(
    <MemoryRouter initialEntries={[url]}>
      <Routes>
        <Route path="/find" element={<Find />} />
      </Routes>
    </MemoryRouter>,
  )

test('defaults give 3 match cards and an avoid section', () => {
  renderAt('/find')
  expect(within(screen.getByTestId('best-matches')).getAllByTestId('match-card')).toHaveLength(3)
  expect(screen.getByTestId('avoid-list')).toBeInTheDocument()
  expect(screen.getByTestId('triangle-label')).toHaveTextContent('Balanced')
})

test('Reliable + Budget at €10k (owner checkpoint)', () => {
  renderAt('/find?budget=10000&w=50,50,0')
  const names = within(screen.getByTestId('best-matches')).getAllByRole('heading', { level: 3 }).map((h) => h.textContent)
  expect(names.slice(0, 3)).toEqual(['Toyota Auris', 'Mazda 3', 'Honda Civic'])
  const avoid = within(screen.getByTestId('avoid-list')).getAllByTestId(/^avoid-card-/).map((a) => a.dataset.testid)
  expect(avoid).toEqual(['avoid-card-skoda-fabia-2-12htp', 'avoid-card-ford-focus-3-10ecoboost', 'avoid-card-bmw-3-e90-320d-n47'])
  // Leaf and Golf GTI miss only the budget (within 30 %): shown as "close" with the reason in plain words.
  expect(within(screen.getByTestId('close-matches')).getAllByText(/€[\d,]+ over budget/)).toHaveLength(2)
})

test('"Only N cars fit" when fewer than 3 fully match; "Closest we have" when nothing fits', () => {
  const { unmount } = renderAt('/find?budget=15000&yf=2012&yt=2025&km=200000&body=suv&fuel=petrol')
  expect(screen.getByTestId('only-n')).toHaveTextContent('Only 2 cars fit everything you asked for.')
  const close = screen.getByTestId('close-matches')
  expect(close.tagName).not.toBe('DETAILS') // open when the top 3 isn't full
  expect(within(close).getAllByText('Not an SUV')).toHaveLength(3)
  unmount()
  renderAt('/find?budget=1000&body=coupe&fuel=electric')
  expect(screen.getByTestId('closest')).toHaveTextContent('Nothing fits all your needs.')
  expect(within(screen.getByTestId('closest')).getAllByTestId('match-card')).toHaveLength(3)
})

test('match card: SEARCH FOR rows, price only as a range, "Fits all your needs"', () => {
  renderAt('/find?budget=10000&w=50,50,0')
  const card = screen.getAllByTestId('match-card')[0]
  expect(within(card).getByText('#1 for you')).toBeInTheDocument()
  const box = within(card).getByTestId('search-for')
  for (const k of ['Engine:', 'Years:', 'Mileage:', 'Fair price:']) expect(within(box).getByText(k)).toBeInTheDocument()
  expect(box).toHaveTextContent(/Fair price:€[\d,]+–€[\d,]+/)
  expect(card.textContent).not.toMatch(/around €/) // no single-number price anywhere on the card
  expect(within(card).getByText('Fits all your needs')).toBeInTheDocument()
  expect(card).toHaveTextContent(/Why:/)
  expect(card).toHaveTextContent(/Watch:/)
})

test('"More filters" is closed and counts what you changed', () => {
  renderAt('/find?gear=automatic&use=city')
  const more = screen.getByTestId('more-filters')
  expect(more).not.toHaveAttribute('open')
  expect(more).toHaveTextContent('More filters · 2 set')
})

test('avoid card shows the repair cost', () => {
  renderAt('/find?budget=10000&w=50,50,0')
  expect(screen.getByTestId('avoid-card-bmw-3-e90-320d-n47')).toHaveTextContent(
    'Known for: Timing chain stretch (rear) · €1,000–5,000 to fix',
  )
})

test('triangle works from the keyboard', () => {
  renderAt('/find')
  const tri = screen.getByRole('slider', { name: 'What matters most' })
  for (let i = 0; i < 6; i++) fireEvent.keyDown(tri, { key: 'ArrowUp' })
  expect(screen.getByTestId('triangle-label')).toHaveTextContent('Max reliability')
  fireEvent.keyDown(tri, { key: 'Home' })
  expect(screen.getByTestId('triangle-label')).toHaveTextContent('Balanced')
})

test('full guide link carries year and km; save toggles the heart', () => {
  renderAt('/find?w=50,50,0')
  const card = screen.getByTestId('car-card-honda-civic-8-18').closest('article')!
  expect(within(card).getByRole('link', { name: /Full guide/ }).getAttribute('href')).toMatch(
    /^\/research\/honda-civic-8-18\?year=\d{4}&km=\d+$/,
  )
  const heart = within(card).getByRole('button', { name: /Save/ })
  fireEvent.click(heart)
  expect(heart).toHaveAttribute('aria-pressed', 'true')
  expect(JSON.parse(localStorage.getItem('cc.saved')!)[0].carId).toBe('honda-civic-8-18')
})

test('Wagon + Diesel: the Passat B6 avoid card suggests the Passat B7 (spec B.3)', () => {
  renderAt('/find?budget=10000&w=50,50,0&body=wagon&fuel=diesel')
  expect(screen.getByTestId('avoid-card-vw-passat-b6-20tdi-bkp')).toHaveTextContent('Better instead: Volkswagen Passat 2.0 TDI 140 hp')
})
