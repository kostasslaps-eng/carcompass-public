import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import type { CarChoice } from '../components/CarSelector'
import { getCar } from '../data'
import { carParams } from '../routes'

/** Car, year and km from the URL of a car page; `go` navigates (a new car pushes history, tweaks replace it). */
export function useCarPage(url: (c: CarChoice) => string) {
  const { carId } = useParams()
  const [search] = useSearchParams()
  const navigate = useNavigate()
  const car = getCar(carId)
  const { year, km } = car ? carParams(car, search) : { year: 0, km: 0 }
  const go = (c: CarChoice, newCar: boolean) => navigate(url(c), { replace: !newCar })
  return { carId, car, year, km, search, go }
}
