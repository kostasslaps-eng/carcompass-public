import { Button } from '../../components/controls'
import { HeroBand } from '../../components/blocks'
import { carName, cars } from '../../data'
import { ANNUAL_KM, DATA_YEAR, ELECTRICITY_PRICE_EUR, FUEL_PRICE_EUR } from '../../domain/constants'
import { MILEAGE_CAP, MILEAGE_RATE } from '../../domain/price'
import { DEPRECIATION_RATE } from '../../domain/ranking'
import { EDITION } from '../../edition'
import { useLocalStorage } from '../../hooks/useLocalStorage'

const eur2 = (n: number) => `€${n.toFixed(2)}`

/** PRODUCT_SPEC §4.6 */
export function About() {
  const [, setIntroSeen] = useLocalStorage('cc.introSeen', false)
  return (
    <>
      <HeroBand eyebrow="About" title="CarCompass">
        A demo web app from a university project. It helps people with little car knowledge buy a used car in
        Lithuania: find a suitable car, research it at the mileage you're looking at, and check it before you pay.
      </HeroBand>

      <div className="flex flex-col gap-8 px-6 py-8">
        <section className="flex flex-col gap-2" data-testid="about-what">
          <h2 className="text-title-lg">What CarCompass is — and isn't</h2>
          <ul className="flex list-disc flex-col gap-1.5 pl-5 text-body-sm text-body">
            <li>It is a guide to which used models and engines to buy, at which mileage, and what to check.</li>
            <li>It isn't a marketplace. There are no listings, no sellers and no valuations.</li>
            <li>Prices are typical asking prices from Lithuanian ads, not what a car is worth.</li>
          </ul>
        </section>

        {EDITION === 'public' && (
          <section className="flex flex-col gap-2 border border-hairline p-4">
            <h2 className="text-title-sm">Public demo edition</h2>
            <p className="text-body-sm text-body">
              The AI assistant is switched off in this public version so that no API keys are exposed. Everything else
              works the same as the full version.
            </p>
          </section>
        )}

        <section className="flex flex-col gap-2">
          <h2 className="text-title-lg">We advise, we don't guarantee</h2>
          <p className="text-body-sm text-body">
            CarCompass gives general advice based on owner reports, breakdown statistics and listings. Every used car is
            different. Always get an independent pre-purchase inspection before you pay, and never treat a price here as
            a valuation.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-title-lg">About the data</h2>
          <ul className="flex list-disc flex-col gap-1.5 pl-5 text-body-sm text-body">
            <li>{cars.length} curated cars popular on the Lithuanian used market. No live listings.</li>
            <li>
              Prices are typical asking prices from Lithuanian listings (autoplius.lt; mobile.de where there were too few
              ads), November {DATA_YEAR}. Each car page shows its source.
            </li>
            <li>Known problems, costs and ratings come from 2–4 sources per car, listed on each car page.</li>
            <li>
              Yearly fuel costs assume {ANNUAL_KM.toLocaleString('en-US')} km a year at petrol {eur2(FUEL_PRICE_EUR.petrol)}/l,
              diesel {eur2(FUEL_PRICE_EUR.diesel)}/l and electricity {eur2(ELECTRICITY_PRICE_EUR)}/kWh (prices in
              Lithuania, Nov {DATA_YEAR}; electricity is an estimate).
            </li>
          </ul>
        </section>

        <section className="flex flex-col gap-2" data-testid="how-we-estimate">
          <h2 className="text-title-lg">How we estimate</h2>
          <ul className="flex list-disc flex-col gap-1.5 pl-5 text-body-sm text-body">
            <li>
              Typical asking price: each car's listing prices are compared by year, then adjusted for mileage —{' '}
              {MILEAGE_RATE * 100}% per 10,000 km above or below the usual mileage for that year (at most ±
              {MILEAGE_CAP * 100}%). More kilometres never make a car more expensive.
            </li>
            <li>
              "Budget" on the Find triangle = yearly cost to own: fuel, servicing, likely repairs, and the value a used
              car loses (about {DEPRECIATION_RATE * 100}% of its price a year).
            </li>
            <li>These are estimates for comparing cars, not valuations.</li>
          </ul>
        </section>

        <section className="flex flex-col gap-3">
          <Button variant="secondary" onClick={() => setIntroSeen(false)}>
            Show intro again
          </Button>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-title-lg">Photo credits</h2>
          <p className="text-caption text-muted">All photos from Wikimedia Commons, used under their licences.</p>
          <ul className="flex flex-col">
            {cars.map((c) =>
              c.photos.map((p) => (
                <li key={c.id + p.role} className="border-b border-hairline py-2.5 text-caption text-body">
                  <span className="font-bold">{carName(c)}</span>
                  <br />
                  <a href={p.pageUrl} target="_blank" rel="noreferrer" className="underline">
                    Photo
                  </a>{' '}
                  by {p.author}, {p.license}
                </li>
              )),
            )}
          </ul>
        </section>
      </div>
    </>
  )
}
