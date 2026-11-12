# CarCompass – open questions

Values that rest on thin data, estimates or unconfirmed sources. Fix or confirm these before the demo.

> **Update (9 Nov 2026):** BMW 335i and Mazda 3 now use Lithuanian (autoplius.lt) prices, with approximate years and mileages for each point. Kona Electric keeps German prices because they match the few Lithuanian ads. Item 2 below is resolved.

## Across the whole dataset

1. **Prices are much lower than the Phase 0 guesses.** Real autoplius.lt asking prices put 7 cars under €5k. The budget bands only just meet the minimums: 5 cars at €5–10k and 3 over €20k. Two cars sit on a band edge: CR-V (median €9,950) and Peugeot 308 (€4,800).
2. **Foreign price data.** Mazda 3, BMW 335i and Kona Electric use mobile.de (Germany), because too few Lithuanian ads exist. German 335i prices (€17–19.5k) are far above the 5 LT ads (€8.7–12.5k).
3. **Thin LT samples.** Golf GTI (14 ads), CR-V 2.0 (8), Tesla Model 3 LR (9), Audi A4 (5) and Civic (12) have too few ads for reliable per-year medians.
4. **BMW 335i rating (5, caution).** The 335i has several costly problems. That alone could justify a 4 (avoid). It stays at 5 / caution because owners who can prove the key repairs (fuel pump, injectors, water pump) avoid the worst. It is also the dataset's "fast but risky" example. Decide whether to keep this.
5. **Fuel figures are real-world estimates, not official values.** They come from owner logs, user averages or magazine tests, so the method varies between cars.
6. **Repair costs.** Many ranges are converted from German, UK or US sources to rough Lithuanian independent-garage rates. Spot-check a few with a local garage.
7. **Photos.** The angles for cars 13–20 were not checked by eye. Two photos may not show the exact engine version: the Mazda 3 photo is a diesel, and the RAV4 photo may not be a hybrid.

## Per car

### 1. Volkswagen Passat – `vw-passat-b6-20tdi-bkp` (confidence: medium)

- Head cracks mainly affect the 16-valve BKP; the 8-valve BMP shares the oil pump drive risk. Repair costs (head, engine, DSG unit, injector wiring) are rough Lithuanian estimates from few sources. Prices are low and spread widely; verify.
- Price source: autoplius.lt listings (2.0 diesel 103 kW, no defects), Nov 2026 – yearly medians, 38 ads
- Unknown intervals (null): 'Oil pump drive / balance shaft upgrade (preventive)' interval; 'Electric parking brake motor (one side)' interval

### 2. Škoda Octavia – `skoda-octavia-2-19tdi` (confidence: medium)

- How common BXE bearing failures are differs a lot between sources. Only 22 price samples. Manual gearbox code and repair costs for bearings, ABS unit and DSG are estimates; verify.
- Price source: autoplius.lt listings (1.9 diesel 77 kW, no defects), Nov 2026 – yearly medians, 22 ads
- Unknown intervals (null): 'EGR valve cleaning or replacement' interval

### 3. BMW 3 Series – `bmw-3-e90-320d-n47` (confidence: medium)

- Real-world fuel use (6.0) is a midpoint of a 5.0–6.5 range. Automatic gearbox code not confirmed. Some 2010–2011 cars have 184 hp. Clutch/flywheel cost is an estimate.
- Price source: autoplius.lt listings (BMW 320 diesel 120–135 kW, no defects), Nov 2026 – yearly medians, 120 ads
- Unknown intervals (null): 'Timing chain kit (chain, guides, tensioner)' interval; 'Glow plugs + controller' interval

### 4. Honda Civic – `honda-civic-8-18` (confidence: medium)

- Only 12 LT price samples (one for 2009). Cracked-block reports are mostly from the US R18A1; how much EU cars are affected is unclear. i-SHIFT, engine and bearing repair costs are estimates.
- Price source: autoplius.lt listings (1.8 petrol hatchback, no defects), Nov 2026 – yearly medians, only 12 ads
- Unknown intervals (null): 'Right-hand hydraulic engine mount' interval; 'i-SHIFT clutch actuator repair' interval

### 5. Ford Focus – `ford-focus-3-10ecoboost` (confidence: medium)

- Engine code (M1DA for 125 hp; other codes exist), hatchback boot (316 l) and real-world fuel use (6.5) are not confirmed. Automatic (6F15) appears from about the 2015/2016 model year. Some 2018 ads may be the newer Focus IV, so 2018 was left out of prices.
- Price source: autoplius.lt listings (1.0 petrol, no defects), Nov 2026 – yearly medians, 49 ads
- Unknown intervals (null): 'Degas hose / expansion tank' interval; 'Water pump / thermostat housing' interval

### 6. Peugeot 308 – `peugeot-308-t9-12puretech` (confidence: medium)

