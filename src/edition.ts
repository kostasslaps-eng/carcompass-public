// Replaced at build time, so the full-edition branch is dropped from the public bundle.
export const EDITION: 'full' | 'public' = import.meta.env.VITE_EDITION === 'full' ? 'full' : 'public'
