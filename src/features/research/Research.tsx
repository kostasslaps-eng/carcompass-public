import { ArrowRight, Heart, TriangleAlert } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Details, Disclaimer, GroupHeader, HeroBand, RatingRow } from '../../components/blocks'
import { CarImage } from '../../components/CarImage'
import { CarSelector } from '../../components/CarSelector'
import { ButtonLink, TextLinkCTA } from '../../components/controls'
import { cx } from '../../components/cx'
import { GlossaryText } from '../../components/GlossaryText'
import { Tag, VerdictTag } from '../../components/status'
import { STATUS_STYLE, VERDICT } from '../../components/status-styles'
import { UnknownCar } from '../../components/UnknownCar'
import { carName, cars, getCar } from '../../data'
import type { Alternative, Car, Fit } from '../../data/schema'
import { ANNUAL_KM, clamp } from '../../domain/constants'
import { mileageNote } from '../../domain/mileage'
import { eur, km as fmtKm } from '../../domain/format'
import { typicalPriceText } from '../../domain/price'
import { firstDueProblem, groupProblems, problemWithCost, type ProblemGroup } from '../../domain/problems'
import { buildScores, costWord, scoreWord } from '../../domain/scores'
import { useCarPage } from '../../hooks/useCarPage'
import { useSaved } from '../../hooks/useSaved'
import { buyUrl, researchUrl, sameAgeUrl } from '../../routes'
import { ProblemRow } from './ProblemRow'
import { priceSourceText } from './text'

const SCORES = buildScores(cars)

const GROUPS: { key: Exclude<ProblemGroup, 'later'>; title: string }[] = [
  { key: 'now', title: 'Check now' },
  { key: 'soon', title: 'Coming up in the next 40,000 km' },
  { key: 'past', title: 'Should already be fixed — ask for proof' },
]
const FIT_WORD: Record<Fit, string> = { good: 'Good', ok: 'OK', poor: 'Poor' }
const FIT_STATUS = { good: 'good', ok: 'neutral', poor: 'bad' } as const

export function Research() {
  const { carId, car, year, km, go } = useCarPage((c) => researchUrl(c.carId, c.year, c.km))
  if (carId && !car) return <UnknownCar id={carId} />
  return (
    <>
      <CarSelector car={car} year={year} km={km} onChange={go} />
      {car ? (
        <CarResearch car={car} year={year} km={km} />
      ) : (
        <HeroBand eyebrow="Step 2 of 3" title="Research a car">
          Choose a car above to see its known problems at your mileage, typical prices and better alternatives.
        </HeroBand>
      )}
    </>
  )
}

const ALT_GROUPS: { kind: Alternative['kind']; title: string }[] = [
  { kind: 'similar', title: 'Similar, but safer' },
  { kind: 'safest', title: 'Safest choice' },
]

/** One alternative (spec B.2): verdict + reliability, 0–100 vs this car, typical price at the same year/km, trade-off. */
function AlternativeCard({ a, car, year, km }: { a: Alternative; car: Car; year: number; km: number }) {
  const alt = getCar(a.id)!
  const altYear = clamp(year, alt.years.from, alt.years.to)
  return (
    <div className="flex flex-col gap-1.5 bg-surface-dark-elevated p-4">
      <span className="flex items-center gap-2">
        <VerdictTag verdict={alt.ratings.verdict} />
        <span className="text-caption text-on-dark-soft">Reliability: {scoreWord(alt.ratings.reliability)}</span>
      </span>
      <span className="text-title-sm">{carName(alt)}</span>
      <span className="text-body-sm text-on-dark-soft">{a.reason}</span>
      <span className="text-body-sm text-on-dark-soft">
        0–100 km/h: {alt.engine.zeroToHundredSec} s (this car {car.engine.zeroToHundredSec} s)
      </span>
      <span className="text-body-sm text-on-dark-soft">
        Typical asking price ({altYear}, {fmtKm(km)}): {typicalPriceText(alt, altYear, km)}
      </span>
      {a.tradeOff && (
        <p className="mt-1 flex items-start gap-2 bg-warn-bg px-3 py-2 text-body-sm text-warn">
          <TriangleAlert size={18} strokeWidth={2.25} className="mt-0.5 flex-none" aria-hidden="true" />
          <span>
            <strong className="font-bold">Trade-off:</strong> {a.tradeOff}
          </span>
        </p>
      )}
      <TextLinkCTA onDark to={sameAgeUrl(alt, year, km)} className="self-start" aria-label={`See this car: ${carName(alt)}`}>
        See this car
      </TextLinkCTA>
    </div>
  )
}