- Hatchback boot 470 l is not confirmed (SW wagon: 610 l). Check whether the Stellantis 10-year/175,000 km warranty extension applies in Lithuania and its conditions. Ring repair and strainer costs are estimates.
- Price source: autoplius.lt listings (1.2 petrol, no defects), Nov 2026 – yearly medians, 32 ads
- Unknown intervals (null): 'Oil pump strainer clean (sump off)' interval; 'Turbo overhaul' interval

### 7. Audi A4 – `audi-a4-b8-20tfsi` (confidence: medium)

- Only 5 LT ads – prices are thin; consider checking mobile.de. Real-world fuel use (8.5) is an estimate. Facelift cars up to ~2012/13 can have the same engine. S tronic gearbox code assumed DL501.
- Price source: autoplius.lt listings (2.0 petrol 150–160 kW, no defects), Nov 2026 – only 5 ads; CarChecker gives a German median of ~€7,900 at ~175,000 km
- Unknown intervals (null): 'Timing chain tensioner/chain kit' interval; 'PCV valve' interval

### 8. Toyota Avensis – `toyota-avensis-t27-18` (confidence: high)

- Real-world fuel use (7.0) and costs for Valvematic, EPB, door repair and CVT are estimates. Reports of oil use on early engines are mixed between sources.
- Price source: autoplius.lt listings (1.8 petrol, no defects), Nov 2026 – yearly medians, 30 ads
- Unknown intervals (null): 'Rear suspension arms' interval

### 9. Mazda 3 – `mazda-3-bm-20` (confidence: medium)

- Prices come from Germany (very few Lithuanian ads); Lithuanian cars usually have higher mileage and lower prices. Photo shows the same body with a diesel engine. Real-world fuel use (6.5) is an estimate. A 165 hp version also exists.
- Price source: mobile.de (Germany) listings, Nov 2026 – only 3 matching ads on autoplius.lt (€8,900–10,300); German cars have lower mileage
- Unknown intervals (null): 'Drive belt tensioner' interval; 'Rear coil springs (pair)' interval

### 10. Toyota Auris – `toyota-auris-2-hybrid` (confidence: high)

- torqueNm is the petrol engine only (142 Nm); the electric motor adds more. Real-world fuel use (5.0) is a midpoint of 3.5–7.5 depending on city/motorway. Head gasket repair cost is an estimate.
- Price source: autoplius.lt listings (petrol/electric hybrid, no defects), Nov 2026 – yearly medians, 88 ads
- Unknown intervals (null): '12V auxiliary battery' interval; 'Inverter coolant pump' interval; 'Hybrid battery repair or refurbished pack' interval

### 11. Mercedes-Benz E-Class – `mercedes-e-w212-e220cdi` (confidence: medium)

- Main problem source covers the E250 CDI; it states the E220 shares the OM651 and its issues. Real-world fuel use (6.5) is an estimate. Early cars may be 163 hp. Big price jump at the 2013 facelift.
- Price source: autoplius.lt listings (E220, 2.1 diesel 120–130 kW, no defects), Nov 2026 – yearly medians, 38 ads
- Unknown intervals (null): 'Timing chain tensioner kit (independent garage)' interval; 'Piezo injector (each)' interval; 'DPF professional cleaning' interval

### 12. BMW 3 Series – `bmw-3-e90-335i-n54` (confidence: medium)

- Prices are German (incl. coupes and convertibles) and much higher than the few Lithuanian ads (€8,700–12,500) – re-check before use. Real-world fuel use (11.0) is based on owner reports. Reliability 5 assumes proof of key repairs.
- Price source: mobile.de (Germany) listings incl. coupes, Nov 2026 – 132 ads; only 5 on autoplius.lt, asking €8,700–12,500 at 170,000–220,000 km
- Unknown intervals (null): 'High-pressure fuel pump (fitted)' interval; 'Set of 6 injectors (index 12), fitted' interval

### 13. Volkswagen Golf GTI – `vw-golf-7-gti` (confidence: medium)

- Only 14 matching ads on autoplius.lt, so prices are rough. Fuel use 8.5 l is a real-world average (official: 6.0–6.4). Specs are for the 220 hp car; the 2017+ GTI has 230 hp. Repair costs are converted from foreign sources to Lithuanian independent rates.
- Price source: autoplius.lt asking prices, Nov 2026 – 14 ads (162–169 kW, 2013–2020); thin market, medians of 1–5 ads per year
- Unknown intervals (null): 'Water pump and thermostat housing' interval

### 14. BMW 530d – `bmw-5-f10-530d` (confidence: medium)

- Specs are for the 258 hp car; early cars had 245 hp and the pre-2013 258 hp version had 540 Nm. Fuel use 7.8 l is from an owner log over 160,000 km (official: 5.1–5.9); other owners report 6–8.5 l. Gearbox oil interval is not set by BMW (left null). Typical LT mileage is very high (~290,000 km).
- Price source: autoplius.lt asking prices, Nov 2026 – 80 diesel 530 ads (2010–2017), median per year; 2017 ads left out as some may be the newer G30
- Unknown intervals (null): 'Crankshaft vibration damper' interval; 'Automatic gearbox oil change' interval; 'Front brake discs and pads' interval

