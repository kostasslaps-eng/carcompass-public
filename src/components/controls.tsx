import { useId, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { cx } from './cx'
import { Link, type LinkProps } from 'react-router-dom'


const BUTTON = {
  primary: 'bg-primary text-on-dark active:bg-primary-active',
  secondary: 'bg-canvas text-ink border border-hairline-strong',
}

export function Button({
  variant = 'primary',
  className,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: keyof typeof BUTTON }) {
  return (
    <button
      type="button"
      className={cx('flex h-12 items-center justify-center gap-2 px-6 text-button', BUTTON[variant], className)}
      {...rest}
    />
  )
}

export function ButtonLink({ variant = 'primary', className, ...rest }: LinkProps & { variant?: keyof typeof BUTTON }) {
  return (
    <Link
      className={cx('flex h-12 items-center justify-center gap-2 px-6 text-button no-underline', BUTTON[variant], className)}
      {...rest}
    />
  )
}

/** "RESEARCH THIS CAR ›" — label-style text link, min 44px tall. */
export function TextLinkCTA({ className, children, onDark, ...rest }: LinkProps & { onDark?: boolean }) {
  return (
    <Link
      className={cx(
        'inline-flex min-h-11 items-center gap-1.5 text-label uppercase no-underline',
        onDark ? 'text-on-dark' : 'text-ink',
        className,
      )}
      {...rest}
    >
      {children} <span aria-hidden="true">›</span>
    </Link>
  )
}

export function TextButton({ className, onDark, ...rest }: ButtonHTMLAttributes<HTMLButtonElement> & { onDark?: boolean }) {
  return (
    <button
      type="button"
      className={cx('inline-flex min-h-11 items-center gap-1.5 text-label uppercase', onDark ? 'text-on-dark' : 'text-ink', className)}
      {...rest}
    />
  )
}

export function FieldLabel({ children, htmlFor, id }: { children: ReactNode; htmlFor?: string; id?: string }) {
  const Tag = htmlFor ? 'label' : 'span'
  return (
    <Tag htmlFor={htmlFor} id={id} className="text-label uppercase text-muted">
      {children}
    </Tag>
  )
}

/** Multi-select chips with an "Any" chip; empty selection = any. */
export function ChipGroup<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string
  options: { value: T; label: string }[]
  value: T[]
  onChange: (v: T[]) => void
}) {
  const id = useId()
  const chip = (active: boolean) =>
    cx(
      'min-h-9 border px-3.5 py-2 text-caption transition-colors duration-150',
      active ? 'border-ink bg-ink text-on-dark' : 'border-hairline-strong bg-canvas text-ink',
    )
  return (
    <div role="group" aria-labelledby={id} className="flex flex-col gap-2.5">
      <FieldLabel id={id}>{label}</FieldLabel>
      <div className="flex flex-wrap gap-2">
        <button type="button" aria-pressed={value.length === 0} className={chip(value.length === 0)} onClick={() => onChange([])}>
          Any
        </button>
        {options.map((o) => {
          const on = value.includes(o.value)
          return (
            <button
              key={o.value}
              type="button"
              aria-pressed={on}
              className={chip(on)}
              onClick={() => onChange(on ? value.filter((v) => v !== o.value) : [...value, o.value])}
            >
              {o.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

/** Single-select, equal-width tiles (native radios, so arrow keys work). */
export function OptionTiles<T extends string>({
  label,
  name,
  options,
  value,
  onChange,
}: {
  label: string
  name: string
  options: { value: T; label: string }[]
  value: T
  onChange: (v: T) => void
}) {
  const id = useId()
  return (
    <div role="radiogroup" aria-labelledby={id} className="flex flex-col gap-2.5">
      <FieldLabel id={id}>{label}</FieldLabel>
      <div className="flex gap-2">
        {options.map((o) => {
          const on = o.value === value
          return (
            <label
              key={o.value}
              className={cx(
                'flex h-12 flex-1 cursor-pointer items-center justify-center text-body-sm has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-primary',
                on ? 'border-2 border-primary font-normal' : 'border border-hairline',
              )}
            >
              <input
                type="radio"
                name={name}
                value={o.value}
                checked={on}
                onChange={() => onChange(o.value)}
                className="sr-only"
              />
              {o.label}
            </label>
          )
        })}
      </div>
    </div>
  )
}

const pct = (v: number, min: number, max: number) => `${((v - min) / (max - min)) * 100}%`

export function Slider({
  label,
  min,
  max,
  step,
  value,
  onChange,
  format,
  hint,
}: {
  label: string
  min: number
  max: number
  step: number
  value: number
  onChange: (v: number) => void
  format: (v: number) => string
  hint?: [string, string]
}) {
  const id = useId()
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between">
        <FieldLabel htmlFor={id}>{label}</FieldLabel>
        <span className="text-title-sm" aria-hidden="true">
          {format(value)}
        </span>
      </div>
      <input
        id={id}
        type="range"
        className="cc-range"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-valuetext={format(value)}
        style={{ '--fill': pct(value, min, max) } as React.CSSProperties}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      {hint && (
        <div className="flex justify-between text-caption text-muted" aria-hidden="true">
          <span>{hint[0]}</span>
          <span>{hint[1]}</span>
        </div>
      )}
    </div>
  )
}

export function RangeSlider({
  label,
  min,
  max,
  value,
  onChange,
  format = String,
}: {
  label: string
  min: number
  max: number
  value: [number, number]
  onChange: (v: [number, number]) => void
  format?: (v: number) => string
}) {
  const id = useId()
  const [lo, hi] = value
  return (
    <div role="group" aria-labelledby={id} className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between">
        <FieldLabel id={id}>{label}</FieldLabel>
        <span className="text-title-sm" aria-hidden="true">
          {format(lo)} – {format(hi)}
        </span>
      </div>
      <div className="relative h-6">
        <div className="absolute inset-x-0 top-[11px] h-0.5 bg-hairline-strong" />
        <div className="absolute top-[10px] h-1 bg-primary" style={{ left: pct(lo, min, max), right: `calc(100% - ${pct(hi, min, max)})` }} />
        <input
          type="range"
          aria-label={`${label}: from`}
          className="cc-range cc-range-dual"
          min={min}
          max={max}
          value={lo}
          onChange={(e) => onChange([Math.min(Number(e.target.value), hi), hi])}
        />
        <input
          type="range"
          aria-label={`${label}: to`}
          className="cc-range cc-range-dual"
          min={min}
          max={max}
          value={hi}
          onChange={(e) => onChange([lo, Math.max(Number(e.target.value), lo)])}
        />
      </div>
    </div>
  )
}

