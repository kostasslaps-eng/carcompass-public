import { createPortal } from 'react-dom'
import { useEffect, useRef, type ReactNode } from 'react'

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select, [tabindex]:not([tabindex="-1"])'

/** Bottom sheet dialog: scrim, focus trap, Esc closes, focus returns to the opener. */
export function Sheet({ open, onClose, label, children }: { open: boolean; onClose: () => void; label: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const opener = document.activeElement as HTMLElement | null
    const box = ref.current!
    ;(box.querySelector<HTMLElement>('[data-autofocus]') ?? box.querySelector<HTMLElement>(FOCUSABLE) ?? box).focus()

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      } else if (e.key === 'Tab') {
        const items = [...box.querySelectorAll<HTMLElement>(FOCUSABLE)]
        if (!items.length) return e.preventDefault()
        const first = items[0]
        const last = items[items.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    document.addEventListener('keydown', onKey)
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = overflow
      opener?.focus?.()
    }
  }, [open, onClose])

  if (!open) return null
  // Portal to <body>: a sheet opened from the sticky header must not sit under the fixed tab/action bars.
  return createPortal(
    <div className="fixed inset-0 z-40 flex items-end justify-center">
      <div className="absolute inset-0 bg-surface-dark/55" onClick={onClose} aria-hidden="true" />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        tabIndex={-1}
        className="relative flex max-h-[85dvh] w-full max-w-[480px] flex-col rounded-t-xl bg-canvas px-6 pt-2 pb-8 motion-safe:animate-[sheet-in_200ms_ease-out]"
      >
        <div className="mb-3 flex justify-center" aria-hidden="true">
          <div className="h-1 w-10 bg-hairline-strong" />
        </div>
        {children}
      </div>
    </div>,
    document.body,
  )
}
