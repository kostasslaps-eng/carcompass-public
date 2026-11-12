import { useId, useState, type ReactNode } from 'react'
import { glossary } from '../data'
import { buildGlossaryMatcher, splitGlossary } from '../data/glossary'
import type { GlossaryEntry } from '../data/schema'

const matcher = buildGlossaryMatcher(glossary)

type Tag = 'p' | 'h3' | 'span' | 'li'

/**
 * Text with jargon terms as dotted-underline buttons; tapping one shows a plain explanation in a dark block below.
 * Tap again or Esc closes it.
 */
export function GlossaryText({
  text,
  as: Tag = 'p',
  className,
  before,
}: {
  text: string
  as?: Tag
  className?: string
  before?: ReactNode
}) {
  const [open, setOpen] = useState<GlossaryEntry | null>(null)
  const id = useId()
  return (
    <>
      <Tag className={className}>
        {before}
        {splitGlossary(text, matcher).map((p, i) =>
          typeof p === 'string' ? (
            p
          ) : (
            <button
              key={i}
              type="button"
              aria-expanded={open === p.entry}
              aria-controls={id}
              onClick={(e) => {
                // Inside a <summary>, a term tap must not open/close the row (spec 12 §4.4).
                e.preventDefault()
                e.stopPropagation()
                setOpen(open === p.entry ? null : p.entry)
              }}
              onKeyDown={(e) => e.key === 'Escape' && setOpen(null)}
              className="cursor-help underline decoration-primary decoration-dotted decoration-2 underline-offset-4 [font:inherit]"
            >
              {p.text}
            </button>
          ),
        )}
      </Tag>
      <div id={id} role="note" hidden={!open} className="bg-surface-dark px-3.5 py-3 text-body-sm text-on-dark">
        {open && (
          <>
            <strong className="font-bold">{open.term}:</strong> {open.definition}
          </>
        )}
      </div>
    </>
  )
}
