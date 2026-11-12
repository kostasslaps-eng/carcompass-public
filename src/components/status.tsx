import type { ReactNode } from 'react'
import type { Verdict } from '../data/schema'
import { STATUS_STYLE, VERDICT, type Status } from './status-styles'
import { cx } from './cx'

/** Small uppercase tag: colour + icon + word (never colour alone). */
export function Tag({ status, children, icon = true }: { status: Status; children: ReactNode; icon?: boolean }) {
  const { box, icon: Icon } = STATUS_STYLE[status]
  return (
    <span className={cx('inline-flex items-center gap-1.5 self-start px-2 py-1 text-tag uppercase', box)}>
      {icon && status !== 'neutral' && <Icon size={14} strokeWidth={2.25} aria-hidden="true" />}
      {children}
    </span>
  )
}

export const VerdictTag = ({ verdict }: { verdict: Verdict }) => (
  <Tag status={VERDICT[verdict].status}>{VERDICT[verdict].word}</Tag>
)

/** Tinted block with a label title and short text, e.g. price check (role="status") or verdict. */
export function StatusBlock({
  status,
  title,
  children,
  live,
  className,
}: {
  status: Status
  title: string
  children: ReactNode
  live?: boolean
  className?: string
}) {
  const { box, icon: Icon } = STATUS_STYLE[status]
  return (
    <div role={live ? 'status' : undefined} className={cx('flex flex-col gap-2 p-4', box, className)}>
      <span className="flex items-center gap-2 text-label uppercase">
        <Icon size={18} strokeWidth={2.25} aria-hidden="true" />
        {title}
      </span>
      <div className="text-body-sm text-body-strong">{children}</div>
    </div>
  )
}
