// Downloads every photos[].fileUrl from data/cars.json (Wikimedia Commons), converts to WebP at 1200 and 600 px,
// saves public/photos/{carId}-{role}-{size}.webp and writes src/data/photo-manifest.json. Prints a report.
// Usage: npm run photos:fetch            (skips photos that already exist)
//        npm run photos:fetch -- --force (re-downloads everything)
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import sharp from 'sharp'

const UA = 'CarCompassDemo/1.0 (university demo project)'
const SIZES = [1200, 600]
const OUT = 'public/photos'
const MANIFEST = 'src/data/photo-manifest.json'
const force = process.argv.includes('--force')

const cars = JSON.parse(readFileSync('data/cars.json', 'utf8'))
const manifest = existsSync(MANIFEST) && !force ? JSON.parse(readFileSync(MANIFEST, 'utf8')) : {}
mkdirSync(OUT, { recursive: true })

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// Wikimedia asks bots to fetch standard-size thumbnails, not originals (originals get HTTP 429).
// .../commons/a/ab/Name.jpg → .../commons/thumb/a/ab/Name.jpg/1280px-Name.jpg
const thumbUrl = (url) => url.replace(/\/commons\/(.\/..\/)([^/]+)$/, '/commons/thumb/$1$2/1280px-$2')

async function get(url) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    const res = await fetch(url, { headers: { 'User-Agent': UA } })
    if (res.ok) return Buffer.from(await res.arrayBuffer())
    if (res.status !== 429 && res.status < 500) throw new Error(`HTTP ${res.status}`)
    await sleep(3000 * attempt)
  }
  throw new Error('rate-limited (HTTP 429), try again in ~10 minutes')
}

async function download(url) {
  try {
    return await get(thumbUrl(url))
  } catch {
    return get(url) // original narrower than 1280 px has no such thumbnail
  }
}

const report = { ok: [], skipped: [], failed: [] }
for (const car of cars) {
  for (const photo of car.photos) {
    const key = `${car.id}-${photo.role}`
    const paths = SIZES.map((w) => `${OUT}/${key}-${w}.webp`)
    if (!force && manifest[car.id]?.[photo.role] && paths.every(existsSync)) {
      report.skipped.push(key)
      continue
    }
    try {
      const input = await download(photo.fileUrl)
      let dims
      for (const [i, w] of SIZES.entries()) {
        const info = await sharp(input).rotate().resize({ width: w, withoutEnlargement: true }).webp({ quality: 78 }).toFile(paths[i])
        if (i === 0) dims = { width: info.width, height: info.height }
      }
      manifest[car.id] = { ...manifest[car.id], [photo.role]: dims }
      report.ok.push(`${key}  ${dims.width}×${dims.height}`)
    } catch (err) {
      report.failed.push(`${key}  ${err.message}  ${photo.fileUrl}`)
    }
    await sleep(500)
  }
}

writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + '\n')
console.log(`\nPhotos: ${report.ok.length} downloaded, ${report.skipped.length} already present, ${report.failed.length} failed.`)
for (const l of report.ok) console.log('  ok      ' + l)
for (const l of report.failed) console.log('  FAILED  ' + l)
if (report.failed.length) console.log('\nFailed photos fall back to the body-type silhouette in the app.')
