import { fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, expect, test } from 'vitest'
import { getCar } from '../../data'
import { estimate } from '../../domain/price'
import { Buy } from './Buy'

beforeEach(() => localStorage.clear())

const renderAt = (url: string) =>
  render(
    <MemoryRouter initialEntries={[url]}>
      <Routes>
        <Route path="/buy/:carId?" element={<Buy />} />
      </Routes>
    </MemoryRouter>,
  )

test('demo: Avensis 2015, 195,000 km, asking €11,500 → above typical, negotiate towards top of range', () => {
  renderAt('/buy/toyota-avensis-t27-18?year=2015&km=195000&price=11500')
  const status = within(screen.getByTestId('price-check')).getByRole('status')
  expect(status).toHaveTextContent('Above typical')
  expect(status).toHaveTextContent('Try negotiating towards €10,600')
})

test('price check updates as you type; empty asks for a price', () => {
  renderAt('/buy/toyota-avensis-t27-18?year=2015&km=195000')
  const status = () => within(screen.getByTestId('price-check')).getByRole('status')
  expect(status()).toHaveTextContent('Enter a price')
  fireEvent.change(screen.getByTestId('asking-price'), { target: { value: '9 500 €' } })
  expect(status()).toHaveTextContent('Fair asking price')
  fireEvent.change(screen.getByTestId('asking-price'), { target: { value: '5000' } })
  expect(status()).toHaveTextContent('Suspiciously cheap')
})

test('ticks persist per car across remounts; reset clears them', () => {
  const { unmount } = renderAt('/buy/toyota-avensis-t27-18?year=2015&km=195000')
  const boxes = within(screen.getByTestId('checklist')).getAllByRole('checkbox')
  const total = boxes.length
  fireEvent.click(boxes[0])
  fireEvent.click(boxes[3])
  expect(screen.getByTestId('checklist-progress')).toHaveTextContent(`2 of ${total} checked`)
  unmount()

  renderAt('/buy/toyota-avensis-t27-18?year=2015&km=195000')
  expect(screen.getByTestId('checklist-progress')).toHaveTextContent(`2 of ${total} checked`)
  fireEvent.click(screen.getByTestId('reset-checklist'))
  expect(screen.getByTestId('checklist-progress')).toHaveTextContent(`0 of ${total} checked`)
})

test('car-specific items and red flags are shown', () => {
  renderAt('/buy/toyota-avensis-t27-18?year=2015&km=195000')
  expect(within(screen.getByTestId('checklist')).getAllByText('Avensis').length).toBeGreaterThan(2)
  expect(within(screen.getByTestId('red-flags')).getByText(/deposit before you have seen the car/)).toBeInTheDocument()
})

test('order: price check → red flags → top 5 → full checklist; top 5 not repeated; one service-book item', () => {
  renderAt('/buy/toyota-avensis-t27-18?year=2015&km=195000')
  const [price, flags, top, full] = ['price-check', 'red-flags', 'top-checks', 'full-checklist'].map((id) => screen.getByTestId(id))
  const before = (a: HTMLElement, b: HTMLElement) => !!(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING)
  expect(before(price, flags) && before(flags, top) && before(top, full)).toBe(true)

  const topTexts = within(top).getAllByRole('checkbox').map((c) => c.closest('label')!.textContent)
  expect(topTexts).toHaveLength(5)
  const fullTexts = within(full).getAllByRole('checkbox', { hidden: true }).map((c) => c.closest('label')!.textContent)
  for (const t of topTexts) expect(fullTexts).not.toContain(t)

  const all = [...topTexts, ...fullTexts].join('\n')
  expect(all.match(/service book/gi)).toHaveLength(1)
  for (const d of within(full).getAllByRole('group', { hidden: true })) expect(d).not.toHaveAttribute('open')
})

test('mileage note under the price check; fair wording', () => {
  const fair = Math.round(estimate(getCar('toyota-avensis-t27-18')!, 2015, 380000))
  renderAt(`/buy/toyota-avensis-t27-18?year=2015&km=380000&price=${fair}`)
  expect(screen.getByTestId('mileage-note')).toHaveTextContent(/^High mileage/)
  expect(within(screen.getByTestId('price-check')).getByRole('status')).toHaveTextContent(/Within the usual range for this car/)
})

test('a year without enough ads disables the price check (spec 14 §4): Focus 1.6, 2018', () => {
  renderAt('/buy/ford-focus-3-16tivct?year=2018&km=100000&price=9000')
  expect(screen.getByTestId('asking-price')).toBeDisabled()
  const check = screen.getByTestId('price-check')
  expect(check).toHaveTextContent('Not enough ads for a 2018 car to estimate a price.')
  expect(check).not.toHaveTextContent('€')
  expect(screen.queryByTestId('price-source')).toBeNull()
})
