import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, expect, test } from 'vitest'
import App from './App'

beforeEach(() => {
  localStorage.clear()
  window.location.hash = ''
})

test('intro shows once, then the app shell', () => {
  const { unmount } = render(<App />)
  expect(screen.getByTestId('intro')).toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: 'Skip' }))
  expect(screen.getByRole('navigation', { name: 'Main' })).toBeInTheDocument()
  unmount()
  render(<App />)
  expect(screen.queryByTestId('intro')).not.toBeInTheDocument()
})

test('public edition: banner shown and the assistant opens the disabled sheet', () => {
  localStorage.setItem('cc.introSeen', 'true')
  render(<App />)
  expect(screen.getByTestId('public-banner')).toBeInTheDocument()
  fireEvent.click(screen.getByTestId('ask-button'))
  expect(screen.getByRole('dialog', { name: 'AI assistant unavailable' })).toBeInTheDocument()
  expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
})

test('unknown routes go to Home; no tab is active there', () => {
  localStorage.setItem('cc.introSeen', 'true')
  window.location.hash = '#/nowhere'
  render(<App />)
  expect(screen.getByTestId('home')).toBeInTheDocument()
  expect(screen.getByRole('navigation', { name: 'Main' }).querySelector('[aria-current]')).toBeNull()
})
