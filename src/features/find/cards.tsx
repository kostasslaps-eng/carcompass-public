import { ChevronRight, CircleCheck, Heart, TriangleAlert } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Bars } from '../../components/blocks'
import { CarImage } from '../../components/CarImage'
import { TextLinkCTA } from '../../components/controls'
import { cx } from '../../components/cx'
import { GlossaryText } from '../../components/GlossaryText'
import { Tag, VerdictTag } from '../../components/status'
import { cars } from '../../data'
import { problemWithCost } from '../../domain/problems'
import type { FindInputs, RankedCar } from '../../domain/ranking'
import { costWord, scoreWord, type CarScores } from '../../domain/scores'
import { useSaved } from '../../hooks/useSaved'
import { researchUrl } from '../../routes'
import { betterInsteadText, matchLine, searchFor, searchPoint, skipFor, watchLine } from './text'

/** Best-match card: "what to search for" on a listings site (spec 12 §3.2). */
export function MatchCard({ r, f, scores, rankNo }: { r: RankedCar; f: FindInputs; scores: CarScores; rankNo: number }) {
  const { car } = r
  const { isSaved, toggle } = useSaved()
  const saved = isSaved(car.id)
  const p = searchPoint(r)
  const s = searchFor(r)
  const skip = skipFor(car, cars)
  const name = `${car.make} ${car.model}`
  const full = r.missed.length === 0
  return (
    <article className="border border-hairline bg-canvas" data-testid="match-card">
      <div className="flex flex-col gap-3 p-4 pb-1" data-testid={`car-card-${car.id}`}>
        <div className="flex items-center gap-2">
          <VerdictTag verdict={car.ratings.verdict} />
          <span className="text-caption text-body">#{rankNo} for you</span>
        </div>

        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-col">
            <h3 className="text-title-md">{name}</h3>
            <span className="text-body-sm text-muted">{car.generation}</span>
          </div>
          <CarImage car={car} className="h-12 w-[72px] flex-none" />
        </div>

        <div className="flex flex-col gap-1 bg-surface-soft p-3" data-testid="search-for">
          <span className="text-label uppercase text-muted">Search for</span>
          <dl className="grid grid-cols-[auto_1fr] gap-x-2 gap-y-0.5 text-body-sm text-body">
            {(
              [
                ['Engine', s.engine],
                ['Years', s.years],
                ['Mileage', s.mileage],
                ['Fair price', s.fairPrice],
              ] as const
            ).map(([k, v]) => (
              <div key={k} className="contents">
                <dt className="font-bold text-ink">{k}:</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
        </div>

        <p className="flex items-start gap-2 text-body-sm text-body">
          <CircleCheck size={18} strokeWidth={2.25} className="mt-0.5 flex-none text-good" aria-hidden="true" />
          <span>
            <strong className="font-bold text-good">Why:</strong> {car.pros[0]}
          </span>
        </p>
        <div className="flex items-start gap-2 text-body-sm text-body">
          <TriangleAlert size={18} strokeWidth={2.25} className="mt-0.5 flex-none text-warn" aria-hidden="true" />
          <GlossaryText as="span" text={watchLine(car, p.km)} before={<strong className="font-bold text-warn">Watch: </strong>} />
        </div>
        {skip && <p className="text-body-sm text-bad">{skip}</p>}

        <div className="flex flex-wrap gap-x-5 gap-y-1">
          {(
            [
              ['Reliability', scoreWord(scores.reliability), scores.reliability],
              ['Cost to run', costWord(scores.runningCosts), scores.runningCosts],
            ] as const
          ).map(([label, word, score]) => (
            <span key={label} className="flex items-center gap-2 text-caption text-body">
              {label}
              <Bars score={score} label={`${label}: ${word}`} />
            </span>
          ))}
        </div>

        <p className={cx('text-caption', full ? 'text-good' : 'text-warn')}>{matchLine(r, f)}</p>
      </div>

      <div className="flex items-center justify-between pr-2 pb-1 pl-4">
        <TextLinkCTA to={researchUrl(car.id, p.year, p.km)} aria-label={`Full guide: ${name} ${car.engine.name}`}>
          Full guide
        </TextLinkCTA>
        <button
          type="button"
          aria-label={`Save ${name}`}
          aria-pressed={saved}
          onClick={() => toggle(car.id, p.year, p.km)}
          className={cx('flex h-11 w-11 items-center justify-center rounded-full', saved ? 'text-primary' : 'text-ink')}
        >
          <Heart size={22} strokeWidth={1.75} fill={saved ? 'currentColor' : 'none'} aria-hidden="true" />
        </button>
      </div>
    </article>
  )
}

/** Compact "More options" row; the whole row is the link (spec 12 §3.3). */
export function OptionRow({ r, note }: { r: RankedCar; note?: string }) {
  const { car } = r
  const p = searchPoint(r)
  return (
    <Link
      to={researchUrl(car.id, p.year, p.km)}
      className="flex items-center gap-3 border-b border-hairline py-3 no-underline"
      data-testid={`more-option-${car.id}`}
    >
      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <VerdictTag verdict={car.ratings.verdict} />
        <span className="text-title-sm text-ink">
          {car.make} {car.model}
        </span>
        <span className="text-body-sm text-body">
          {car.engine.name} · fair price {searchFor(r).fairPrice}
        </span>
        {note && <span className="text-body-sm font-bold text-warn">{note}</span>}
      </span>
      <ChevronRight size={20} className="flex-none text-ink" aria-hidden="true" />
    </Link>
  )
}

/**
 * Avoid card on the dark band. The name is the link and stretches over the card, so the glossary terms in
 * "Known for" can be real buttons without nesting them inside a link.
 */
export function AvoidCard({ r, f }: { r: RankedCar; f: FindInputs }) {
  const { car } = r
  const p = searchPoint(r)
  const better = betterInsteadText(car, f)
  return (
    <div className="relative flex items-start gap-3.5 bg-surface-dark-elevated p-4 text-on-dark" data-testid={`avoid-card-${car.id}`}>
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <Tag status="bad">Avoid</Tag>
        <Link
          to={researchUrl(car.id, p.year, p.km)}
          className="text-title-sm text-on-dark no-underline after:absolute after:inset-0 after:content-['']"
        >
          {car.make} {car.model} {car.engine.name}
        </Link>
        <GlossaryText
          as="span"
          text={`${problemWithCost(car.problems[0])} to fix`}
          className="text-body-sm text-on-dark-soft [&_button]:relative [&_button]:z-10"
          before="Known for: "
        />
        {better && <span className="text-body-sm text-on-dark">Better instead: {better}</span>}
      </div>
      <ChevronRight size={20} className="mt-1 flex-none text-on-dark-muted" aria-hidden="true" />
    </div>
  )
}
