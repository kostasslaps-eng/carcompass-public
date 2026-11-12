import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { expect, test } from 'vitest'
import { Home } from './Home'

test('Home: the promise, three doors and the example link', () => {
  render(
    <MemoryRouter>
      <Home />
    </MemoryRouter>,
  )
  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent("We don't sell cars.")
  expect(screen.getByTestId('door-find')).toHaveAttribute('href', '/find')
  expect(screen.getByTestId('door-research')).toHaveAttribute('href', '/research')
  expect(screen.getByTestId('door-buy')).toHaveAttribute('href', '/buy')
  expect(screen.getByTestId('home-example')).toHaveAttribute('href', '/research/bmw-3-e90-320d-n47?year=2009&km=180000')
})
