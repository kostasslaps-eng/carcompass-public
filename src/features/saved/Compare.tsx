import { CircleCheck } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Bars } from '../../components/blocks'
import { CarImage } from '../../components/CarImage'
import { ButtonLink } from '../../components/controls'
import { cx } from '../../components/cx'
import { VerdictTag } from '../../components/status'
import { carName, cars, getCar } from '../../data'
import type { Car } from '../../data/schema'
import { eur } from '../../domain/format'
import { estimate, hasPrice, typicalPriceText } from '../../domain/price'
import { firstDueProblem, problemWithCost } from '../../domain/problems'
import { buildScores, costWord, scoreWord } from '../../domain/scores'
import { useSaved } from '../../hooks/useSaved'
import { carParams, researchUrl } from '../../routes'
import { SavedTabs } from './SavedTabs'

const SCORES = buildScores(cars)
const MAX = 3

interface Col {
  car: Car
  year: number
  km: number
}

function rating(word: string, score: number, extra?: string) {
  return (
    <span className="flex flex-col gap-1">
      {word}
      <Bars score={score} label={`${word}, ${Math.round(score * 10) / 10} out of 10`} />
      {extra && <span className="text-caption font-normal text-body">{extra}</span>}
    </span>
  )
}

/** Rows (spec 12 §6). `better` scores a value — higher = better, and the single best gets a "Better" mark. */
const ROWS: { label: string; show: (c: Col) => ReactNode; better?: (c: Col) => number }[] = [
  {
    label: 'Typical asking price',
    show: (c) => typicalPriceText(c.car, c.year, c.km),
    better: (c) => (hasPrice(c.car, c.year) ? -estimate(c.car, c.year, c.km) : NaN),
  },
  {
    label: 'Reliability',
    show: (c) => rating(scoreWord(c.car.ratings.reliability), c.car.ratings.reliability),
    better: (c) => c.car.ratings.reliability,
  },
  {
    label: 'Performance',
    show: (c) => rating(scoreWord(SCORES.get(c.car.id)!.performance), SCORES.get(c.car.id)!.performance),
    better: (c) => SCORES.get(c.car.id)!.performance,
  },
  {
    label: 'Cost to run',
    show: (c) => {
      const s = SCORES.get(c.car.id)!
      const yearly = Math.round((c.car.costs.maintenancePerYearEur + s.fuelPerYear) / 100) * 100
      return rating(costWord(s.runningCosts), s.runningCosts, `about ${eur(yearly)}/yr`)
    },
    better: (c) => SCORES.get(c.car.id)!.runningCosts,
  },
  {
    label: 'Biggest risk now',
    show: (c) => {
      const due = firstDueProblem(c.car.problems, c.km)
      return due ? problemWithCost(due.problem) : 'No serious known problems due'
    },
  },
]

/** Index of the single best column, or -1 on a tie. */
/** NaN = nothing to compare (e.g. no price for that year); a mark needs at least two comparable values. */
function bestIndex(values: number[]) {
  const known = values.filter((v) => !Number.isNaN(v))
  const max = Math.max(...known)
  return known.length > 1 && known.filter((v) => v === max).length === 1 ? values.indexOf(max) : -1
}

export function Compare() {
  const [search, setSearch] = useSearchParams()
  const { saved } = useSaved()
  const fromUrl = search.get('ids')
  const ids = (fromUrl === null ? saved.map((s) => s.carId) : fromUrl.split(','))
    .filter((id, i, all) => getCar(id) && all.indexOf(id) === i)
    .slice(0, MAX)
  const setIds = (next: string[]) => setSearch({ ids: next.join(',') }, { replace: true })

  const cols: Col[] = ids.map((id) => {
    const car = getCar(id)!
    const s = saved.find((x) => x.carId === id)
    return { car, ...(s ? { year: s.year, km: s.km } : carParams(car, new URLSearchParams())) }
  })
  const choices = [...new Set([...saved.map((s) => s.carId), ...ids])].map((id) => getCar(id)!)

  return (
    <>
      <SavedTabs />
      <section className="flex flex-col gap-3 px-6 pt-4 pb-6">
        {choices.length < 2 ? (
          <div className="flex flex-col gap-4 py-4">
            <p className="text-body-md text-body">Save at least two cars to compare them side by side.</p>
            <ButtonLink to="/find">Find a car</ButtonLink>
          </div>
        ) : (
          <fieldset className="flex flex-col gap-1">
            <legend className="mb-1 text-label uppercase text-muted">Pick 2–3 cars</legend>
            {choices.map((car) => {
              const on = ids.includes(car.id)
              return (
                <label key={car.id} className="flex min-h-11 cursor-pointer items-center gap-3 text-body-sm">
                  <input
                    type="checkbox"
                    className="h-5 w-5 accent-primary"
                    checked={on}
                    disabled={!on && ids.length >= MAX}
                    onChange={() => setIds(on ? ids.filter((x) => x !== car.id) : [...ids, car.id])}
                  />
                  {carName(car)}
                </label>
              )
            })}
            {ids.length >= MAX && <span className="text-caption text-body">You can compare up to 3 cars.</span>}
          </fieldset>
        )}

        {cols.length >= 2 && (
          <table className="mt-2 w-full table-fixed border-collapse" data-testid="compare-table">
            <caption className="sr-only">Comparison of {cols.map((c) => carName(c.car)).join(', ')}</caption>
            <thead>
              <tr>
                {cols.map((c, i) => (
                  <th
                    key={c.car.id}
                    scope="col"
                    className={cx('pb-2 text-left align-top font-normal', i > 0 && 'border-l border-hairline pl-3', i < cols.length - 1 && 'pr-3')}
                  >
                    <Link to={researchUrl(c.car.id, c.year, c.km)} className="flex flex-col gap-2">
                      <CarImage car={c.car} className="h-[72px]" />
                      <span className="text-title-sm">
                        {c.car.make} {c.car.model} {c.car.engine.name}
                      </span>
                      <span className="text-caption text-body">
                        {c.year} · {c.km.toLocaleString('en-US')} km
                      </span>
                    </Link>
                    <div className="mt-2">
                      <VerdictTag verdict={c.car.ratings.verdict} />
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            {ROWS.map((row) => {
              const best = row.better ? bestIndex(cols.map(row.better)) : -1
              return (
                <tbody key={row.label}>
                  <tr>
                    <th colSpan={cols.length} scope="colgroup" className="pt-3 text-left text-label text-muted uppercase">
                      {row.label}
                    </th>
                  </tr>
                  <tr className="border-b border-hairline">
                    {cols.map((c, i) => (
                      <td
                        key={c.car.id}
                        className={cx(
                          'py-2 align-top text-body-sm',
                          i > 0 && 'border-l border-hairline pl-3',
                          i < cols.length - 1 && 'pr-3',
                          i === best && 'font-bold',
                        )}
                      >
                        {row.show(c)}
                        {i === best && (
                          <span className="mt-1 flex items-center gap-1 text-tag text-primary-active uppercase">
                            <CircleCheck size={14} strokeWidth={2.25} aria-hidden="true" />
                            Better
                          </span>
                        )}
                      </td>
                    ))}
                  </tr>
                </tbody>
              )
            })}
          </table>
        )}
        {cols.length >= 2 && (
          <span className="text-caption text-body">
            Compared at the year and mileage you looked at each car. We advise, we don't guarantee.
          </span>
        )}
      </section>
    </>
  )
}
