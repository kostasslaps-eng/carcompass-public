import { Lock, MessageSquare } from 'lucide-react'
import { lazy, Suspense, useCallback, useState } from 'react'
import { Button } from '../../components/controls'
import { cx } from '../../components/cx'
import { Sheet } from '../../components/Sheet'
import { EDITION } from '../../edition'

// Full edition only; in the public build "@assistant" resolves to a stub (see vite.config.ts).
const LiveChat = EDITION === 'full' ? lazy(() => import('@assistant')) : null

/** "ASK" header button (spec 12 §1.2): 32 px tall box inside a ≥ 44 px touch area. */
export function AskButton() {
  const [open, setOpen] = useState(false)
  const close = useCallback(() => setOpen(false), [])
  const live = EDITION === 'full'
  const Icon = live ? MessageSquare : Lock

  return (
    <>
      <button
        type="button"
        data-testid="ask-button"
        aria-label={live ? 'Ask the CarCompass assistant' : 'Ask: AI assistant switched off in this public demo'}
        onClick={() => setOpen(true)}
        className="flex min-h-11 items-center px-1"
      >
        <span
          className={cx(
            'flex h-8 items-center gap-1.5 border px-2.5 text-label uppercase',
            live ? 'border-ink text-ink' : 'border-hairline-strong text-muted',
          )}
        >
          <Icon size={16} strokeWidth={2} aria-hidden="true" />
          Ask
        </span>
      </button>
      {live && LiveChat ? (
        <Suspense fallback={null}>{open && <LiveChat open={open} onClose={close} />}</Suspense>
      ) : (
        <DisabledChatSheet open={open} onClose={close} />
      )}
    </>
  )
}

export function DisabledChatSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Sheet open={open} onClose={onClose} label="AI assistant unavailable">
      <div className="flex flex-col gap-3.5" data-testid="chat-disabled">
        <span className="mt-2 flex items-center gap-2 text-label uppercase text-muted">
          <MessageSquare size={16} aria-hidden="true" /> AI assistant
        </span>
        <h2 className="text-display-sm">Part of the full version</h2>
        <p className="text-body-md text-body">
          The AI assistant is part of the full version. It's switched off in this public demo so that no API keys are
          exposed. Everything else works.
        </p>
        <Button className="mt-1.5 w-full" onClick={onClose}>
          Got it
        </Button>
      </div>
    </Sheet>
  )
}
