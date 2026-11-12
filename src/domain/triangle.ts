// ARCHITECTURE §5.4. Geometry in the SVG's own units (viewBox 0 0 300 290), same as the mockup.

/** [budget, reliable, performance], each ≥ 0, sum 1. */
export type Weights = [number, number, number]

export const VERTEX = { budget: [22, 250], reliable: [150, 34], performance: [278, 250] } as const
const SIDE = VERTEX.performance[0] - VERTEX.budget[0]
export const KEY_STEP = SIDE * 0.05

const t = 1 / 3
export const ANCHORS: { weights: Weights; label: string }[] = [
  { weights: [1, 0, 0], label: 'Max budget' },
  { weights: [0, 1, 0], label: 'Max reliability' },
  { weights: [0, 0, 1], label: 'Max performance' },
  { weights: [0.5, 0.5, 0], label: 'Reliable + Budget' },
  { weights: [0, 0.5, 0.5], label: 'Reliable + Performance' },
  { weights: [0.5, 0, 0.5], label: 'Budget + Performance' },
  { weights: [t, t, t], label: 'Balanced' },
]
export const BALANCED: Weights = [t, t, t]

export function positionOf(w: Weights): [number, number] {
  const [b, r, p] = [VERTEX.budget, VERTEX.reliable, VERTEX.performance]
  return [w[0] * b[0] + w[1] * r[0] + w[2] * p[0], w[0] * b[1] + w[1] * r[1] + w[2] * p[1]]
}

/** Barycentric weights of a point; points outside the triangle are clamped onto it. */
export function weightsAt(x: number, y: number): Weights {
  const [bx, by] = VERTEX.budget
  const [rx, ry] = VERTEX.reliable
  const [px, py] = VERTEX.performance
  const den = (ry - py) * (bx - px) + (px - rx) * (by - py)
  const rawB = ((ry - py) * (x - px) + (px - rx) * (y - py)) / den
  const rawR = ((py - by) * (x - px) + (bx - px) * (y - py)) / den
  const [wb, wr, wp] = [rawB, rawR, 1 - rawB - rawR].map((v) => Math.max(0, v))
  const s = wb + wr + wp || 1
  return [wb / s, wr / s, wp / s]
}

export function nearestAnchor(w: Weights) {
  let best = ANCHORS[0]
  let bestD = Infinity
  for (const a of ANCHORS) {
    const d = (a.weights[0] - w[0]) ** 2 + (a.weights[1] - w[1]) ** 2 + (a.weights[2] - w[2]) ** 2
    if (d < bestD) {
      bestD = d
      best = a
    }
  }
  return best
}

/** Arrow keys move the handle 5% of the side length; Home returns to the centre. Returns null for other keys. */
export function moveByKey(w: Weights, key: string): Weights | null {
  if (key === 'Home') return BALANCED
  const delta: Record<string, [number, number]> = {
    ArrowLeft: [-KEY_STEP, 0],
    ArrowRight: [KEY_STEP, 0],
    ArrowUp: [0, -KEY_STEP],
    ArrowDown: [0, KEY_STEP],
  }
  if (!delta[key]) return null
  const [x, y] = positionOf(w)
  return weightsAt(x + delta[key][0], y + delta[key][1])
}

/** "Budget 33% · Reliable 33% · Performance 33%" */
export const weightsText = (w: Weights) =>
  `Budget ${Math.round(w[0] * 100)}% · Reliable ${Math.round(w[1] * 100)}% · Performance ${Math.round(w[2] * 100)}%`
