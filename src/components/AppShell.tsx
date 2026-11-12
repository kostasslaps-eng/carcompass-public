import { ChevronLeft, ClipboardCheck, Compass, Heart, Info, Lock, Search, type LucideIcon } from 'lucide-react'
import { useEffect } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { getCar } from '../data'
import { EDITION } from '../edition'
import { AskButton } from '../features/chat/ChatLauncher'
import { useSaved } from '../hooks/useSaved'
import { buyUrl, carParams, journey, researchUrl } from '../routes'
import { cx } from './cx'
import { Logo } from './Logo'

/** Where the user is now, falling back to where they last were (so tabs and back links keep their place). */
function useJourney() {
  const { pathname, search } = useLocation()
  const [, section = 'find', id] = pathname.split('/')
  const car = section === 'research' || section === 'buy' ? getCar(id) : undefined
  const here = car ? { id: car.id, ...carParams(car, new URLSearchParams(search)) } : null
  const findSearch = section === 'find' ? search : journey.findSearch
  useEffect(() => {
    journey.findSearch = findSearch
    if (here) journey.car = here
  })
  return { section, car, j: here ?? journey.car, findSearch }
}

export function AppShell() {
  const { pathname } = useLocation()
  const { section, car, j, findSearch } = useJourney()
  const { saved } = useSaved()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  const hasActionBar = section === 'research' && !!car
  const tabs: { key: string; to: string; label: string; icon: LucideIcon }[] = [
    { key: 'find', to: `/find${findSearch}`, label: 'Find', icon: Compass },
    { key: 'research', to: j ? researchUrl(j.id, j.year, j.km) : '/research', label: 'Research', icon: Search },
    { key: 'buy', to: j ? buyUrl(j.id, j.year, j.km) : '/buy', label: 'Before you buy', icon: ClipboardCheck },
    { key: 'saved', to: '/saved', label: saved.length ? `Saved (${saved.length})` : 'Saved', icon: Heart },
  ]
  const activeTab = section === 'compare' ? 'saved' : section

  return (
    <div
      className={cx(
        'mx-auto flex min-h-dvh flex-col bg-canvas',
        section === 'compare' ? 'max-w-[720px]' : 'max-w-[480px]',
      )}
    >
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-canvas focus:p-3">
        Skip to content
      </a>
      {EDITION === 'public' && (
        <div role="note" className="flex items-center gap-2 bg-surface-dark-elevated px-6 py-2 text-caption text-on-dark" data-testid="public-banner">
          <Lock size={14} aria-hidden="true" />
          <span>
            <strong className="font-bold tracking-[1px]">PUBLIC DEMO</strong> · AI assistant off for security. Everything
            else works.
          </span>
        </div>
      )}

      <header className="sticky top-0 z-20 flex h-14 flex-none items-center justify-between border-b border-hairline bg-canvas pr-3 pl-2">
        {section === 'research' || section === 'buy' ? (
          <>
            <Link
              to={section === 'research' ? `/find${findSearch}` : j ? researchUrl(j.id, j.year, j.km) : '/research'}
              className="flex min-h-11 items-center gap-1 px-2 text-title-sm"
            >
              <ChevronLeft size={22} strokeWidth={1.75} aria-hidden="true" />
              {section === 'research' ? 'Results' : 'Research'}
            </Link>
            <span className="text-label uppercase">Step {section === 'research' ? 2 : 3} of 3</span>
          </>
        ) : (
          <Link to="/" className="px-4" aria-label="CarCompass home">
            <Logo />
          </Link>
        )}
        <div className="flex items-center">
          <AskButton />
          <Link to="/about" aria-label="About CarCompass" className="flex h-11 w-11 items-center justify-center rounded-full text-ink">
            <Info size={22} strokeWidth={1.75} aria-hidden="true" />
          </Link>
        </div>
      </header>

      {/* Clears the fixed tab bar (64 px) + 24 px, plus the Research action bar (72 px) when shown. */}
      <main id="main" tabIndex={-1} className={cx('flex-1 outline-none', hasActionBar ? 'pb-[160px]' : 'pb-[88px]')}>
        <Outlet />
      </main>

      <nav aria-label="Main" className="fixed inset-x-0 bottom-0 z-20 mx-auto flex h-16 max-w-[480px] border-t border-hairline bg-canvas">
        {tabs.map((t) => (
          <Link
            key={t.key}
            to={t.to}
            aria-current={activeTab === t.key ? 'page' : undefined}
            className={cx(
              'flex min-h-14 flex-1 flex-col items-center justify-center gap-1 text-tab',
              activeTab === t.key ? 'text-primary' : 'text-muted',
            )}
          >
            <t.icon size={22} strokeWidth={1.75} aria-hidden="true" />
            {t.label}
          </Link>
        ))}
      </nav>
    </div>
  )
}
