/** Compass mark + wordmark. Own identity: no third-party brand marks. */
export function Logo({ onDark }: { onDark?: boolean }) {
  return (
    <span className="flex items-center gap-2">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" strokeWidth="1.75" aria-hidden="true" className={onDark ? 'stroke-on-dark' : 'stroke-ink'}>
        <circle cx="12" cy="12" r="10" />
        <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" className="fill-primary stroke-primary" />
      </svg>
      <span className="text-title-md">CarCompass</span>
    </span>
  )
}
