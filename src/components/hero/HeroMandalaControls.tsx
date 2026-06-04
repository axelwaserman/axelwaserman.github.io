interface HeroMandalaControlsProps {
  n: number
  k: number
  onChangeN: (next: number) => void
  onChangeK: (next: number) => void
  onRefresh: () => void
}

const N_MIN = 3
const N_MAX = 500
const K_MIN = 1

function clamp(value: number, min: number, max: number): number {
  if (Number.isNaN(value)) return min
  return Math.min(Math.max(value, min), max)
}

const inputClassName =
  'w-[6ch] px-2 py-1.5 rounded-[var(--radius-card)] bg-[var(--color-surface)] border border-[var(--color-muted)]/30 text-[length:var(--text-ui)] text-[var(--color-text)] tabular-nums hover:border-[var(--color-muted)]/50 focus:border-[var(--color-accent)] focus:outline-2 focus:outline-[var(--color-accent)] focus:outline-offset-2'

const labelClassName =
  'flex items-center gap-2 text-[length:var(--text-ui)] text-[var(--color-muted)]'

const refreshButtonClassName =
  'w-11 h-11 rounded-full flex items-center justify-center border-0 bg-transparent text-[var(--color-muted)] hover:text-[var(--color-accent)] hover:bg-[color-mix(in_oklch,var(--color-accent)_8%,transparent)] focus:outline-2 focus:outline-[var(--color-accent)] focus:outline-offset-2 active:scale-[0.96] transition-[color,background-color,transform] duration-150 ease-out'

export default function HeroMandalaControls({
  n,
  k,
  onChangeN,
  onChangeK,
  onRefresh,
}: HeroMandalaControlsProps) {
  const handleChangeN = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChangeN(Number(event.target.value))
  }

  const handleBlurN = (event: React.FocusEvent<HTMLInputElement>) => {
    onChangeN(clamp(Number(event.target.value), N_MIN, N_MAX))
  }

  const handleChangeK = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChangeK(Number(event.target.value))
  }

  const handleBlurK = (event: React.FocusEvent<HTMLInputElement>) => {
    onChangeK(clamp(Number(event.target.value), K_MIN, n - 1))
  }

  return (
    <div className="flex flex-col gap-3 mt-4">
      <div className="flex items-center gap-3 flex-wrap">
        <label className={labelClassName}>
          n
          <input
            type="number"
            inputMode="numeric"
            min={N_MIN}
            max={N_MAX}
            step={1}
            value={n}
            onChange={handleChangeN}
            onBlur={handleBlurN}
            aria-label="Number of points on circle"
            className={inputClassName}
          />
        </label>
        <label className={labelClassName}>
          k
          <input
            type="number"
            inputMode="numeric"
            min={K_MIN}
            max={n - 1}
            step={1}
            value={k}
            onChange={handleChangeK}
            onBlur={handleBlurK}
            aria-label="Multiplier"
            className={inputClassName}
          />
        </label>
        <button
          type="button"
          onClick={onRefresh}
          aria-label="Refresh mandala — pick a new random pattern"
          className={refreshButtonClassName}
        >
          <svg
            viewBox="0 0 24 24"
            width={20}
            height={20}
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M3 12a9 9 0 0 1 15.5-6.3L21 8" />
            <path d="M21 3v5h-5" />
            <path d="M21 12a9 9 0 0 1-15.5 6.3L3 16" />
            <path d="M3 21v-5h5" />
          </svg>
        </button>
      </div>
      <span
        id="mandala-caption"
        className="text-[length:var(--text-ui)] text-[var(--color-muted)] tabular-nums"
      >
        n = {n}, k = {k}
      </span>
    </div>
  )
}
