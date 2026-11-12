import { ChevronDown } from 'lucide-react'
import { scoreBars } from '../domain/scores'
import type { ReactNode } from 'react'
import { cx } from './cx'

/** Dark band at the top of a screen: eyebrow, title, lead. */
export function HeroBand({ eyebrow, title, children }: { eyebrow?: string; title: string; children?: ReactNode }) {
  return (
    <section className="flex flex-col gap-3 bg-surface-dark px-6 py-8 text-on-dark">
      {eyebrow && <span className="text-label uppercase text-on-dark-muted">{eyebrow}</span>}
      <h1 className="text-display-md">{title}</h1>
      {children && <div className="text-body-md text-on-dark-soft">{children}</div>}
    </section>
  )
}

/** "NOW · 4" with a 2px underline and an optional hint on the right. */
export function GroupHeader({ title, hint, tone = 'ink', id }: { title: ReactNode; hint?: string; tone?: 'ink' | 'bad'; id?: string }) {
  return (
    <div
      className={cx(
        'flex items-center justify-between gap-3 border-b-2 pb-2',
        tone === 'bad' ? 'border-bad text-bad' : 'border-ink text-ink',
      )}
    >
      <h3 id={id} className="flex items-center gap-2 text-label uppercase">
        {title}
      </h3>
      {hint && <span className="text-right text-caption text-muted">{hint}</span>}
    </div>
  )
}

export const Disclaimer = ({ children, className }: { children?: ReactNode; className?: string }) => (
  <p className={cx('px-6 py-6 text-caption text-muted', className)}>
    {children}
    {children && ' '}We advise, we don't guarantee.
  </p>
)

const one = (v: number) => Math.round(v * 10) / 10

/** 5 square segments (filled = ink). Screen readers get the words, not the squares. */
export function Bars({ score, label }: { score: number; label: string }) {
  const filled = scoreBars(score)
  return (
    <span role="img" aria-label={label} className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={cx('h-2.5 w-2.5', i <= filled ? 'bg-ink' : 'bg-surface-strong')} />
      ))}
    </span>
  )
}

/** "Reliability / Good / ■■■■□ 8/10" (spec 12 §1.3). */
export function RatingRow({ label, word, score, extra }: { label: string; word: string; score: number; extra?: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-hairline py-3" data-testid="rating-row">
      <div className="flex min-w-0 flex-col">
        <span className="text-label uppercase text-muted">{label}</span>
        <span className="text-title-sm">
          {word}
          {extra && <span className="text-body-sm font-normal text-body"> · {extra}</span>}
        </span>
      </div>
      <div className="flex flex-none items-center gap-2">
        <Bars score={score} label={`${label}: ${word}, ${one(score)} out of 10`} />
        <span className="text-caption text-body" aria-hidden="true">
          {one(score)}/10
        </span>
      </div>
    </div>
  )
}

/** Native collapsible section: keyboard and screen-reader friendly (spec 12 §1.5). */
export function Details({
  summary,
  children,
  open,
  className,
  testId,
  id,
}: {
  summary: ReactNode
  children: ReactNode
  open?: boolean
  className?: string
  testId?: string
  id?: string
}) {
  return (
    <details id={id} open={open} className={cx('group', className)} data-testid={testId}>
      <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 border-b border-hairline text-label uppercase [&::-webkit-details-marker]:hidden">
        {summary}
        <ChevronDown size={18} aria-hidden="true" className="flex-none transition-transform duration-150 group-open:rotate-180" />
      </summary>
      <div className="pt-3 pb-2">{children}</div>
    </details>
  )
}
