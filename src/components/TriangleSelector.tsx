import { useRef, useState, type KeyboardEvent, type PointerEvent } from 'react'
import { ANCHORS, moveByKey, nearestAnchor, positionOf, VERTEX, weightsAt, weightsText, type Weights } from '../domain/triangle'

/**
 * The signature priorities triangle (DESIGN §3). Drag (mouse/touch/pen) or use arrow keys; Home = centre.
 * `onChange` fires while dragging (live label + results); `onCommit` when the gesture or key press ends.
 */
export function TriangleSelector({
  value,
  onChange,
  onCommit,
}: {
  value: Weights
  onChange: (w: Weights) => void
  onCommit: (w: Weights) => void
}) {
  const [dragging, setDragging] = useState(false)
  const last = useRef(value)
  const label = nearestAnchor(value).label
  const [hx, hy] = positionOf(value)

  const fromEvent = (e: PointerEvent<SVGSVGElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    const w = weightsAt(((e.clientX - r.left) * 300) / r.width, ((e.clientY - r.top) * 290) / r.height)
    last.current = w
    onChange(w)
  }

  const onKeyDown = (e: KeyboardEvent<SVGSVGElement>) => {
    const w = moveByKey(value, e.key)
    if (!w) return
    e.preventDefault()
    onChange(w)
    onCommit(w)
  }

  const [rx, ry] = VERTEX.reliable
  const [bx, by] = VERTEX.budget
  const [px, py] = VERTEX.performance

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-label uppercase text-muted" id="priorities-label">
        What matters most
      </span>
      <span className="text-display-sm" aria-live="polite" data-testid="triangle-label">
        {label}
      </span>
      <span className="text-body-sm text-body">You can't have all three — pick where you stand.</span>
      <span className="text-body-sm text-body">
        Budget = what the car costs you per year: fuel, servicing, likely repairs and the value it loses.
      </span>
      <svg
        viewBox="0 0 300 290"
        className="mt-2 w-full max-w-[342px] cursor-pointer touch-none select-none outline-offset-4"
        tabIndex={0}
        role="slider"
        aria-labelledby="priorities-label"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(value[1] * 100)}
        aria-valuetext={`${label}. ${weightsText(value)}. Use arrow keys to move, Home for balanced.`}
        data-testid="triangle"
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture?.(e.pointerId)
          setDragging(true)
          fromEvent(e)
        }}
        onPointerMove={(e) => dragging && fromEvent(e)}
        onPointerUp={() => {
          setDragging(false)
          onCommit(last.current)
        }}
        onPointerCancel={() => setDragging(false)}
        onKeyDown={onKeyDown}
      >
        <polygon points={`${rx},${ry} ${bx},${by} ${px},${py}`} className="fill-triangle-fill stroke-ink" strokeWidth={1.5} />
        {/* medians */}
        <line x1={rx} y1={ry} x2={(bx + px) / 2} y2={by} className="stroke-hairline" />
        <line x1={bx} y1={by} x2={(rx + px) / 2} y2={(ry + py) / 2} className="stroke-hairline" />
        <line x1={px} y1={py} x2={(rx + bx) / 2} y2={(ry + by) / 2} className="stroke-hairline" />
        {ANCHORS.map((a) => {
          const [x, y] = positionOf(a.weights)
          return <rect key={a.label} x={x - 3} y={y - 3} width={6} height={6} className={a.label === label ? 'fill-primary' : 'fill-hairline-strong'} />
        })}
        <g className="fill-ink text-[12px] font-bold tracking-[1.5px]" aria-hidden="true">
          <text x={rx} y={18} textAnchor="middle">RELIABLE</text>
          <text x={bx} y={276} textAnchor="start">BUDGET</text>
          <text x={px} y={276} textAnchor="end">PERFORMANCE</text>
        </g>
        <circle cx={hx} cy={hy} r={22} className="fill-primary" fillOpacity={0.12} />
        <circle cx={hx} cy={hy} r={12} className="fill-primary stroke-canvas" strokeWidth={3} />
      </svg>
    </div>
  )
}
