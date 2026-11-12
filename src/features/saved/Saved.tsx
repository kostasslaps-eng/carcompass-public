import { ChevronRight, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { CarImage } from '../../components/CarImage'
import { ButtonLink, TextLinkCTA } from '../../components/controls'
import { VerdictTag } from '../../components/status'
import { carName, getCar } from '../../data'
import { km } from '../../domain/format'
import { useSaved } from '../../hooks/useSaved'
import { researchUrl } from '../../routes'
import { SavedTabs } from './SavedTabs'

export function Saved() {
  const { saved, remove } = useSaved()
  return (
    <>
      <SavedTabs />
      <section className="flex flex-col px-6 pt-2 pb-6" data-testid="saved-list">
        {saved.length === 0 ? (
          <div className="flex flex-col gap-4 py-8">
            <p className="text-body-md text-body">
              Nothing saved yet. Tap the heart on a car to keep it here and compare it with others.
            </p>
            <ButtonLink to="/find">Find a car</ButtonLink>
          </div>
        ) : (
          <>
            <ul>
              {saved.map((s) => {
                const car = getCar(s.carId)!
                return (
                  <li key={s.carId} className="flex items-center gap-2 border-b border-hairline">
                    <Link to={researchUrl(car.id, s.year, s.km)} className="flex min-w-0 flex-1 items-center gap-3.5 py-4">
                      <CarImage car={car} className="h-16 w-24 flex-none" />
                      <span className="flex min-w-0 flex-1 flex-col gap-1">
                        <VerdictTag verdict={car.ratings.verdict} />
                        <span className="text-title-sm">{carName(car)}</span>
                        <span className="text-body-sm text-body">
                          You looked at: {s.year} · {km(s.km)}
                        </span>
                      </span>
                      <ChevronRight size={18} className="flex-none text-muted" aria-hidden="true" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => remove(car.id)}
                      aria-label={`Remove ${carName(car)}`}
                      className="flex h-11 w-11 flex-none items-center justify-center text-muted"
                    >
                      <X size={20} aria-hidden="true" />
                    </button>
                  </li>
                )
              })}
            </ul>
            <div className="mt-2 flex flex-wrap gap-x-6">
              {saved.length >= 2 && <TextLinkCTA to="/compare">Compare these</TextLinkCTA>}
              <TextLinkCTA to="/find">Find more cars</TextLinkCTA>
            </div>
          </>
        )}
      </section>
    </>
  )
}
