import { TriangleAlert } from 'lucide-react'
import { useId } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Details, GroupHeader, HeroBand } from '../../components/blocks'
import { CarSelector } from '../../components/CarSelector'
import { TextButton } from '../../components/controls'
import { cx } from '../../components/cx'
import { StatusBlock, VerdictTag } from '../../components/status'
import type { Status } from '../../components/status-styles'
import { UnknownCar } from '../../components/UnknownCar'
import { carName, generalChecklist } from '../../data'
import type { Car } from '../../data/schema'
import { buildChecklist, topChecks, type ChecklistItem } from '../../domain/checklist'
import { clamp } from '../../domain/constants'
import { mileageNote } from '../../domain/mileage'
import { eur, eurRange, km as fmtKm } from '../../domain/format'
import { estimate, hasPrice, noPriceText, priceCheck, typicalRange } from '../../domain/price'
import { useCarPage } from '../../hooks/useCarPage'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import { buyUrl, int } from '../../routes'
import { priceSourceText } from '../research/text'

export function Buy() {
  const [search] = useSearchParams()
  const navigate = useNavigate()
  const price = int(search.get('price'))
  const asking = price && price > 0 ? price : undefined
  const { carId, car, year, km, go } = useCarPage((c) => buyUrl(c.carId, c.year, c.km, asking))
  if (carId && !car) return <UnknownCar id={carId} />

  return (
    <>
      <CarSelector car={car} year={year} km={km} onChange={go} />
      {car ? (
        <BuyChecks
          car={car}
          year={year}
          km={km}
          asking={asking}
          setAsking={(p) => navigate(buyUrl(car.id, year, km, p), { replace: true })}
        />
      ) : (
        <HeroBand eyebrow="Step 3 of 3" title="Before you buy">
          Pick a car above to check the asking price and get a viewing checklist for it.
        </HeroBand>
      )}
    </>
  )
}

const CHECK_TEXT: Record<'cheap' | 'fair' | 'above', { status: Status; title: string; text: (hi: number) => string }> = {
  cheap: {
    status: 'warn',
    title: 'Suspiciously cheap',
    text: () => 'Find out why before travelling. Very low prices often hide accident damage, rolled-back mileage or a scam.',
  },
  fair: { status: 'good', title: 'Fair asking price', text: () => 'Within the usual range for this car.' },
  above: {
    status: 'warn',
    title: 'Above typical',
    text: (hi) => `Try negotiating towards ${eur(hi)}. Use any missing service records as an argument.`,
  },
}