### 15. Honda CR-V – `honda-crv-4-20` (confidence: medium)

- Very few 2.0 petrol ads in Lithuania (8), so prices are rough. Specs are for the 2WD manual; AWD automatic is slower (about 12 s). Fuel use 8.8 l is from owner reports (about 30–32 mpg); official is 7.2–7.4 l. Engine code R20A not confirmed for every market.
- Price source: autoplius.lt asking prices, Nov 2026 – only 8 ads with the 2.0 petrol (most petrol CR-Vs there are US 2.4 imports); dealer 2016 cars ask €17,500–17,900
- Unknown intervals (null): 'Wheel bearing (each)' interval; '12 V battery' interval

### 16. Land Rover Discovery Sport – `landrover-discovery-sport-td4` (confidence: medium)

- Boot 981 l is the UK figure for the 5-seat car (seats up, likely measured to the roof). 150 hp version also sold. Fuel use 8.6 l is typical of owner logs (7.6–9.3 l); official is 4.9–6.4 l. Repair costs are from CarChecker (EU) and may be lower in LT.
- Price source: autoplius.lt asking prices, Nov 2026 – 80 ads (2.0 diesel, 2016–2019), median per year; 2019 may include some facelift cars

### 17. Hyundai Kona Electric – `hyundai-kona-electric-64` (confidence: medium)

- Prices are German; Lithuanian ads are very few. Energy use 16.4 kWh/100 km is EV Database real-world figure. Battery warranty terms vary by market – check by VIN. Heating repair range mixes a simple fix and compressor failure.
- Price source: mobile.de (Germany) listings, Nov 2026 – 42 ads (150 kW, 64 kWh); only 3 on autoplius.lt, asking €19,650–23,000
- Null engine fields: code
- Unknown intervals (null): 'Cabin filter and brake fluid service' interval; '12 V battery' interval

### 18. Tesla Model 3 – `tesla-model-3-lr` (confidence: low)

- Few LT ads (9), so prices are rough. Specs are for 2020–21 cars (72 kWh usable); later cars have 75–82 kWh and up to 491 hp. Repair costs are converted from US sources. Boot 561 l is rear only; there is also an 88 l front trunk.
- Price source: autoplius.lt asking prices, Nov 2026 – only 9 Long Range AWD ads (324/366 kW); 1–3 ads per year
- Null engine fields: code
- Unknown intervals (null): 'Front control arms (pair)' interval; '12 V battery' interval; 'Cabin air filter' interval; 'Tyres (set of 4)' interval

### 19. Toyota RAV4 – `toyota-rav4-5-hybrid` (confidence: high)

- Fuel use 5.7 l is a midpoint of a magazine test (5.0) and user average (6.4); official is 4.5 l. Torque 221 Nm is the petrol engine alone. Photo may show a non-hybrid RAV4 (same body). Extended hybrid warranty terms depend on the country – check in LT.
- Price source: autoplius.lt asking prices, Nov 2026 – 100 hybrid ads (155–165 kW, 2019–2024), median per year
- Unknown intervals (null): 'Coolant bypass valve' interval; '12 V battery' interval; 'EGR cooler' interval

### 20. Škoda Kodiaq – `skoda-kodiaq-20tdi` (confidence: medium)

- 5 seats standard, 7 optional. Boot 650 l is the auto-data figure; other sources quote up to 720 l. From 2021 the engine has 360 Nm. Timing belt interval not confirmed (left null). Repair costs partly converted from US sources. Fuel use 6.9 l is a user average (official: 4.9–5.7 l).
- Price source: autoplius.lt asking prices, Nov 2026 – 100 ads (2.0 diesel, 105–112 kW, 2016–2023), median per year
- Unknown intervals (null): 'Timing belt and water pump kit' interval; 'Front brake discs and pads' interval

## v2 data, 12 Nov 2026

Covers the 30 new cars and the patch for the existing 20. No existing rating was changed; suggestions are listed below.

### Coverage check (all 50 cars)

| Target | Result | Status |
|---|---|---|
| Every segment ≥3 cars, ≥1 recommended | city 3 (2 rec), compact 15 (9), family 14 (5), executive 4 (1), sporty 3 (1), suv-small 5 (3), suv-large 6 (3) | met |
| ≥8 cars under €5k | 19 | met |
| ≥12 cars at €5–10k | 15 | met |
| ≥12 cars at €10–20k | **10** by median asking price (24 if any listed price counts) | **short by 2** |
| ≥6 cars over €20k | 6 (Golf R, Tucson Hybrid, Kona Electric, Model 3, Model Y, RAV4) | met, no margin |
| ≥13 families with 2 engines | 13 | met, no margin |
| Avoid ≤ about 40% | 11 of 50 (22%) | met |

