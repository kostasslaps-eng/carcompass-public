import { fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { describe, expect, test, vi } from 'vitest'
import { OptionTiles, Slider } from './controls'
import { glossary } from '../data'
import { buildGlossaryMatcher, splitGlossary } from '../data/glossary'
import { GlossaryText } from './GlossaryText'
import { Sheet } from './Sheet'

describe('Slider', () => {
  test('shows the formatted value and reports changes', () => {
    const onChange = vi.fn()
    render(<Slider label="Max budget" min={1000} max={35000} step={500} value={10000} onChange={onChange} format={(v) => `€${v}`} />)
    const input = screen.getByLabelText('Max budget')
    expect(input).toHaveAttribute('aria-valuetext', '€10000')
    fireEvent.change(input, { target: { value: '12500' } })
    expect(onChange).toHaveBeenCalledWith(12500)
  })
})

describe('OptionTiles', () => {
  test('single select via native radios', () => {
    function Harness() {
      const [v, setV] = useState<'city' | 'highway' | 'mixed'>('mixed')
      return (
        <OptionTiles
          label="Mostly driving"
          name="use"
          value={v}
          onChange={setV}
          options={[
            { value: 'city', label: 'City' },
            { value: 'highway', label: 'Highway' },
            { value: 'mixed', label: 'Mixed' },
          ]}
        />
      )
    }
    render(<Harness />)
    expect(screen.getByRole('radio', { name: 'Mixed' })).toBeChecked()
    fireEvent.click(screen.getByRole('radio', { name: 'City' }))
    expect(screen.getByRole('radio', { name: 'City' })).toBeChecked()
    expect(screen.getByRole('radio', { name: 'Mixed' })).not.toBeChecked()
    expect(screen.getByRole('radiogroup', { name: 'Mostly driving' })).toBeInTheDocument()
  })
})

describe('GlossaryText', () => {
  test('wraps only the first occurrence of each term', () => {
    const parts = splitGlossary('The DPF clogs. A clogged DPF needs cleaning; the EGR too.', buildGlossaryMatcher(glossary))
    const terms = parts.filter((p) => typeof p !== 'string')
    expect(terms.map((t) => (typeof t === 'string' ? t : t.text))).toEqual(['DPF', 'EGR'])
  })

  test('tap shows the definition, tap again or Esc hides it', () => {
    render(<GlossaryText text="Timing chain stretch (rear)" as="h3" />)
    const term = screen.getByRole('button', { name: 'Timing chain' })
    const note = screen.getByRole('note', { hidden: true })
    expect(note).not.toBeVisible()
    fireEvent.click(term)
    expect(term).toHaveAttribute('aria-expanded', 'true')
    expect(note).toBeVisible()
    expect(note).toHaveTextContent(/metal chain/)
    fireEvent.click(term)
    expect(note).not.toBeVisible()
    fireEvent.click(term)
    fireEvent.keyDown(term, { key: 'Escape' })
    expect(note).not.toBeVisible()
  })
})

describe('Sheet', () => {
  test('focuses inside, traps Tab, closes on Esc and restores focus', () => {
    function Harness() {
      const [open, setOpen] = useState(false)
      return (
        <>
          <button onClick={() => setOpen(true)}>Open</button>
          <Sheet open={open} onClose={() => setOpen(false)} label="Test sheet">
            <button>First</button>
            <button>Last</button>
          </Sheet>
        </>
      )
    }
    render(<Harness />)
    const opener = screen.getByRole('button', { name: 'Open' })
    opener.focus()
    fireEvent.click(opener)
    expect(screen.getByRole('dialog', { name: 'Test sheet' })).toBeInTheDocument()
    const first = screen.getByRole('button', { name: 'First' })
    const last = screen.getByRole('button', { name: 'Last' })
    expect(first).toHaveFocus()
    last.focus()
    fireEvent.keyDown(document, { key: 'Tab' })
    expect(first).toHaveFocus()
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true })
    expect(last).toHaveFocus()
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(opener).toHaveFocus()
  })
})
