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
      href="/Axel_Waserman_Engineering_Manager.pdf"
      download
      aria-label="Download CV (PDF)"
      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[var(--radius-card)] border border-[var(--color-muted)]/30 bg-transparent text-[length:var(--text-ui)] font-medium text-[var(--color-muted)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] focus-visible:outline-2 focus-visible:outline-[var(--color-accent)] focus-visible:outline-offset-2 transition-[color,border-color] duration-150 ease-out"
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