Bands use each car's median autoplius.lt asking price. Real LT prices are lower than the planned bands assumed, so most planned "€10–20k" cars landed at €5–10k. **Decision needed:** accept the €10–20k gap, count by price range instead of median, or add two cars (for example Toyota C-HR Hybrid, VW Tiguan II 2.0 TDI or Škoda Octavia III 2.0 TDI).

### Alternative rule exceptions

The rule for a "similar" alternative is: same segment, within about 2 s on 0–100 km/h, clearly more reliable, similar price. These links break it, because no car in the dataset fits better:

1. **Nissan Qashqai 1.5 dCi → Honda CR-V 2.0**: segment suv-small → suv-large.
2. **Audi A6 2.0 TDI → VW Passat B8 2.0 TDI**: executive → family (same 0–100, cheaper, more reliable).
3. **Tesla Model 3 LR → Hyundai Kona Electric**: family → suv-small, and 3.2 s slower. The only more reliable EV in the data.
4. **Tesla Model Y LR → Hyundai Kona Electric**: suv-large → suv-small, and 2.6 s slower.
5. **Mercedes E 220 CDI → BMW 530d**: same segment, but 2.9 s *faster*.
6. **Same-family swaps beyond 2 s** (allowed by the "same family, better engine" clause): Octavia 1.8 TSI → 1.9 TDI (+4.0 s), A4 2.0 TFSI → 2.0 TDI (+2.5 s).
7. **"Safest" picks from another segment**: Toyota Avensis 1.8 for the E-Class and A6, Auris Hybrid for the Qashqai 1.2, RAV4 Hybrid for the Model 3. The rule does not limit safest picks by segment; listed for visibility.

### Reliability consistency check

Ratings were compared across shared engines and families. They are consistent:
- Golf 7 GTI 7 vs Golf 7 R 6 (the R adds Haldex AWD, an early IS38 turbo and tuning risk).
- Mercedes E 220 CDI and C 220 CDI both 6 (same OM651 engine).
- 2.2-litre diesels: BMW 320d N47, Mazda 6 2.2D, Avensis 2.2 D-4D all 4 (avoid).
- Tesla Model 3 and Model Y both 6 (caution); Kona Electric and Leaf both 7.
- Passat B6 2.0 TDI PD 3 (avoid) vs Passat B7/B8 common-rail 7.

Suggested changes to existing data (not made):
1. **BMW 335i (5, caution)**: still the weakest car not rated avoid. The new data has several 4/avoid cars with fewer costly problems (e.g. Octavia 1.8 TSI). Consider 4 / avoid (see existing item 4).
2. **Golf 7 GTI**: shares the EA888 Gen3 water pump and thermostat housing leak listed for the Golf R. Consider adding it as a problem; the rating can stay at 7.
3. **Glossary aliases**: "DMF" is used in 5 new cars; consider adding it as an alias of "dual-mass flywheel". Consider adding "carbon build-up" as an alias of "intake valve".

### Other notes on the new data

- **Prices**: autoplius.lt only, Nov 2026. mobile.de was not used. Thin samples (≤20 ads): Fabia 1.2 HTP, Fiesta 1.25, Yaris 1.33, Octavia 1.8 TSI, C 180 CGI (about 7 ads), Mazda 6 2.5, Golf R (12), Tucson Hybrid (16), Sportage 1.6 GDI (18).
- **Fuel figures**: real-world estimates from Spritmonitor, Autokostencheck, magazine tests or EV Database, so the method varies. The Tucson figure comes from one test drive, and the Sportage figure is an estimate.
- **Mazda 6 engine swap**: the planned 2.0 petrol had only 2–4 LT ads, so the entry uses the 2.5 Skyactiv-G.
- **Photos**: not all angles were checked by eye. The Sportage (1.6 GDI) and Octavia (1.8 TSI) photos may not show the exact engine. Check the Corolla boot size too (see its notes).
- **Problem mileages**: `mileageKmFrom: 0` means the problem can appear at any mileage. It is not tied to a mileage.

### Per new car

#### 21. Ford Focus – `ford-focus-3-16tivct` (confidence: medium)

- Only 7 LT ads, all 2011–2013, so prices are thin. The 105 hp version is slower (12.3 s). Boot 316 l is shared with the 1.0 EcoBoost entry and not confirmed. Water pump issue comes from a parts retailer's guide. Photo shows a 1.6 Ti-VCT.
- Price source: autoplius.lt asking prices, Nov 2026 – only 7 ads, all 2011–2013 (€1,450–2,300; one at €4,500 left out); no later Ti-VCT cars listed
- Unknown intervals (null): 'Spark plugs and ignition coil' interval; 'Clutch kit (manual)' interval

#### 22. Peugeot 308 – `peugeot-308-t9-16bluehdi` (confidence: medium)

