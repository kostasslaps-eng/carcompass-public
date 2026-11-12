import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { HeroBand } from '../../components/blocks'
import { TextLinkCTA } from '../../components/controls'
import { researchUrl } from '../../routes'

const DOORS = [
  { id: 'door-find', to: '/find', title: "I don't know what to buy", sub: 'Find cars that fit your budget and needs' },
  { id: 'door-research', to: '/research', title: 'I have a car in mind', sub: 'See its known problems at your mileage' },
  { id: 'door-buy', to: '/buy', title: "I'm going to see a car", sub: 'Check the price and what to inspect' },
]

/** Home (spec 12 §2.1): what CarCompass is, and three ways in. */
export function Home() {
  return (
    <div data-testid="home">
      <HeroBand eyebrow="Used cars in Lithuania" title="We don't sell cars.">
        We tell you which models and engines to buy, which to avoid, and what to check before you pay.
      </HeroBand>

      <nav aria-label="Where do you want to start?" className="flex flex-col gap-3 px-6 pt-6">
        {DOORS.map((d) => (
          <Link key={d.id} to={d.to} data-testid={d.id} className="flex items-center gap-3 border border-hairline p-4 no-underline">
            <span className="flex flex-1 flex-col gap-0.5">
              <span className="text-title-sm text-ink">{d.title}</span>
              <span className="text-body-sm text-muted">{d.sub}</span>
            </span>
            <ChevronRight size={20} className="flex-none text-ink" aria-hidden="true" />
          </Link>
        ))}
      </nav>

      <div className="flex flex-col gap-1 px-6 pt-5">
        <TextLinkCTA to={researchUrl('bmw-3-e90-320d-n47', 2009, 180000)} data-testid="home-example" className="self-start">
          See an example
        </TextLinkCTA>
        <p className="text-body-sm text-body">A popular diesel that looks like a bargain — and why we say avoid.</p>
      </div>

      <p className="px-6 pt-8 pb-2 text-caption text-muted">We advise, we don't guarantee. Always get an independent inspection.</p>
    </div>
  )
}
