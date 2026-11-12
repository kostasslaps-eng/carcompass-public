import { cars } from '../data'
import { ButtonLink } from './controls'

/** Friendly state for an unknown car id in the URL. */
export function UnknownCar({ id }: { id?: string }) {
  return (
    <section className="flex flex-col gap-4 px-6 py-12" data-testid="unknown-car">
      <h1 className="text-display-sm">Not in our demo database</h1>
      <p className="text-body-md text-body">
        {id ? (
          <>
            We don't have a car called <strong className="font-bold">“{id}”</strong>.{' '}
          </>
        ) : null}
        CarCompass covers {cars.length} popular used cars. Pick one from the list, or let us find the right ones for you.
      </p>
      <ButtonLink to="/find">Find a car</ButtonLink>
    </section>
  )
}