- Main problem source rates its own confidence low. Turbo coking risk comes from a comparison note, not a full report. Most repair costs are LT estimates. Oil and timing belt intervals not confirmed (null). Fuel 5.2 l is one owner's long-term log. Photo is a 2017+ wagon (same engine).
- Price source: autoplius.lt asking prices, Nov 2026 – 53 ads (1.6 diesel, 2014–2018), median per year
- Unknown intervals (null): 'Oil service' interval; 'Timing belt and water pump kit' interval; 'AdBlue tank/pump unit' interval; 'DPF cleaning' interval
- Alternatives: similar `vw-golf-7-16tdi`, safest `toyota-auris-2-hybrid`

#### 23. BMW 325i – `bmw-3-e90-325i-n52` (confidence: medium)

- N52B25 was fitted to EU 325i until about March 2007; some ads list 2008 registration. Only 11 LT ads. Repair costs are CarChecker independent rates (DE); LT may be lower. Photo is an Australian 2005–2008 325i (same body; engine not confirmed).
- Price source: autoplius.lt asking prices, Nov 2026 – 11 ads with the 2.5 L engine (€3,200–5,800), median per year; 2008-registered cars left out
- Unknown intervals (null): 'Electric water pump and thermostat' interval; 'Oil filter housing gasket' interval; 'Valve cover gasket and breather' interval

#### 24. Audi A4 – `audi-a4-b8-20tdi` (confidence: medium)

- Specs are for the 143 hp CAGA; 120, 136, 150 and 177 hp versions also exist. Early 2008–2010 engines may still share the older oil pump drive risk (not confirmed). Multitronic oil change cost is an estimate. Timing belt interval varies (180,000–210,000 km).
- Price source: autoplius.lt asking prices, Nov 2026 – 100 ads (2.0 diesel, 100–111 kW, 2008–2015), median per year
- Unknown intervals (null): 'EGR valve cleaning' interval
- Alternatives: similar `vw-passat-b7-20tdi`, similar `toyota-avensis-t27-18`

#### 25. Toyota Avensis – `toyota-avensis-t27-22d4d` (confidence: medium)

- Chosen over the 2.0 D-4D because the 2.2 is the engine with the known head problem. Risk is highest on pre-2009 engines; how often T27 cars fail is unclear, so rating 4 is a judgement. Head gasket, D-CAT injector and flywheel costs are LT estimates.
- Price source: autoplius.lt asking prices, Nov 2026 – 44 ads (2.2 diesel, 2009–2014), median per year
- Unknown intervals (null): 'Oil service' interval; 'Dual-mass flywheel and clutch' interval; 'Injector (each)' interval; 'EGR valve cleaning' interval
- Alternatives: similar `toyota-avensis-t27-18`, similar `vw-passat-b7-20tdi`

#### 26. Honda Civic – `honda-civic-8-22ictdi` (confidence: medium)

- One detailed problem source. Turbo and EGR mileages not stated by the source (estimates). Boot 485 l matches the existing Civic 1.8 entry. Only 29 LT ads; no 2011 ads. DPF fitment varies by market and build.
- Price source: autoplius.lt asking prices, Nov 2026 – 29 ads (2.2 diesel, 2006–2010), median per year
- Unknown intervals (null): 'Clutch and dual-mass flywheel kit' interval; 'New exhaust manifold' interval; 'EGR valve cleaning' interval
- Alternatives: similar `honda-civic-8-18`

#### 27. Škoda Octavia – `skoda-octavia-2-18tsi` (confidence: medium)

- Only 8 LT ads, so prices are rough. Fuel 8.3 l is from two owner logs (7.7 and 8.5 l). Some early cars may have a 6-speed torque-converter automatic (not confirmed, not listed). Photo is a 2009–2010 TSI wagon; engine size not stated.
- Price source: autoplius.lt asking prices, Nov 2026 – only 8 ads (1.8 TSI 118 kW, 2007–2012); 2007 is 1 ad, 2012 is the average of 2
- Unknown intervals (null): 'Timing chain, tensioner and guides' interval; 'Water pump and thermostat housing' interval; 'DSG DQ200 mechatronic repair' interval
- Alternatives: similar `skoda-octavia-2-19tdi`, similar `honda-civic-8-18`

#### 28. Volkswagen Passat – `vw-passat-b7-20tdi` (confidence: medium)

- Sources give few repair costs; EGR, DPF, flywheel and belt costs are LT estimates. DSG cost converted from SEK. EGR, DPF and MAF mileages not stated (estimates). Belt interval: factory 210,000 km, specialists advise 160,000–180,000 km. Fuel 6.3 l is one owner's 45,000 km log.
- Price source: autoplius.lt asking prices, Nov 2026 – 97 ads (2.0 diesel 100–105 kW, 2010–2014), median per year
- Unknown intervals (null): 'EGR cooler/valve replacement' interval; 'Clutch and dual-mass flywheel' interval

#### 29. Volkswagen Golf – `vw-golf-6-14tsi` (confidence: medium)

