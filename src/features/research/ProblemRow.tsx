import { ChevronDown } from 'lucide-react'
import { useId, useState } from 'react'
import { GlossaryText } from '../../components/GlossaryText'
import { Tag } from '../../components/status'
import type { Status } from '../../components/status-styles'
import type { Problem } from '../../data/schema'
import { mileageWindowText, repairCostText } from '../../domain/problems'
import { splitFirstSentence } from './text'

const SEVERITY: Record<Problem['severity'], { status: Status; word: string }> = {
  minor: { status: 'neutral', word: 'Minor' },
  costly: { status: 'warn', word: 'Costly' },
  major: { status: 'bad', word: 'Major' },
}
const FREQUENCY: Record<Problem['frequency'], string> = { rare: 'Rare', common: 'Common', 'very-common': 'Very common' }

/**
 * One problem as a collapsible row (spec 12 §4.4). A separate toggle button rather than <details>/<summary>:
 * the title's glossary terms are buttons, and buttons inside a <summary> are nested controls (axe: nested-interactive).
 */
export function ProblemRow({ p, open: startOpen = false }: { p: Problem; open?: boolean }) {
  const [open, setOpen] = useState(startOpen)
  const detailsId = useId()
  const sev = SEVERITY[p.severity]
  const [first, rest] = splitFirstSentence(p.explanation)
  return (
    <article className="flex flex-col gap-2 border border-hairline p-4" data-testid="problem-row" data-problem-id={p.id}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <GlossaryText as="h3" text={p.name} className="text-title-sm" />
        </div>
        <span className="text-title-sm whitespace-nowrap">{repairCostText(p)}</span>
      </div>
      <div className="flex items-center justify-between gap-2">
        <Tag status={sev.status}>{sev.word}</Tag>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={detailsId}
          onClick={() => setOpen(!open)}
          data-testid="problem-toggle"
          className="flex min-h-11 items-center gap-1 text-label uppercase text-ink"
        >
          {open ? 'Less' : 'Details'}
          <span className="sr-only"> about {p.name}</span>
          <ChevronDown size={18} aria-hidden="true" className={open ? 'rotate-180' : ''} />
        </button>
      </div>
      <p className="text-body-sm text-body">{first}</p>
      <div id={detailsId} hidden={!open} className="flex flex-col gap-2 text-body-sm text-body">
        {rest && <GlossaryText text={rest} />}
        <p>
          <strong className="font-bold text-ink">How common:</strong> {FREQUENCY[p.frequency]} · {mileageWindowText(p)}
        </p>
        {p.appliesTo && (
          <span className="self-start border border-hairline-strong px-2 py-1 text-[12px] leading-[1.3] tracking-[0.3px]">{p.appliesTo}</span>
        )}
        <p>
          <strong className="font-bold text-ink">Signs:</strong> {p.symptoms.join('; ')}
        </p>
        <p>
          <strong className="font-bold text-ink">How to check:</strong> {p.howToCheck}
        </p>
      </div>
    </article>
  )
}