function BuyChecks({
  car,
  year,
  km,
  asking,
  setAsking,
}: {
  car: Car
  year: number
  km: number
  asking?: number
  setAsking: (p: number | undefined) => void
}) {
  const inputId = useId()
  const est = estimate(car, year, km)
  const [lo, hi] = typicalRange(est)
  const priced = hasPrice(car, year)
  const check = asking && priced ? CHECK_TEXT[priceCheck(asking, est)] : null
  const fairLo = Math.round((est * 0.8) / 100) * 100
  const fairHi = Math.round((est * 1.15) / 100) * 100
  const note = mileageNote(year, km)
  // Price scale spans 60–140% of the estimate.
  const pos = (x: number) => clamp(((x - est * 0.6) / (est * 0.8)) * 100, 0, 100)

  return (
    <>
      <section className="flex flex-col gap-2.5 bg-surface-dark px-6 py-7 text-on-dark">
        <h1 className="text-display-md">Before you buy</h1>
        <p className="text-body-md text-on-dark-soft">
          {carName(car)} · {year} · {fmtKm(km)}
        </p>
        <VerdictTag verdict={car.ratings.verdict} />
      </section>

      <section className="flex flex-col gap-3.5 border-b border-hairline p-6" aria-labelledby="price-title">
        <h2 id="price-title" className="text-display-sm">
          Price check
        </h2>
        <label htmlFor={inputId} className="text-[14px] font-bold">
          Seller's asking price (€)
        </label>
        <input
          id={inputId}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          placeholder="e.g. 9500"
          data-testid="asking-price"
          disabled={!priced}
          aria-describedby={priced ? undefined : `${inputId}-none`}
          className="h-12 w-full border border-hairline-strong px-4 text-body-md text-ink focus:border-2 focus:border-ink focus:px-[15px] focus:outline-none disabled:bg-surface-soft disabled:text-muted"
          value={asking ?? ''}
          onChange={(e) => {
            const n = parseInt(e.target.value.replace(/[^0-9]/g, ''), 10)
            setAsking(Number.isFinite(n) && n > 0 ? Math.min(n, 999999) : undefined)
          }}
        />
        {priced && (
          <div className="relative mt-4 h-14" aria-hidden="true">
            {/* The same zones the price check uses: cheap < 80 %, fair 80–115 %, above > 115 % of the estimate. */}
            <div className="absolute inset-x-0 top-[18px] h-2 bg-warn/35" />
            <div className="absolute top-[18px] h-2 bg-good" style={{ left: `${pos(fairLo)}%`, width: `${pos(fairHi) - pos(fairLo)}%` }} />
            {asking && (
              <>
                <div className="absolute top-1.5 -ml-px h-8 w-0.5 bg-ink" style={{ left: `${pos(asking)}%` }} />
                <span className="absolute -top-4 -translate-x-1/2 text-body-sm font-bold whitespace-nowrap" style={{ left: `${clamp(pos(asking), 8, 92)}%` }}>
                  {eur(asking)}
                </span>
              </>
            )}
            <span className="absolute top-[32px] -translate-x-1/2 text-body-sm text-body" style={{ left: `${pos(fairLo)}%` }}>
              {eur(fairLo)}
            </span>
            <span className="absolute top-[32px] -translate-x-1/2 text-body-sm text-body" style={{ left: `${pos(fairHi)}%` }}>
              {eur(fairHi)}
            </span>
          </div>
        )}
        <div data-testid="price-check">
          {!priced ? (
            <StatusBlock live status="neutral" title="No price estimate">
              <span id={`${inputId}-none`}>{noPriceText(year)}</span>
            </StatusBlock>
          ) : check ? (
            <StatusBlock live status={check.status} title={check.title}>
              {check.text(hi)}
            </StatusBlock>
          ) : (
            <StatusBlock live status="neutral" title="Enter a price">
              Type the seller's asking price to compare it with typical prices.
            </StatusBlock>
          )}
        </div>
        {note && (
          <p className="flex items-start gap-2 text-body-sm font-bold text-warn" data-testid="mileage-note">
            <TriangleAlert size={18} strokeWidth={2.25} className="mt-0.5 flex-none" aria-hidden="true" />
            {note.text}
          </p>
        )}
        {priced && (
          <Details summary="Where this comes from" testId="price-source">
            <p className="text-body-sm text-body">
              Typical asking price {eurRange([lo, hi])} for this year and mileage. {priceSourceText(car, year, km)}
            </p>
            <p className="pt-2 text-caption text-muted">Source: {car.priceSource}.</p>
          </Details>
        )}
      </section>

      <Checklist car={car} km={km} />

      <section className="flex flex-col gap-2.5 bg-surface-dark px-6 pt-8 pb-10 text-on-dark">
        <h2 className="text-display-sm">Still unsure?</h2>
        <p className="text-body-md text-on-dark-soft">
          Book a pre-purchase inspection at an independent garage — usually €40–100. It's the best money you'll spend.
        </p>
        <span className="mt-2 text-caption text-on-dark-muted">We advise, we don't guarantee.</span>
      </section>
    </>
  )
}

