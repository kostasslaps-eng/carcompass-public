import { getCar } from '../data'
import { useLocalStorage } from './useLocalStorage'

export interface SavedCar {
  carId: string
  year: number
  km: number
  savedAt: string
}

export function useSaved() {
  const [stored, setSaved] = useLocalStorage<SavedCar[]>('cc.saved', [])
  // Ignore entries for cars no longer in the dataset (or junk in storage).
  const saved = Array.isArray(stored) ? stored.filter((s) => getCar(s?.carId)) : []
  const isSaved = (carId: string) => saved.some((s) => s.carId === carId)
  const toggle = (carId: string, year: number, km: number) =>
    setSaved((prev) =>
      prev.some((s) => s.carId === carId)
        ? prev.filter((s) => s.carId !== carId)
        : [...prev, { carId, year, km, savedAt: new Date().toISOString() }],
    )
  const remove = (carId: string) => setSaved((prev) => prev.filter((s) => s.carId !== carId))
  return { saved, isSaved, toggle, remove }
}
