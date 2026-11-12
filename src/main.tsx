import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/inter/400.css'
import '@fontsource/inter/700.css'
import './styles/index.css'
import App from './App.tsx'

const root = createRoot(document.getElementById('root')!)

async function start() {
  // Dev only: validate the data files once and show a clear error screen instead of a half-broken app.
  // Dynamic import keeps zod out of the production bundle.
  if (import.meta.env.DEV) {
    const { validateData } = await import('./data/validate')
    const problems = validateData()
    if (problems.length) {
      root.render(
        <div style={{ padding: 24, fontFamily: 'monospace', color: '#b42318' }}>
          <h1>Data files are invalid</h1>
          <p>Fix these, then reload:</p>
          <ul>{problems.map((p) => <li key={p}>{p}</li>)}</ul>
        </div>,
      )
      return
    }
  }
  root.render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}

void start()