/** "Bottom line" (spec 12 §4.2): the verdict at this mileage, the biggest risk now, and the price range. */
function BottomLine({ car, year, km }: { car: Car; year: number; km: number }) {
  const verdict = VERDICT[car.ratings.verdict]
  const { box, icon: Icon } = STATUS_STYLE[verdict.status]
  const due = firstDueProblem(car.problems, km)
  const note = mileageNote(year, km)
  const openPriceSource = () => {
    const d = document.getElementById('price-source') as HTMLDetailsElement | null
    if (!d) return
    d.open = true
    d.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
  return (
    <section className={cx('flex flex-col gap-2.5 px-6 py-5', box)} data-testid="bottom-line" aria-label="Bottom line">
      <span className="flex items-center gap-2 text-label uppercase">
        <Icon size={18} strokeWidth={2.25} aria-hidden="true" />
        {verdict.word} at {fmtKm(km)}
      </span>
      <p className="text-body-md text-body-strong" data-testid="verdict">
        {car.verdictText}
      </p>
      <GlossaryText
        as="p"
        className="text-body-sm text-body-strong"
        before={<strong className="font-bold">{due?.group === 'soon' ? 'Coming up: ' : due ? 'Biggest risk now: ' : ''}</strong>}
        text={due ? `${problemWithCost(due.problem)} to fix` : 'No serious known problems due at this mileage.'}
      />
      {note && (
        <p className="flex items-start gap-2 text-body-sm font-bold text-warn" data-testid="mileage-note">
          <TriangleAlert size={18} strokeWidth={2.25} className="mt-0.5 flex-none" aria-hidden="true" />
          {note.text}
        </p>
      )}
      <p className="text-body-sm text-body-strong">
        <strong className="font-bold">Typical asking price:</strong>{' '}
        {typicalPriceText(car, year, km)}{' '}
        <button type="button" onClick={openPriceSource} className="text-caption underline">
          Where this comes from
        </button>
      </p>
    </section>
  )
}

function CarResearch({ car, year, km }: { car: Car; year: number; km: number }) {
  const s = SCORES.get(car.id)!
  const groups = groupProblems(car.problems, km)
  const electric = car.engine.fuel === 'electric'
  const yearly = Math.round((car.costs.maintenancePerYearEur + s.fuelPerYear) / 100) * 100
  // The first row of the first non-empty group (now → soon → past) starts open.
  const firstOpen = GROUPS.map((g) => groups[g.key][0]).find(Boolean)?.id

  return (
    <>
      <CarImage car={car} className="h-[160px]" eager />
      <section className="flex flex-col gap-1.5 bg-surface-dark px-6 pt-6 pb-5 text-on-dark">
        <span className="text-caption text-on-dark-soft">
          {car.years.from}–{car.years.to} · {car.engine.powerHp} hp · {car.gearboxes.map((g) => g.name).join(' / ')}
        </span>
        <h1 className="text-display-md">{carName(car)}</h1>
      </section>
      <BottomLine car={car} year={year} km={km} />

      <section className="px-6 pt-2" aria-label="Ratings">
        <RatingRow label="Reliability" word={scoreWord(s.reliability)} score={s.reliability} />
        <RatingRow label="Performance" word={scoreWord(s.performance)} score={s.performance} />
        <RatingRow label="Cost to run" word={costWord(s.runningCosts)} score={s.runningCosts} extra={`about ${eur(yearly)} a year`} />
        <div className="flex flex-col gap-2 py-3">
          <span className="text-label uppercase text-muted">Good for</span>
          <div className="flex flex-wrap gap-2">
            {(['city', 'highway', 'mixed'] as const).map((u) => (
              <Tag key={u} status={FIT_STATUS[car.ratings.usageFit[u]]}>
                {u === 'mixed' ? 'Mixed' : u === 'city' ? 'City' : 'Highway'}: {FIT_WORD[car.ratings.usageFit[u]]}
              </Tag>
            ))}
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-4 px-6 pt-6 pb-2" aria-labelledby="watch-title">
        <h2 id="watch-title" className="text-display-sm">
          At {fmtKm(km)}, watch for
        </h2>
        {GROUPS.every((g) => !groups[g.key].length) && (
          <p className="text-body-sm text-body">No known problems are typical at this mileage. Still get it inspected.</p>
        )}
        {GROUPS.map(
          (g) =>
            groups[g.key].length > 0 && (
              <div key={g.key} className="flex flex-col gap-3" data-testid={`group-${g.key}`}>
                <GroupHeader title={`${g.title} · ${groups[g.key].length}`} />
                {groups[g.key].map((p) => (
                  <ProblemRow key={p.id} p={p} open={p.id === firstOpen} />
                ))}
              </div>
            ),
        )}
        {groups.later.length > 0 && (
          <Details summary={`Later · ${groups.later.length}`} testId="group-later">
            <div className="flex flex-col gap-3">
              {groups.later.map((p) => (
                <ProblemRow key={p.id} p={p} />
              ))}
            </div>
          </Details>
        )}
      </section>

      <section className="flex flex-col gap-3 px-6 pt-6 pb-2" aria-labelledby="costs-title">
        <h2 id="costs-title" className="text-display-sm">
          Running costs
        </h2>
        <dl className="grid grid-cols-2 border-y border-hairline">
          {[
            { label: 'Servicing / year', value: eur(car.costs.maintenancePerYearEur) },
            { label: electric ? 'Electricity / year' : 'Fuel / year', value: eur(Math.round(s.fuelPerYear / 10) * 10) },
          ].map((c, i) => (
            <div key={c.label} className={cx('flex flex-col-reverse justify-end gap-1 py-5', i === 0 ? 'border-r border-hairline pr-4' : 'pl-4')}>
              <dt className="text-label uppercase text-muted">{c.label}</dt>
              <dd className="text-display-sm">{c.value}</dd>
            </div>
          ))}
        </dl>
        <p className="text-body-sm text-body">
          Estimated at {ANNUAL_KM.toLocaleString('en-US')} km a year (
          {electric ? `${car.engine.consumptionKwh100km} kWh` : `${car.engine.consumptionL100km} l`}/100 km). Excludes big
          repairs.
        </p>
        <ul>
          {car.costs.commonParts.map((p) => (
            <li key={p.item} className="flex justify-between gap-3 border-b border-hairline py-3 text-body-sm">
              <div className="flex flex-col gap-0.5">
                <span>{p.item}</span>
                <span className="text-muted">{p.intervalKm ? `Every ${fmtKm(p.intervalKm)}` : 'When needed'}</span>
              </div>
              <span className="font-bold whitespace-nowrap">
                €{p.costEurMin.toLocaleString('en-US')}–{p.costEurMax.toLocaleString('en-US')}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="grid grid-cols-2 gap-4 px-6 pt-6 pb-2">
        {[
          { title: 'Good', items: car.pros, mark: '+', color: 'text-good' },
          { title: 'Not so good', items: car.cons, mark: '−', color: 'text-bad' },
        ].map((col) => (
          <div key={col.title} className="flex flex-col gap-2.5">
            <h2 className="text-label uppercase">{col.title}</h2>
            <ul className="flex flex-col gap-2.5">
              {col.items.map((x) => (
                <li key={x} className="flex gap-2 text-body-sm">
                  <span aria-hidden="true" className={cx('font-bold', col.color)}>
                    {col.mark}
                  </span>
                  {x}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      {car.alternatives.length > 0 && (
        <section className="mt-6 flex flex-col gap-3.5 bg-surface-dark px-6 py-8 text-on-dark" data-testid="alternatives">
          <h2 className="text-display-sm">Better alternatives</h2>
          {ALT_GROUPS.map(({ kind, title }) => {
            const list = car.alternatives.filter((a) => a.kind === kind)
            return (
              list.length > 0 && (
                <div key={kind} className="flex flex-col gap-3" data-testid={`alt-${kind}`}>
                  <h3 className="text-label uppercase text-on-dark-soft">{title}</h3>
                  {list.map((a) => (
                    <AlternativeCard key={a.id} a={a} car={car} year={year} km={km} />
                  ))}
                </div>
              )
            )
          })}
        </section>
      )}

      <div className="flex flex-col gap-1 px-6 pt-6">
        <Details summary="Where the price comes from" id="price-source" testId="price-source">
          <p className="text-body-sm text-body">{priceSourceText(car, year, km)}</p>
          <p className="pt-2 text-caption text-muted">Source: {car.priceSource}.</p>
        </Details>
        <Details summary="What owners say">
          <GlossaryText text={car.ownerSummary} className="text-body-sm text-body" />
        </Details>
        <Details summary="Sources, photo credit and confidence">
          <div className="flex flex-col gap-2 text-caption text-muted">
            <ul className="flex flex-col gap-1">
              {car.sources.map((src) => (
                <li key={src.url}>
                  <a href={src.url} target="_blank" rel="noreferrer" className="underline">
                    {src.title}
                  </a>
                </li>
              ))}
            </ul>
            {car.photos.map((p) => (
              <p key={p.pageUrl}>
                <a href={p.pageUrl} target="_blank" rel="noreferrer" className="underline">
                  Photo
                </a>{' '}
                by {p.author}, {p.license}, via Wikimedia Commons.
              </p>
            ))}
            <p>
              Data confidence: {car.confidence.overall}
              {car.confidence.notes ? `. ${car.confidence.notes}` : ''}
            </p>
          </div>
        </Details>
      </div>
      <Disclaimer />

      <ActionBar car={car} year={year} km={km} />
    </>
  )
}

function ActionBar({ car, year, km }: { car: Car; year: number; km: number }) {
  const { saved, isSaved, toggle } = useSaved()
  const navigate = useNavigate()
  const on = isSaved(car.id)
  const compare = () => {
    if (!on) toggle(car.id, year, km)
    const ids = [car.id, ...saved.map((x) => x.carId).filter((id) => id !== car.id)].slice(0, 3)
    navigate(`/compare?ids=${ids.join(',')}`)
  }
  return (
    <div data-testid="action-bar" className="fixed inset-x-0 bottom-16 z-20 mx-auto flex max-w-[480px] items-center gap-2 border-t border-hairline bg-canvas px-4 py-3">
      <ButtonLink to={buyUrl(car.id, year, km)} className="flex-1 whitespace-nowrap" data-testid="going-to-see">
        Going to see one <ArrowRight size={18} aria-hidden="true" />
      </ButtonLink>
      <button
        type="button"
        aria-label={on ? 'Remove from saved' : 'Save this car'}
        aria-pressed={on}
        onClick={() => toggle(car.id, year, km)}
        className={cx('flex h-12 w-12 items-center justify-center border border-hairline-strong', on ? 'text-primary' : 'text-ink')}
        data-testid="save-car"
      >
        <Heart size={22} strokeWidth={1.75} fill={on ? 'currentColor' : 'none'} aria-hidden="true" />
      </button>
      <button type="button" onClick={compare} className="flex h-12 items-center border border-hairline-strong px-3 text-button">
        Compare
      </button>
    </div>
  )
}