/** Red flags → Top 5 → full checklist in closed groups (spec 12 §5). Ticks are stored per car, as before. */
function Checklist({ car, km }: { car: Car; km: number }) {
  const sections = buildChecklist(car, km, generalChecklist)
  const top = topChecks(car, km, generalChecklist)
  const topIds = new Set(top.map((i) => i.id))
  const [ticked, setTicked] = useLocalStorage<string[]>(`cc.checklist.${car.id}`, [])
  const done = new Set(Array.isArray(ticked) ? ticked : [])
  // Top-5 items aren't repeated in the groups below.
  const groups = sections
    .filter((s) => s.id !== 'redflags')
    .map((s) => ({ ...s, items: s.items.filter((i) => !topIds.has(i.id)) }))
    .filter((s) => s.items.length)
  const flags = sections.find((s) => s.id === 'redflags')!
  const all = [...top, ...groups.flatMap((s) => s.items)]
  const nDone = all.filter((i) => done.has(i.id)).length
  const toggle = (id: string) => setTicked((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  const row = (item: ChecklistItem) => (
    <CheckRow key={item.id} item={item} model={car.model} on={done.has(item.id)} toggle={() => toggle(item.id)} />
  )

  return (
    <>
      <RedFlags items={flags.items} />

      <section className="flex flex-col gap-3 px-6 pt-6 pb-2" aria-labelledby="checklist-title" data-testid="checklist">
        <div className="flex items-baseline justify-between">
          <h2 id="checklist-title" className="text-display-sm">
            Checklist
          </h2>
          <TextButton onClick={() => setTicked([])} data-testid="reset-checklist">
            Reset
          </TextButton>
        </div>
        <div className="flex flex-col gap-1.5">
          <div
            className="h-1 bg-surface-strong"
            role="progressbar"
            aria-label="Checklist progress"
            aria-valuemin={0}
            aria-valuemax={all.length}
            aria-valuenow={nDone}
          >
            <div className="h-1 bg-primary transition-[width] duration-150" style={{ width: `${(nDone / all.length) * 100}%` }} />
          </div>
          <span className="text-caption text-body" data-testid="checklist-progress">
            {nDone} of {all.length} checked
          </span>
        </div>

        <div className="mt-3 flex flex-col" data-testid="top-checks">
          <GroupHeader title="Top 5 for this car" hint={`${top.filter((i) => done.has(i.id)).length} of ${top.length}`} />
          <ul>{top.map(row)}</ul>
        </div>

        <div className="mt-3 flex flex-col" data-testid="full-checklist">
          {groups.map((s) => (
            <Details key={s.id} summary={`${s.title} · ${s.items.filter((i) => done.has(i.id)).length} of ${s.items.length}`}>
              <ul>{s.items.map(row)}</ul>
            </Details>
          ))}
        </div>
      </section>
    </>
  )
}

function RedFlags({ items }: { items: ChecklistItem[] }) {
  return (
    <section className="flex flex-col gap-2.5 p-6" aria-labelledby="flags-title" data-testid="red-flags">
        <div className="flex items-center gap-2 border-b-2 border-bad pb-2 text-bad">
          <TriangleAlert size={18} strokeWidth={2.25} aria-hidden="true" />
          <h2 id="flags-title" className="text-label uppercase">
            Red flags — walk away if
          </h2>
        </div>
        <ul>
          {items.map((f) => (
            <li key={f.id} className="flex gap-2.5 border-b border-hairline py-2.5 text-body-sm">
              <span aria-hidden="true" className="font-bold text-bad">
                ×
              </span>
              <span>{f.text}</span>
            </li>
          ))}
        </ul>
      </section>
  )
}

function CheckRow({ item, model, on, toggle }: { item: ChecklistItem; model: string; on: boolean; toggle: () => void }) {
  return (
    <li>
      <label className="flex min-h-11 cursor-pointer items-start gap-3 border-b border-hairline py-3">
        <input type="checkbox" checked={on} onChange={toggle} className="mt-0.5 h-5 w-5 flex-none accent-primary" />
        <span className={cx('text-[14px] leading-[1.5] font-normal', on ? 'text-muted' : 'text-ink')}>
          {item.text}
          {item.carSpecific && (
            <span className="ml-1.5 inline-block bg-primary-soft px-1.5 py-px align-[1px] text-[12px] leading-[1.4] font-bold tracking-[1px] text-primary-active uppercase">
              {model}
            </span>
          )}
        </span>
      </label>
    </li>
  )
}
