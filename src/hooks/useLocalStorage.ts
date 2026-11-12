import { useCallback, useEffect, useState } from 'react'

const EVENT = 'cc-storage'

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw === null ? fallback : (JSON.parse(raw) as T)
  } catch {
    return fallback // private mode, blocked storage or bad JSON
  }
}

/**
 * State persisted in localStorage (ARCHITECTURE §8). Every read/write is in try/catch, so the app still works
 * without storage. All hooks using the same key stay in sync (same tab via a custom event, other tabs via "storage").
 */
export function useLocalStorage<T>(key: string, fallback: T): [T, (next: T | ((prev: T) => T)) => void] {
  const [value, setValue] = useState<T>(() => read(key, fallback))

  useEffect(() => {
    const sync = (e: Event) => {
      const k = e instanceof StorageEvent ? e.key : (e as CustomEvent<string>).detail
      if (k === key) setValue(read(key, fallback))
    }
    window.addEventListener(EVENT, sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener(EVENT, sync)
      window.removeEventListener('storage', sync)
    }
    // fallback is a plain default value; re-subscribing on its identity would loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  const set = useCallback(
    (next: T | ((prev: T) => T)) => {
      const prev = read(key, fallback)
      const resolved = typeof next === 'function' ? (next as (p: T) => T)(prev) : next
      setValue(resolved)
      try {
        localStorage.setItem(key, JSON.stringify(resolved))
      } catch {
        // storage full or blocked: keep the in-memory value
      }
      window.dispatchEvent(new CustomEvent(EVENT, { detail: key }))
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key],
  )

  return [value, set]
}
