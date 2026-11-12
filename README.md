# CarCompass

**A calm guide for beginners buying a used car in Lithuania.** CarCompass walks you through three steps:

1. **Find** — rank 50 popular used cars by your budget, years, mileage, body, fuel, gearbox, driving and a
   Budget / Reliable / Performance priorities triangle.
2. **Research** — the known problems at the mileage you're looking at, typical asking prices, running costs and
   better alternatives.
3. **Before you buy** — check the seller's asking price and work through a viewing checklist with red flags.

## For judges — try it in 2 minutes

CarCompass is a **guide, not a marketplace**: it tells beginners which used models and engines to buy in Lithuania,
which to avoid, and what to check. No listings, no sellers.

1. On the home screen, tap **See an example**: a BMW 320d at 180,000 km, and why we say avoid.
2. Scroll to **Better alternatives**: the same car with a safer engine, or the safest choice and its trade-off.
3. Tap **Going to see one →** and try asking prices of **3000** and **5000**: one is suspiciously cheap, one is fair. Below it is the viewing checklist for this exact car.

The AI assistant is switched off in this public demo for security.

**Live demo:** https://YOUR-USERNAME.github.io/YOUR-REPO-NAME/ *(replace after publishing)*

> This is a demo from a university project. We advise, we don't guarantee: always get an independent
> pre-purchase inspection before you pay.

## Public demo edition

The AI assistant is part of the full version and is **switched off in this public demo**, so that no API keys are
exposed. Its button stays visible and explains this. Everything else works the same. This repository contains no AI
or API code and makes no network requests apart from loading its own files (fonts are self-hosted).

## Run it locally

You need [Node.js](https://nodejs.org) 20 or newer.

```bash
npm install
npm run dev
```

Then open the address it prints (usually http://localhost:5173).

| Command | What it does |
|---|---|
| `npm run dev` | Start the app locally |
| `npm run build` / `npm run preview` | Production build / preview it |
| `npm test` | Unit and data tests (Vitest) |
| `npm run test:e2e` | End-to-end tests (Playwright; run `npx playwright install chromium` once first) |
| `npm run typecheck` · `npm run lint` | TypeScript · lint |

## Data

- `data/cars.json` — 50 curated cars (one model generation + engine each), with known problems, costs, ratings,
  checklists and 2–4 sources per car (shown on each car page).
- Prices are typical **asking** prices from Lithuanian listings (autoplius.lt; mobile.de where there were too few
  ads), November 2026. They are estimates, never valuations.
- Yearly fuel costs assume 15,000 km a year at petrol €1.90/l, diesel €2.30/l and electricity €0.25/kWh.
- `data/OPEN_QUESTIONS.md` lists values that rest on thin data.

## Photo credits

All car photos come from Wikimedia Commons and are used under their own licences (mostly Creative Commons).
Author and licence for every photo are in [`data/PHOTO_CREDITS.md`](data/PHOTO_CREDITS.md), on each car page and on
the About page.

## Licence

Code: [MIT](LICENSE) © CarCompass authors. The car data and photos are not covered by the MIT licence: photos keep
their Wikimedia Commons licences (see above), and the data summarises the sources listed for each car.
