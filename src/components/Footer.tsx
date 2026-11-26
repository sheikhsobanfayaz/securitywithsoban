import { ArrowUp, ExternalLink, Globe } from 'lucide-react';
import { CONTACT_EMAIL, CREDLY_URL, GITHUB_URL, LINKEDIN_URL } from '@/data/portfolio';
import type { AppRoute } from '@/types/project';

interface FooterProps {
  onNavigate: (route: AppRoute) => void;
}

export function Footer({ onNavigate }: FooterProps) {
  const go = (e: React.MouseEvent<HTMLAnchorElement>, route: AppRoute) => {
    e.preventDefault();
    onNavigate(route);
  };

  return (
    <footer className="border-t border-[var(--hair)] bg-[var(--surface)]/60 pt-12 pb-10 text-[14px] text-[var(--mute)]">
      <div className="mx-auto max-w-[1120px] px-5 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 gap-9 border-b border-[var(--hair)] pb-10 md:grid-cols-[1.5fr_1fr_1fr]">
          <div>
            <div className="mb-3 flex items-center gap-2.5">
              <span className="font-mono-code inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--hair)] bg-[var(--accent-soft)] text-[12px] font-bold text-[var(--accent-text)]">
                SF
              </span>
              <div>
                <div className="font-display text-[15.5px] text-[var(--ink)]">
                  Sheikh <strong className="font-bold">Soban</strong> Fayaz
                </div>
                <div className="font-mono-code text-[11.5px] text-[var(--accent-text)]">
                  Security Operations &amp; Network Defense
                </div>
              </div>
            </div>
            <p className="mt-2 mb-3 max-w-[46ch] text-[13.5px] leading-relaxed text-[var(--ink2)]">
              Security Operations Center (SOC) Analyst specializing in perimeter firewall diagnostics, SIEM telemetry correlation, and privacy-first analyst tooling.
            </p>
            <div className="inline-flex items-center gap-1.5 text-[12.5px] text-[var(--mute)]">
              <Globe className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Jammu and Kashmir, India</span>
            </div>
          </div>

          <div>
            <h4 className="font-display mt-0 mb-3 text-[13px] font-semibold uppercase tracking-wider text-[var(--ink)]">
              Pages
            </h4>
            <ul className="m-0 grid list-none grid-cols-2 gap-x-4 gap-y-2 p-0 text-[13.5px]">
              <li>
                <a href="#/" onClick={(e) => go(e, 'home')} className="text-[var(--ink2)] no-underline hover:text-[var(--accent-text)]">
                  Home
                </a>
              </li>
              <li>
                <a href="#/investigations" onClick={(e) => go(e, 'investigations')} className="text-[var(--ink2)] no-underline hover:text-[var(--accent-text)]">
                  Investigations
                </a>
              </li>
              <li>
                <a href="#/tools" onClick={(e) => go(e, 'tools')} className="text-[var(--ink2)] no-underline hover:text-[var(--accent-text)]">
                  Tools
                </a>
              </li>
              <li>
                <a href="#/news" onClick={(e) => go(e, 'news')} className="text-[var(--ink2)] no-underline hover:text-[var(--accent-text)]">
                  News
                </a>
              </li>
              <li>
                <a href="#/cc-simulator" onClick={(e) => go(e, 'cc-simulator')} className="text-[var(--ink2)] no-underline hover:text-[var(--accent-text)]">
                  CC Practice Quiz
                </a>
              </li>
              <li>
                <a href="#/ai-sanitizer" onClick={(e) => go(e, 'ai-sanitizer')} className="text-[var(--ink2)] no-underline hover:text-[var(--accent-text)]">
                  SanitizeAI
                </a>
              </li>
              <li>
                <a href="#/architecture" onClick={(e) => go(e, 'architecture')} className="text-[var(--ink2)] no-underline hover:text-[var(--accent-text)]">
                  Architecture
                </a>
              </li>
              <li>
                <a href="#/contact" onClick={(e) => go(e, 'contact')} className="text-[var(--ink2)] no-underline hover:text-[var(--accent-text)]">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-display mt-0 mb-3 text-[13px] font-semibold uppercase tracking-wider text-[var(--ink)]">
              Links
            </h4>
            <ul className="m-0 flex list-none flex-col gap-2 p-0 text-[13.5px]">
              <li>
                <a
                  href={LINKEDIN_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[var(--ink2)] no-underline hover:text-[var(--accent-text)]"
                >
                  <span>LinkedIn Profile</span>
                  <ExternalLink className="h-3 w-3" aria-hidden="true" />
                </a>
              </li>
              <li>
                <a
                  href={CREDLY_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[var(--ink2)] no-underline hover:text-[var(--accent-text)]"
                >
                  <span>Credly ISC2 CC Badge</span>
                  <ExternalLink className="h-3 w-3" aria-hidden="true" />
                </a>
              </li>
              <li>
                <a
                  href={GITHUB_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[var(--ink2)] no-underline hover:text-[var(--accent-text)]"
                >
                  <span>GitHub</span>
                  <ExternalLink className="h-3 w-3" aria-hidden="true" />
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="font-mono-code text-[12.5px] text-[var(--accent-text)] no-underline hover:underline"
                >
                  {CONTACT_EMAIL}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-6 text-[13px]">
          <span>
            &copy; 2026 Sheikh <strong className="font-bold text-[var(--ink)]">Soban</strong> Fayaz &middot; Security Operations Portfolio
          </span>
          <div className="flex items-center gap-4">
            <span className="font-mono-code text-[12px]">ISC2 CC &middot; Network &amp; SOC</span>
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              aria-label="Back to top"
              className="inline-flex items-center gap-1 rounded-md border border-[var(--hair)] bg-[var(--paper)] px-2.5 py-1 text-[12.5px] font-medium text-[var(--ink2)] transition-colors hover:border-[var(--ink2)] cursor-pointer"
            >
              <span>Top</span>
              <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
