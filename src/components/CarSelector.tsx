import { useId, useState } from 'react'
import { carName, cars } from '../data'
import { filterCars } from '../data/carSearch'
import type { Car } from '../data/schema'
import { clamp } from '../domain/constants'
import { km as fmtKm } from '../domain/format'
import { typicalKm } from '../domain/mileage'
import { KM_STEP, MAX_RESEARCH_KM } from '../routes'
import { Slider, TextButton } from './controls'
import { Sheet } from './Sheet'
import { VerdictTag } from './status'

export interface CarChoice {
  carId: string
  year: number
  km: number
}

/** Selector strip (spec 12 §4.1): full car name + CHANGE (opens the searchable picker), year, mileage. */
export function CarSelector({
  car,
  year,
  km,
  onChange,
  children,
}: {
  car?: Car
  year: number
  km: number
  /** `newCar` = a different car was picked (worth a history entry). */
  onChange: (c: CarChoice, newCar: boolean) => void
  children?: React.ReactNode
}) {
  const yearId = useId()
  const [picking, setPicking] = useState(false)
  const field = 'h-12 w-full border border-hairline-strong bg-canvas px-3 text-body-md text-ink'
  const pick = (next: Car) => {
    setPicking(false)
    const y = clamp(year || next.years.to, next.years.from, next.years.to)
    // No car chosen yet means km is a placeholder 0: start at that year's typical mileage instead.
    onChange({ carId: next.id, year: y, km: car ? km : Math.round(typicalKm(y) / KM_STEP) * KM_STEP }, true)
  }
  return (
    <section className="flex flex-col gap-4 bg-surface-soft px-6 py-4" aria-label="Car, year and mileage">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className="text-caption text-body">Car</span>
          <span className="text-title-sm" data-testid="car-name">
            {car ? carName(car) : 'No car chosen yet'}
          </span>
          {car && (
            <span className="text-caption text-body">
              {car.years.from}–{car.years.to}
            </span>
          )}
        </div>
        <TextButton onClick={() => setPicking(true)} data-testid="change-car" className="flex-none" aria-haspopup="dialog">
          {car ? 'Change' : 'Choose a car'} <span aria-hidden="true">›</span>
        </TextButton>
      </div>
      {car && (
        <div className="flex items-end gap-4">
          <div className="flex w-24 flex-col gap-1">
            <label htmlFor={yearId} className="text-caption text-body">
              Year
            </label>
            <select
              id={yearId}
              className={field}
              value={year}
              data-testid="year-select"
              onChange={(e) => onChange({ carId: car.id, year: Number(e.target.value), km }, false)}
            >
              {Array.from({ length: car.years.to - car.years.from + 1 }, (_, i) => car.years.from + i).map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1 pb-1">
            <Slider
              label="Mileage"
              min={0}
              max={MAX_RESEARCH_KM}
              step={KM_STEP}
              value={km}
              format={fmtKm}
              onChange={(v) => onChange({ carId: car.id, year, km: v }, false)}
            />
          </div>
        </div>
      )}
      {children}
      {picking && <CarPicker onClose={() => setPicking(false)} onPick={pick} />}
    </section>
  )
}

/** "Choose a car" sheet: search + list grouped by make (focus trap and Esc come from Sheet). */
function CarPicker({ onClose, onPick }: { onClose: () => void; onPick: (c: Car) => void }) {
  const [q, setQ] = useState('')
  const searchId = useId()
  const list = [...filterCars(cars, q)].sort((a, b) => `${a.model} ${a.generation}`.localeCompare(`${b.model} ${b.generation}`, 'en'))
  const makes = [...new Set(list.map((c) => c.make))].sort((a, b) => a.localeCompare(b, 'en'))
  return (
    <Sheet open onClose={onClose} label="Choose a car">
      <div className="flex min-h-0 flex-1 flex-col gap-3" data-testid="car-picker">
        <h2 className="text-title-lg">Choose a car</h2>
        <label htmlFor={searchId} className="sr-only">
          Search make, model or engine
        </label>
        <input
          id={searchId}
          type="search"
          data-autofocus
          data-testid="car-picker-search"
          placeholder="Search make, model or engine"
          autoComplete="off"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="h-12 w-full flex-none border border-hairline-strong px-3.5 text-body-md text-ink"
        />
        <div className="min-h-0 flex-1 overflow-y-auto" aria-live="polite">
          {list.length === 0 && <p className="py-4 text-body-sm text-body">No cars match “{q}”.</p>}
          {makes.map((make) => (
            <section key={make} aria-label={make}>
              <h3 className="sticky top-0 bg-canvas pt-3 pb-1 text-label uppercase text-muted">{make}</h3>
              <ul>
                {list
                  .filter((c) => c.make === make)
                  .map((c) => (
                    <li key={c.id}>
                      <button
                        type="button"
                        data-testid={`car-option-${c.id}`}
                        onClick={() => onPick(c)}
                        className="flex w-full items-start justify-between gap-3 border-b border-hairline py-3 text-left"
                      >
                        <span className="flex min-w-0 flex-col gap-0.5">
                          <span className="text-title-sm">
                            {c.make} {c.model} {c.generation}
                          </span>
                          <span className="text-body-sm text-body">
                            {c.engine.name} · {c.years.from}–{c.years.to}
                          </span>
                        </span>
                        <VerdictTag verdict={c.ratings.verdict} />
                      </button>
                    </li>
                  ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </Sheet>
  )
}
