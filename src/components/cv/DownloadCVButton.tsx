/**
 * Secondary "Download CV (PDF)" CTA used at the end of the experience block
 * (between Work and Education) per Phase 5 D-12 + UI-SPEC §"Download Button
 * Visual Contract". Anchor + `download` attribute is required by D-12 and the
 * web/security.md guidance for PDF links (descriptive label, browser
 * download instead of navigation).
 */
export default function DownloadCVButton() {
  return (
    <a
      href="/cv.pdf"
      download
      aria-label="Download CV (PDF)"
      className="inline-flex items-center gap-2 py-3 px-5 bg-transparent text-[length:var(--text-ui)] font-semibold text-[var(--color-text)] border-0 border-b border-[var(--color-accent)] rounded-none hover:border-b-2 transition-[border-bottom-width] duration-150 ease-out focus:outline-2 focus:outline-[var(--color-accent)] focus:outline-offset-4 w-full justify-center sm:w-auto sm:justify-start"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        width="16"
        height="16"
        aria-hidden="true"
      >
        <path d="M12 3v13" />
        <path d="m7 11 5 5 5-5" />
        <path d="M5 21h14" />
      </svg>
      <span>Download CV (PDF)</span>
    </a>
  )
}
