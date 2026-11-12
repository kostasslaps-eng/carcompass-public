import { useState } from 'react'
import { useLocation, useNavigationType, useSearchParams } from 'react-router-dom'
import { Details, Disclaimer, HeroBand } from '../../components/blocks'
import { ChipGroup, OptionTiles, RangeSlider, Slider, TextButton } from '../../components/controls'
import { TriangleSelector } from '../../components/TriangleSelector'
import { cars } from '../../data'
import { eur, km } from '../../domain/format'
import { rank, type FindInputs } from '../../domain/ranking'
import { buildScores } from '../../domain/scores'
import { nearestAnchor, type Weights } from '../../domain/triangle'
import { AvoidCard, MatchCard, OptionRow } from './cards'
import { missText } from './text'
import { BODY_OPTIONS, DEFAULTS, findQuery, FUEL_OPTIONS, LIMITS, parseFind, USAGE_OPTIONS } from './params'

const SCORES = buildScores(cars)

const kEur = (v: number) => `€${v / 1000}k`

export function Find() {
  const [search, setSearch] = useSearchParams()
  const location = useLocation()
  const navType = useNavigationType()
  const fromUrl = parseFind(search)
  // Triangle weights live in state: the router applies URL updates as a transition, so fast key repeats or drags
  // would otherwise start from a stale position. Re-read the URL only on real navigation (back/forward, links).
  const [weights, setWeights] = useState<Weights>(fromUrl.weights)
  const [seenKey, setSeenKey] = useState(location.key)
  if (location.key !== seenKey) {
    setSeenKey(location.key)
    if (navType !== 'REPLACE') setWeights(fromUrl.weights)
  }
  const f: FindInputs = { ...fromUrl, weights }

  const results = rank(cars, SCORES, f) // 50 cars: cheap enough to run on every render
  const [showMore, setShowMore] = useState(false)

  const update = (patch: Partial<FindInputs>) => setSearch(findQuery({ ...f, ...patch }), { replace: true })
  const closeRows = results.close.map((r) => <OptionRow key={r.car.id} r={r} note={missText(r.missed[0], r, f)} />)

  // How many of the "More filters" differ from the defaults (shown on the closed summary).
  const moreSet = [
    f.yearFrom !== DEFAULTS.yearFrom || f.yearTo !== DEFAULTS.yearTo,
    f.maxKm !== DEFAULTS.maxKm,
    f.fuels.length > 0,
    f.gearbox !== null,
    f.usage !== DEFAULTS.usage,
  ].filter(Boolean).length

  return (
    <>
      <HeroBand eyebrow="Step 1 of 3" title="Find your car">
        Set your budget and what matters. We rank {cars.length} popular used cars and tell you what to search for.
      </HeroBand>

      <section className="flex flex-col gap-6 px-6 pt-6 pb-2" aria-label="Your needs">
        <Slider
          label="Max budget"
          {...LIMITS.budget}
          value={f.budget}
          onChange={(budget) => update({ budget })}
          format={eur}
          hint={[kEur(LIMITS.budget.min), kEur(LIMITS.budget.max)]}
        />
        <ChipGroup label="Body type" options={BODY_OPTIONS} value={f.bodies} onChange={(bodies) => update({ bodies })} />

        <Details summary={moreSet ? `More filters · ${moreSet} set` : 'More filters'} testId="more-filters">
          <div className="flex flex-col gap-6 pt-2">
            <RangeSlider
              label="Years"
              min={LIMITS.years.min}
              max={LIMITS.years.max}
              value={[f.yearFrom, f.yearTo]}
              onChange={([yearFrom, yearTo]) => update({ yearFrom, yearTo })}
            />
            <Slider label="Max mileage" {...LIMITS.km} value={f.maxKm} onChange={(maxKm) => update({ maxKm })} format={km} />
            <ChipGroup label="Fuel" options={FUEL_OPTIONS} value={f.fuels} onChange={(fuels) => update({ fuels })} />
            <OptionTiles
              label="Gearbox"
              name="gear"
              options={[
                { value: 'any', label: 'Any' },
                { value: 'manual', label: 'Manual' },
                { value: 'automatic', label: 'Automatic' },
              ]}
              value={f.gearbox ?? 'any'}
              onChange={(g) => update({ gearbox: g === 'any' ? null : g })}
            />
            <OptionTiles label="Mostly driving" name="use" options={USAGE_OPTIONS} value={f.usage} onChange={(usage) => update({ usage })} />
          </div>
        </Details>
      </section>

      <section className="mx-6 mt-2 pt-4 pb-2">
        <TriangleSelector value={weights} onChange={setWeights} onCommit={(w) => update({ weights: w })} />
      </section>

      <section className="flex flex-col gap-4 px-6 pt-4 pb-2" aria-labelledby="best-title" data-testid="best-matches">
        <div className="flex flex-col">
          <h2 id="best-title" className="text-title-lg">
            Your top 3
          </h2>
          <span className="text-caption text-body">for “{nearestAnchor(weights).label}”</span>
        </div>
        {results.best.map((r, i) => (
          <MatchCard key={r.car.id} r={r} f={f} scores={SCORES.get(r.car.id)!} rankNo={i + 1} />
        ))}
        {results.best.length > 0 && results.best.length < 3 && (
          <p className="text-body-sm text-body" data-testid="only-n">
            Only {results.best.length} {results.best.length === 1 ? 'car fits' : 'cars fit'} everything you asked for.
          </p>
        )}

        {results.close.length > 0 &&
          (results.best.length < 3 ? (
            <div className="flex flex-col" data-testid="close-matches">
              <h3 className="text-title-sm">Close, but not a full match</h3>
              {closeRows}
            </div>
          ) : (
            <Details summary={`Close, but not a full match · ${results.close.length}`} testId="close-matches">
              {closeRows}
            </Details>
          ))}

        {results.closest.length > 0 && (
          <div className="flex flex-col gap-4" data-testid="closest">
            <p className="text-body-sm text-body">Nothing fits all your needs. Try a higher budget or fewer filters.</p>
            <h3 className="text-title-sm">Closest we have</h3>
            {results.closest.map((r, i) => (
              <MatchCard key={r.car.id} r={r} f={f} scores={SCORES.get(r.car.id)!} rankNo={i + 1} />
            ))}
          </div>
        )}

        {results.more.length > 0 && (
          <>
            <TextButton className="self-start" aria-expanded={showMore} onClick={() => setShowMore(!showMore)}>
              {showMore ? 'Hide more options' : `Show ${results.more.length} more options`}{' '}
              <span aria-hidden="true">{showMore ? '‹' : '›'}</span>
            </TextButton>
            {showMore && (
              <div className="flex flex-col" data-testid="more-options">
                <h3 className="sr-only">More options</h3>
                {results.more.map((r) => (
                  <OptionRow key={r.car.id} r={r} />
                ))}
              </div>
            )}
          </>
        )}
      </section>

      {results.avoid.length > 0 && (
        <section className="mt-4 flex flex-col gap-4 bg-surface-dark px-6 py-8 text-on-dark" aria-labelledby="avoid-title" data-testid="avoid-list">
          <div className="flex flex-col gap-1.5">
            <h2 id="avoid-title" className="text-display-sm">
              Cars to avoid in your budget
            </h2>
            <p className="text-body-sm text-on-dark-soft">
              You'll see these in listings at this price. They're cheap to buy for a reason.
            </p>
          </div>
          {results.avoid.map((r) => (
            <AvoidCard key={r.car.id} r={r} f={f} />
          ))}
        </section>
      )}

      <Disclaimer>Prices are typical Lithuanian asking prices, Nov 2026.</Disclaimer>
    </>
  )
}