- Sources disagree: Autodoc rates the engine problematic, two others say caution with a verified chain. Oil, turbo and suspension repair costs are estimates. DQ200 cost taken from the Octavia 1.8 TSI report (same gearbox). Only 18 LT ads; 2013 ads are probably wagons. Fuel 6.8 l averages six owner logs.
- Price source: autoplius.lt asking prices, Nov 2026 – only 18 ads (1.4 petrol 88–92 kW, 2009–2013); 2010 and 2013 are 2 ads each
- Unknown intervals (null): 'Timing chain and tensioner' interval; 'DSG DQ200 clutch or mechatronic repair' interval
- Alternatives: similar `vw-golf-6-16tdi`, similar `honda-civic-8-18`

#### 30. Volkswagen Golf – `vw-golf-6-16tdi` (confidence: medium)

- Sources disagree: one parts retailer says avoid it for city use, three others rate it good. Most repair costs and mileages are estimates. Fuel 5.7 l averages five owner logs (autokostencheck gives 6.0 l). Belt interval not confirmed (null). Price filter may include a few 90 hp (66 kW) cars.
- Price source: autoplius.lt asking prices, Nov 2026 – 97 ads (1.6 diesel 66–77 kW, 2009–2013), median per year
- Unknown intervals (null): 'Timing belt and water pump kit' interval; 'EGR valve cleaning or replacement' interval; 'DPF cleaning' interval

#### 31. Mazda 6 – `mazda-6-gj-25` (confidence: medium)

- Swapped from the planned 2.0 because LT has only 4 GJ 2.0 petrol ads. Problems come from the 2.0 report, which says the 2.5 is equally reliable. Only 6 LT ads; many are US imports (184–188 hp). Fuel 8.5 l averages six owner logs. Mileage for calipers, arch rust and oil use are estimates.
- Price source: autoplius.lt asking prices, Nov 2026 – only 6 ads (2.5 petrol, 2014–2017, many US imports); 2015 is the average of 2
- Unknown intervals (null): 'Walnut blasting intake valves' interval; 'Rear brake caliper (per side)' interval

#### 32. Mazda 6 – `mazda-6-gj-22d` (confidence: medium)

- One detailed problem source plus forum reports. Fuel 5.5 l is an estimate between the ADAC test (4.5 l) and mixed-use reports; no long owner log found. Head gasket and injector mileages partly estimated. Price filter includes 175 hp cars.
- Price source: autoplius.lt asking prices, Nov 2026 – 51 ads (2.2 diesel 110–129 kW, 2012–2017), median per year
- Unknown intervals (null): 'Timing and oil pump chains' interval; 'Intake and EGR carbon clean' interval; 'DPF cleaning' interval; 'Clutch and dual-mass flywheel' interval
- Alternatives: similar `mazda-6-gj-25`, similar `vw-passat-b7-20tdi`

#### 33. Nissan Qashqai – `nissan-qashqai-j11-12digt` (confidence: medium)

- Sources agree oil burning is the main fault but rate the car differently (CarVerif 6/10). Turbo, chain, throttle and CVT mileages and CVT costs are estimates. Fuel 7.5 l is the low end of CarVerif's 7.5–8.5 l estimate. CVT cars are slower (12.9 s).
- Price source: autoplius.lt asking prices, Nov 2026 – 90 ads (1.2 petrol 85 kW, 2014–2018), median per year
- Unknown intervals (null): 'Turbo repair' interval; 'Clutch kit' interval; 'Engine rebuild (worst case)' interval
- Alternatives: similar `nissan-qashqai-j11-15dci`, safest `toyota-auris-2-hybrid`

#### 34. Nissan Qashqai – `nissan-qashqai-j11-15dci` (confidence: low)

- Main problem source rates its own confidence low (few owner reports). DCT gearbox and its judder come from a brief note only; DCT costs are estimates. Belt interval not confirmed (null). Fuel 5.6 l averages three owner logs. 2018+ cars have 115 hp.
- Price source: autoplius.lt asking prices, Nov 2026 – 57 ads (1.5 diesel 81–85 kW, 2014–2020), median per year
- Unknown intervals (null): 'Timing belt and water pump kit' interval; 'Turbo and intake hose' interval; 'EGR valve' interval
- Alternatives: similar `honda-crv-4-20`

#### 35. Volkswagen Golf – `vw-golf-7-16tdi` (confidence: medium)

- Sources give almost no EUR costs; most repair costs and mileages are LT estimates. Autoscore rates the engine 'caution' for city use, AutoHints 'very high'. Belt interval: factory up to 210,000 km, advised 150,000–180,000 km. Price filter mixes 105, 110 and 115 hp cars.
- Price source: autoplius.lt asking prices, Nov 2026 – 90 ads (1.6 diesel 77–81 kW, 2013–2019), median per year; 2018 is 3 ads
- Unknown intervals (null): 'EGR valve cleaning or replacement' interval; 'DSG DQ200 clutch or mechatronic repair' interval

#### 36. Mercedes-Benz C-Class – `mercedes-c-w204-c180cgi` (confidence: low)

