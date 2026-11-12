import { useEffect, useRef, useState } from 'react'
import { Silhouette } from '../../components/CarImage'
import { Button, TextButton } from '../../components/controls'
import { cx } from '../../components/cx'
import { Logo } from '../../components/Logo'

const STEPS = [
  ['Find', 'Cars that fit your budget and what matters to you.'],
  ['Research', "Known problems at the mileage you're looking at — and better alternatives."],
  ['Before you buy', 'What to check and ask the seller, and whether the price is fair.'],
]

const LAST = 1

/** First-launch intro, 2 slides (spec 12 §2.2). */
export function Intro({ onDone }: { onDone: () => void }) {
  const [i, setI] = useState(0)
  const heading = useRef<HTMLHeadingElement>(null)
  useEffect(() => {
    heading.current?.focus()
  }, [i])

  return (
    <div className="mx-auto flex min-h-dvh max-w-[480px] flex-col bg-surface-dark text-on-dark" data-testid="intro">
      <div className="flex items-center justify-between px-6 pt-5">
        <Logo onDark />
        {i < LAST && (
          <TextButton onDark className="text-on-dark-muted" onClick={onDone}>
            Skip
          </TextButton>
        )}
      </div>
      <div className="grid grid-cols-2 gap-1.5 px-6 pt-6" aria-hidden="true">
        {[0, 1].map((k) => (
          <div key={k} className={cx('h-[3px]', k <= i ? 'bg-primary' : 'bg-dark-line')} />
        ))}
      </div>

      <div className="flex flex-1 flex-col gap-5 px-6 pt-12" aria-live="polite">
        <p className="sr-only">Slide {i + 1} of 2</p>
        {i === 0 && (
          <>
            <span className="text-caption text-on-dark-muted">Used cars, made simple</span>
            <h1 ref={heading} tabIndex={-1} className="text-display-intro outline-none">
              Buy a used car without the stress.
            </h1>
            <p className="text-body-md text-on-dark-soft">
              CarCompass tells you which used models and engines to buy, which to avoid, and what to check — even if you
              know nothing about cars.
            </p>
            <ol className="border-b border-dark-line">
              {STEPS.map(([title, text], k) => (
                <li key={title} className="flex gap-4 border-t border-dark-line py-3.5">
                  <span className="w-7 text-label text-accent-on-dark">0{k + 1}</span>
                  <div className="flex flex-col gap-1">
                    <span className="text-title-md">{title}</span>
                    <span className="text-body-sm text-on-dark-soft">{text}</span>
                  </div>
                </li>
              ))}
            </ol>
          </>
        )}
        {i === LAST && (
          <>
            <h1 ref={heading} tabIndex={-1} className="text-display-intro outline-none">
              We advise.
              <br />
              We don't guarantee.
            </h1>
            <p className="text-body-md text-on-dark-soft">
              Our advice comes from owner reports, breakdown statistics and Lithuanian listings. Every car is different —
              always get an independent inspection before you pay.
            </p>
          </>
        )}
      </div>

      {i === LAST && (
      <div className="relative px-6" aria-hidden="true">
        <div className="absolute inset-x-0 bottom-6 h-px bg-dark-line" />
        <Silhouette body="sedan" dark className="relative mx-auto w-[280px]" />
      </div>
      )}

      <div className="px-6 pt-2 pb-8">
        {i < LAST ? (
          <Button className="w-full" onClick={() => setI(i + 1)}>
            Next
          </Button>
        ) : (
          <Button className="w-full" onClick={onDone} data-testid="intro-start">
            Start
          </Button>
        )}
      </div>
    </div>
  )
}
