import { lazy, Suspense } from 'react'
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/AppShell'
import { Find } from './features/find/Find'
import { Home } from './features/home/Home'
import { Intro } from './features/intro/Intro'
import { useLocalStorage } from './hooks/useLocalStorage'

// First screens (intro, Home, Find) load eagerly; the rest load when opened, so the first paint on a phone is sooner.
const Research = lazy(() => import('./features/research/Research').then((m) => ({ default: m.Research })))
const Buy = lazy(() => import('./features/buy/Buy').then((m) => ({ default: m.Buy })))
const Saved = lazy(() => import('./features/saved/Saved').then((m) => ({ default: m.Saved })))
const Compare = lazy(() => import('./features/saved/Compare').then((m) => ({ default: m.Compare })))
const About = lazy(() => import('./features/about/About').then((m) => ({ default: m.About })))

export default function App() {
  const [introSeen, setIntroSeen] = useLocalStorage('cc.introSeen', false)
  if (!introSeen) return <Intro onDone={() => setIntroSeen(true)} />

  const page = (el: React.ReactNode) => <Suspense fallback={null}>{el}</Suspense>
  // HashRouter: GitHub Pages has no server rewrites; hash URLs survive refresh on deep links.
  return (
    <HashRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<Home />} />
          <Route path="/find" element={<Find />} />
          <Route path="/research" element={page(<Research />)} />
          <Route path="/research/:carId" element={page(<Research />)} />
          <Route path="/buy" element={page(<Buy />)} />
          <Route path="/buy/:carId" element={page(<Buy />)} />
          <Route path="/saved" element={page(<Saved />)} />
          <Route path="/compare" element={page(<Compare />)} />
          <Route path="/about" element={page(<About />)} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}