- Only 7 LT ads; 2009–2010 ads may include older C180 Kompressor cars (same 115 kW). Covers C180 CGI (156 hp) and C200 CGI (184 hp, 0–100 8.2 s). Fuel 9.0 l is between autokostencheck figures (8.2–9.8 l). Mileages for magnets, steering lock and rust are estimates.
- Price source: autoplius.lt asking prices, Nov 2026 – only 7 ads (1.8 petrol 115–135 kW); 2009 is 1 ad, 2011 the average of 2
- Unknown intervals (null): 'Timing chain and camshaft adjusters' interval; 'Electronic steering lock' interval; 'Walnut blasting intake valves' interval; '7G-Tronic conductor plate' interval
- Alternatives: similar `bmw-3-e90-325i-n52`, similar `toyota-avensis-t27-18`

#### 37. Mercedes-Benz C-Class – `mercedes-c-w204-c220cdi` (confidence: medium)

- CarChecker calls it robust; CarVerif rates it 5.1 (not recommended) mainly for Delphi injectors. Rated 6 like the E 220 CDI (same OM651). 0–100 8.4 s and fuel 6.5 l (between autokostencheck 6.1 and 6.9 l) are estimates. 2008 cars have the older OM646 engine (not covered).
- Price source: autoplius.lt asking prices, Nov 2026 – 37 ads (2.1 diesel 120–125 kW, 2009–2013), median per year
- Unknown intervals (null): 'Set of four injectors' interval; 'Timing chain and tensioner' interval; 'Electronic steering lock' interval
- Alternatives: similar `vw-passat-b7-20tdi`, similar `toyota-avensis-t27-18`

#### 38. Audi A6 – `audi-a6-c7-20tdi` (confidence: medium)

- 0–100 8.7 s, 380 Nm and boot 530 l are typical values not confirmed by the main source; 190 hp cars (2014+) have 400 Nm and 8.2 s. Fuel 6.0 l between two autokostencheck figures (5.6 and 6.5 l). S tronic, AdBlue and DPF mileages are estimates. Similar alternative is a family car (segment exception).
- Price source: autoplius.lt asking prices, Nov 2026 – 78 ads (2.0 diesel 130–140 kW, 2011–2018), median per year
- Unknown intervals (null): 'Gearbox mechatronic repair' interval; 'DPF cleaning' interval; 'Front control arm bushes' interval
- Alternatives: similar `vw-passat-b8-20tdi`, safest `toyota-avensis-t27-18`

#### 39. Audi A6 – `audi-a6-c7-30tdi` (confidence: medium)

- LT ads split between 204 hp (150 kW) and 245 hp (180 kW); specs shown for 245 hp quattro (0–100 6.1 s not from the main source). Fuel 7.0 l between autokostencheck 6.8 and 7.3 l. Mileages for S tronic, EGR/DPF and AdBlue are estimates. Manual gearbox (204 hp) exists but is rare.
- Price source: autoplius.lt asking prices, Nov 2026 – 100+ ads (3.0 diesel 150–180 kW, 2011–2018), median per year
- Unknown intervals (null): 'Coolant valve and oil cooler gaskets' interval; 'Swirl flap manifolds (both sides)' interval; 'Timing chain kit (gearbox out)' interval; 'S tronic mechatronic repair' interval
- Alternatives: similar `bmw-5-f10-530d`

#### 40. Volkswagen Passat – `vw-passat-b8-20tdi` (confidence: medium)

- Main source gives no EUR costs; all repair costs are LT estimates. Most mileages are estimates. Fuel 6.0 l between autokostencheck (5.6 l) and an owner DSG log (7.2 l). Boot 586 l (sedan) is a typical value, not from the sources. 78% of LT ads are automatics.
- Price source: autoplius.lt asking prices, Nov 2026 – 91 ads (2.0 diesel 110 kW, 2015–2019), median per year
- Unknown intervals (null): 'AdBlue heater/pump module' interval; 'Clutch and dual-mass flywheel' interval

#### 41. Toyota Corolla – `toyota-corolla-e210-18hybrid` (confidence: high)

- Few problems are documented, so mileages are estimates. Boot 361 l is the hatchback figure (wagon 598 l) and is not from the sources. Fuel 4.9 l is one owner's 78,000 km log; autokostencheck shows higher (5.8 l). 142 Nm is the petrol engine only. 2023+ facelift (140 hp) not covered.
- Price source: autoplius.lt asking prices, Nov 2026 – 53 ads (1.8 hybrid, 2019–2022), median per year
- Unknown intervals (null): 'Front brake discs and pads' interval; 'Front shock absorbers (pair)' interval; '12 V battery' interval

#### 42. Toyota Yaris – `toyota-yaris-3-133` (confidence: medium)

- Only 14 LT ads; prices jump between years. Sources give no EUR costs; all are estimates. Oil-burning fix year differs by source (2013 vs 2014/15). Fuel 5.9 l is one owner log (older Yaris, same engine) and the ADAC test (5.8 l).
- Price source: autoplius.lt asking prices, Nov 2026 – only 14 ads (1.33 petrol, 2012–2017); 2012 and 2015 are averages of 2; one €1,500 outlier left out
- Unknown intervals (null): 'Water pump' interval

