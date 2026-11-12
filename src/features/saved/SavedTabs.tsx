import { Link, useLocation } from 'react-router-dom'
import { cx } from '../../components/cx'
import { useSaved } from '../../hooks/useSaved'

/** Header + "SAVED (n) / COMPARE" switch shared by both pages. */
export function SavedTabs() {
  const { pathname } = useLocation()
  const { saved } = useSaved()
  const tab = (to: string, label: string) => (
    <Link
      to={to}
      aria-current={pathname === to ? 'page' : undefined}
      className={cx(
        'flex min-h-11 items-center border-b-2 px-0 text-label uppercase',
        pathname === to ? 'border-ink text-ink' : 'border-transparent text-muted',
      )}
    >
      {label}
    </Link>
  )
  return (
    <>
      <section className="flex flex-col gap-1.5 px-6 pt-7">
        <h1 className="text-display-md">{pathname === '/compare' ? 'Compare' : 'Saved'}</h1>
        <p className="text-body-md text-body">Your shortlist, kept on this device.</p>
      </section>
      <nav aria-label="Saved views" className="flex gap-6 border-b border-hairline px-6 pt-2">
        {tab('/saved', `Saved (${saved.length})`)}
        {tab('/compare', 'Compare')}
      </nav>
    </>
  )
}
