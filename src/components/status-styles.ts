import { CircleCheck, Info, OctagonX, TriangleAlert, type LucideIcon } from 'lucide-react'
import type { Verdict } from '../data/schema'

export type Status = 'good' | 'warn' | 'bad' | 'neutral'

export const STATUS_STYLE: Record<Status, { box: string; icon: LucideIcon }> = {
  good: { box: 'bg-good-bg text-good', icon: CircleCheck },
  warn: { box: 'bg-warn-bg text-warn', icon: TriangleAlert },
  bad: { box: 'bg-bad-bg text-bad', icon: OctagonX },
  neutral: { box: 'bg-neutral-bg text-neutral', icon: Info },
}

export const VERDICT: Record<Verdict, { status: Status; word: string }> = {
  recommended: { status: 'good', word: 'Recommended' },
  caution: { status: 'warn', word: 'Caution' },
  avoid: { status: 'bad', word: 'Avoid' },
}