#### 43. Ford Fiesta – `ford-fiesta-7-125` (confidence: medium)

- Few engine-specific sources; costs converted from SEK or estimated. 0–100 13.3 s not confirmed by sources. Fuel 6.7 l averages nine owner logs (5.9–7.6 l). Rear bearing and steering mileages are estimates. 60 hp cars (44 kW) are slower.
- Price source: autoplius.lt asking prices, Nov 2026 – only 11 ads (1.25 petrol 44–60 kW, 2009–2017); 2010 and 2013 averages of 2; 2009 and 2017 are 1 ad each
- Unknown intervals (null): 'Thermostat housing / water pump' interval; 'Track rod ends / steering rack' interval; 'Rear wheel bearing' interval

#### 44. Škoda Fabia – `skoda-fabia-2-12htp` (confidence: medium)

- Sources give no failure mileages or EUR repair costs; all are estimates. Specs shown for 70 hp (12-valve); 60 hp is slower. Only 9 LT ads. Fuel 6.3 l is one owner log (60 hp). Photo is a 2008 car, version not confirmed.
- Price source: autoplius.lt asking prices, Nov 2026 – only 9 ads (1.2 petrol 44–51 kW, 2007–2014); 2014 is the average of 2
- Unknown intervals (null): 'Timing chain, tensioner and guides' interval; 'Ignition coil' interval; 'Cylinder head / valve repair' interval
- Alternatives: similar `ford-fiesta-7-125`, safest `toyota-yaris-3-133`

#### 45. Volvo XC60 – `volvo-xc60-1-d5` (confidence: medium)

- Specs shown for the 215 hp twin-turbo automatic; LT ads mix 185, 205, 215 and 220 hp. DPF, gearbox and Haldex mileages are estimates. Boot 495 l not from the sources. Similar alternative is cheaper but 1.7 s slower.
- Price source: autoplius.lt asking prices, Nov 2026 – 100+ ads (2.4 diesel 136–162 kW, 2008–2017), median per year
- Unknown intervals (null): 'Turbocharger' interval
- Alternatives: similar `honda-crv-4-20`

#### 46. Volkswagen Golf – `vw-golf-7-r` (confidence: medium)

- Specs for the 2017+ facelift DSG (pre-facelift: 380 Nm, 4.9 s). Only 12 LT ads; one €10,900 2016 ad excluded as suspicious. Repair costs and mileages are estimates.
- Price source: autoplius.lt asking prices, Nov 2026 – 12 ads (petrol 210–230 kW, 2014–2020), median per year
- Unknown intervals (null): 'Water pump and thermostat housing' interval
- Alternatives: similar `vw-golf-7-gti`

#### 47. Tesla Model Y – `tesla-model-y-lr` (confidence: medium)

- Problems taken from the Performance report, which shares the drivetrain. 2021 price (2 ads, €18k) is likely damaged US imports. Boot 854 l includes the underfloor; consumption is EV Database's real-world estimate.
- Price source: autoplius.lt asking prices, Nov 2026 – 31 ads (electric 340/378 kW, 2021–2024), median per year
- Unknown intervals (null): '12V battery' interval; 'Front upper control arms (pair)' interval
- Alternatives: similar `hyundai-kona-electric-64`, safest `toyota-rav4-5-hybrid`

#### 48. Hyundai Tucson – `hyundai-tucson-nx4-16tgdi-hev` (confidence: medium)

- Torque is the petrol engine only (265 Nm); 0–100 for FWD (AWD 8.3 s). Fuel 5.5 l from one test drive; expect more in winter. Thin price data (16 ads); many LT cars have 115,000–180,000 km.
- Price source: autoplius.lt asking prices, Nov 2026 – 16 ads (hybrid 169 kW, 2021–2024; PHEV and mild hybrids excluded), median per year
- Unknown intervals (null): 'Inverter coolant flush' interval; '12V lithium battery' interval

#### 49. Kia Sportage – `kia-sportage-ql-16gdi` (confidence: medium)

- Real fuel 7.8 l is an estimate (official 6.3–6.9 l NEDC). Boot 491 l not confirmed by the sources (one source says 503 l after the facelift). Thin price data (18 ads); 2020 median €12,550 not used.
- Price source: autoplius.lt asking prices, Nov 2026 – 18 ads (petrol 1.6, 97/99 kW, 2016–2021), median per year
- Unknown intervals (null): 'Clutch kit' interval

#### 50. Nissan Leaf – `nissan-leaf-ze1-40` (confidence: medium)

- Reliability 7 reflects the simple drivetrain; battery health varies a lot between cars. Boot 435 l (other sources say 394 l with Bose audio). Battery warranty terms and repair costs are estimates.
- Price source: autoplius.lt asking prices, Nov 2026 – 24 ads (electric 110 kW, 2018–2023), median per year
- Unknown intervals (null): '12V battery' interval; 'Rear brake calipers and discs service' interval
