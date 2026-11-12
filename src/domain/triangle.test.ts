import { describe, expect, test } from 'vitest'
import { ANCHORS, BALANCED, moveByKey, nearestAnchor, positionOf, VERTEX, weightsAt, weightsText, type Weights } from './triangle'

const sum = (w: Weights) => w[0] + w[1] + w[2]

describe('triangle (§5.4)', () => {
  test('corners give pure weights', () => {
    expect(weightsAt(...VERTEX.budget)).toEqual([1, 0, 0])
    expect(weightsAt(...VERTEX.reliable).map((x) => Math.round(x * 1e9) / 1e9)).toEqual([0, 1, 0])
    expect(weightsAt(...VERTEX.performance).map((x) => Math.round(x * 1e9) / 1e9)).toEqual([0, 0, 1])
  })

  test('points outside are clamped: weights stay ≥ 0 and sum to 1', () => {
    for (const [x, y] of [[-100, -100], [400, 400], [150, 0], [0, 290]]) {
      const w = weightsAt(x, y)
      expect(w.every((v) => v >= 0)).toBe(true)
      expect(sum(w)).toBeCloseTo(1)
    }
  })

  test('position and weights round-trip', () => {
    const w: Weights = [0.2, 0.5, 0.3]
    weightsAt(...positionOf(w)).forEach((v, i) => expect(v).toBeCloseTo(w[i]))
  })

  test('all 7 labels are reachable', () => {
    expect(ANCHORS.map((a) => nearestAnchor(a.weights).label)).toEqual([
      'Max budget',
      'Max reliability',
      'Max performance',
      'Reliable + Budget',
      'Reliable + Performance',
      'Budget + Performance',
      'Balanced',
    ])
    expect(nearestAnchor([0.45, 0.45, 0.1]).label).toBe('Reliable + Budget')
  })

  test('keyboard: arrows move 5% of the side; Home returns to centre; other keys ignored', () => {
    const moved = moveByKey(BALANCED, 'ArrowRight')!
    const [x0] = positionOf(BALANCED)
    const [x1] = positionOf(moved)
    expect(x1 - x0).toBeCloseTo(12.8)
    expect(moveByKey(moved, 'Home')).toEqual(BALANCED)
    expect(moveByKey(BALANCED, 'a')).toBeNull()
  })

  test('weights text', () => {
    expect(weightsText(BALANCED)).toBe('Budget 33% · Reliable 33% · Performance 33%')
  })
})
