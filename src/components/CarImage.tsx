import { useState } from 'react'
import { photoManifest } from '../data'
import type { BodyType, Car } from '../data/schema'
import { cx } from './cx'

// DESIGN §4 fallback silhouettes, viewBox 0 0 240 96.
const SIL = {
  sedan: {
    body: 'M14 66 C14 58 20 54 34 52 L68 48 C82 36 98 28 118 27 L150 27 C168 28 182 38 196 48 L218 52 C224 54 226 58 226 64 L226 70 L14 70 Z',
    window: 'M78 48 C90 38 102 33 118 32 L148 32 C162 33 172 40 182 48 Z',
    wheels: [62, 184],
    y: 70,
    r: 13,
  },
  hatchback: {
    body: 'M16 66 C16 58 22 54 36 52 L70 48 C84 34 100 26 122 25 L170 25 C186 26 194 36 200 48 L214 52 C220 55 222 60 222 66 L222 70 L16 70 Z',
    window: 'M80 48 C92 36 104 31 122 30 L168 30 C180 31 186 38 190 48 Z',
    wheels: [64, 182],
    y: 70,
    r: 13,
  },
  wagon: {
    body: 'M14 66 C14 58 20 54 34 52 L66 48 C80 34 96 27 116 26 L196 26 C206 27 212 36 216 48 L222 52 C226 55 226 60 226 64 L226 70 L14 70 Z',
    window: 'M76 48 C88 36 100 31 116 31 L194 31 C202 32 206 39 208 48 Z',
    wheels: [62, 186],
    y: 70,
    r: 13,
  },
  suv: {
    body: 'M16 68 C16 56 22 50 34 48 L64 44 C76 28 92 18 112 17 L184 17 C198 18 208 30 214 44 L220 48 C226 51 226 58 226 64 L226 72 L16 72 Z',
    window: 'M74 44 C86 30 98 23 112 22 L182 22 C194 23 200 33 204 44 Z',
    wheels: [64, 182],
    y: 72,
    r: 15,
  },
}

const silFor = (b: BodyType) => (b === 'hatchback' || b === 'wagon' || b === 'suv' ? SIL[b] : SIL.sedan)

export function Silhouette({ body, dark, className }: { body: BodyType; dark?: boolean; className?: string }) {
  const s = silFor(body)
  return (
    <svg viewBox="0 0 240 96" className={className} aria-hidden="true">
      <path d={s.body} className={dark ? 'fill-sil-body-dark' : 'fill-sil-body'} />
      <path d={s.window} className={dark ? 'fill-sil-window-dark' : 'fill-sil-window'} />
      {s.wheels.map((x) => (
        <g key={x}>
          <circle cx={x} cy={s.y} r={s.r} className={dark ? 'fill-sil-tyre-dark' : 'fill-sil-tyre'} />
          <circle cx={x} cy={s.y} r={5} className="fill-sil-hub" />
        </g>
      ))}
    </svg>
  )
}

/** Car photo on a soft plate (contain), or the body-type silhouette if there is no photo or it fails to load. */
export function CarImage({ car, className, eager }: { car: Car; className?: string; eager?: boolean }) {
  const [failed, setFailed] = useState(false)
  const has = photoManifest[car.id]?.main && !failed
  const src = (w: number) => `${import.meta.env.BASE_URL}photos/${car.id}-main-${w}.webp`
  const dims = photoManifest[car.id]?.main
  return (
    <div className={cx('flex items-center justify-center overflow-hidden bg-surface-soft', className)}>
      {has ? (
        <img
          src={src(600)}
          srcSet={`${src(600)} 600w, ${src(1200)} 1200w`}
          sizes="(min-width: 480px) 480px, 100vw"
          width={dims!.width}
          height={dims!.height}
          alt={`${car.make} ${car.model} ${car.generation}`}
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          onError={() => setFailed(true)}
          className="h-full w-full object-contain"
        />
      ) : (
        <Silhouette body={car.bodyTypes[0]} className="w-[220px] max-w-[80%]" />
      )}
    </div>
  )
}
