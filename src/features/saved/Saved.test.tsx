import { fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, expect, test } from 'vitest'
import { Compare } from './Compare'
import { Saved } from './Saved'

const save = (...ids: string[]) =>
  localStorage.setItem(
    'cc.saved',
    JSON.stringify(ids.map((carId) => ({ carId, year: 2010, km: 180000, savedAt: '2026-11-10T00:00:00Z' }))),
  )

beforeEach(() => localStorage.clear())

const renderAt = (url: string) =>
  render(
    <MemoryRouter initialEntries={[url]}>
      <Routes>
        <Route path="/saved" element={<Saved />} />
        <Route path="/compare" element={<Compare />} />
      </Routes>
    </MemoryRouter>,
  )

test('saved list survives reload and can remove items', () => {
  save('toyota-avensis-t27-18', 'bmw-3-e90-320d-n47')
  renderAt('/saved')
  const list = screen.getByTestId('saved-list')
  expect(within(list).getAllByRole('listitem')).toHaveLength(2)
  fireEvent.click(screen.getByRole('button', { name: /Remove Toyota Avensis/ }))
  expect(within(list).getAllByRole('listitem')).toHaveLength(1)
  expect(JSON.parse(localStorage.getItem('cc.saved')!)).toHaveLength(1)
})

test('empty saved state', () => {
  renderAt('/saved')
  expect(screen.getByText(/Nothing saved yet/)).toBeInTheDocument()
})

test('compare highlights the better value and caps at 3', () => {
  save('toyota-avensis-t27-18', 'bmw-3-e90-320d-n47', 'mazda-3-bm-20', 'honda-civic-8-18')
  renderAt('/compare?ids=toyota-avensis-t27-18,bmw-3-e90-320d-n47')
  const table = screen.getByTestId('compare-table')
  const reliability = within(table).getByRole('columnheader', { name: 'Reliability' }).closest('tbody')!
  const cells = within(reliability).getAllByRole('cell')
  expect(cells[0]).toHaveTextContent('Excellent')
  expect(cells[0]).toHaveTextContent('Better') // Avensis 8/10 vs BMW 4/10
  expect(cells[1]).not.toHaveTextContent('Better')
  expect(within(table).queryByText(/Blue =/)).toBeNull()
  const risk = within(table).getByRole('columnheader', { name: 'Biggest risk now' }).closest('tbody')!
  expect(within(risk).getAllByRole('cell')[1]).toHaveTextContent('Timing chain stretch (rear) · €1,000–5,000')

  fireEvent.click(screen.getByRole('checkbox', { name: /Mazda 3/ }))
  expect(within(screen.getByTestId('compare-table')).getAllByRole('columnheader', { name: /\d{4} ·/ })).toHaveLength(3)
  expect(screen.getByRole('checkbox', { name: /Honda Civic/ })).toBeDisabled()
})

test('compare needs two saved cars', () => {
  save('toyota-avensis-t27-18')
  renderAt('/compare')
  expect(screen.getByText(/Save at least two cars/)).toBeInTheDocument()
})

test('compare: a year without enough ads shows the note instead of a range (spec 14 §4)', () => {
  localStorage.setItem(
    'cc.saved',
    JSON.stringify([
      { carId: 'ford-focus-3-16tivct', year: 2018, km: 100000, savedAt: '2026-11-10T00:00:00Z' },
      { carId: 'honda-civic-8-18', year: 2010, km: 180000, savedAt: '2026-11-10T00:00:00Z' },
    ]),
  )
  renderAt('/compare?ids=ford-focus-3-16tivct,honda-civic-8-18')
  const price = within(screen.getByTestId('compare-table')).getByRole('columnheader', { name: 'Typical asking price' }).closest('tbody')!
  const cells = within(price).getAllByRole('cell')
  expect(cells[0]).toHaveTextContent('Not enough ads for a 2018 car to estimate a price.')
  expect(cells[0]).not.toHaveTextContent('Better')
  expect(cells[1]).toHaveTextContent(/€[\d,]+–€[\d,]+/)
})
