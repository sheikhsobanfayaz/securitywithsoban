import { ArrowUp, Copy, ExternalLink, Globe, Mail } from 'lucide-react';
import { CONTACT_EMAIL, CREDLY_URL, GITHUB_URL, LINKEDIN_URL } from '@/data/portfolio';
import type { AppRoute } from '@/types/project';

interface FooterProps {
  onNavigate: (route: AppRoute, options?: { sectionId?: string; category?: string }) => void;
  onCopyEmail: () => void;
}

export function Footer({ onNavigate, onCopyEmail }: FooterProps) {
  const go = (
    e: React.MouseEvent<HTMLAnchorElement>,
    route: AppRoute,
    options?: { sectionId?: string; category?: string },
  ) => {
    e.preventDefault();
    onNavigate(route, options);
  };

  return (
    <footer className="border-t border-[var(--hair)] bg-[var(--surface)] pt-14 pb-10 text-[14px] text-[var(--mute)]">
      <div className="mx-auto max-w-[1160px] px-5 sm:px-8 lg:px-10">
        <div className="grid grid-cols-1 gap-10 border-b border-[var(--hair)] pb-12 md:grid-cols-2 lg:grid-cols-[1.5fr_0.9fr_0.9fr_1.1fr]">
          <div>
            <div className="mb-3 flex items-center gap-3">
              <span className="font-mono-code inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--hair)] bg-[var(--paper)] text-[12.5px] font-semibold text-[var(--accent-text)]">
                SF
              </span>
              <div>
                <div className="font-display text-[16px] font-medium text-[var(--ink)]">
                  Sheikh <strong className="font-semibold">Soban</strong> Fayaz
                </div>
                <div className="font-mono-code text-[12px] text-[var(--mute)]">
                  Security Operations &amp; Network Defense
                </div>
              </div>
            </div>

            <p className="mt-3 mb-4 max-w-[44ch] text-[13.5px] leading-relaxed text-[var(--ink2)]">
              SOC Analyst in an MSSP environment combining perimeter firewall engineering roots with SIEM telemetry correlation and privacy-first browser utilities.
            </p>

            <div className="flex flex-wrap items-center gap-3 text-[12.5px] text-[var(--mute)]">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-[var(--emerald)]" aria-hidden="true" />
                <span>Open to SOC &amp; Detection roles</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Globe className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
                <span>Jammu and Kashmir, India</span>
              </span>
            </div>
          </div>

          <div>
            <h4 className="font-display mt-0 mb-3.5 text-[13.5px] font-semibold text-[var(--ink)]">
              Explore
            </h4>
            <ul className="m-0 flex list-none flex-col gap-2.5 p-0 text-[13.5px]">
              <li>
                <a href="#/" onClick={(e) => go(e, 'home')} className="text-[var(--ink2)] no-underline hover:text-[var(--accent-text)]">
                  Home Overview
                </a>
              </li>
              <li>
                <a href="#/investigations" onClick={(e) => go(e, 'investigations')} className="text-[var(--ink2)] no-underline hover:text-[var(--accent-text)]">
                  Case Studies Archive
                </a>
              </li>
              <li>
                <a href="#/news" onClick={(e) => go(e, 'news')} className="text-[var(--ink2)] no-underline hover:text-[var(--accent-text)]">
                  Daily Cybersecurity News
                </a>
              </li>
              <li>
                <a href="#/architecture" onClick={(e) => go(e, 'architecture')} className="text-[var(--ink2)] no-underline hover:text-[var(--accent-text)]">
                  Static Architecture
                </a>
              </li>
              <li>
                <a href="#/contact" onClick={(e) => go(e, 'contact')} className="text-[var(--ink2)] no-underline hover:text-[var(--accent-text)]">
                  Contact Form
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-display mt-0 mb-3.5 text-[13.5px] font-semibold text-[var(--ink)]">
              Labs &amp; Utilities
            </h4>
            <ul className="m-0 flex list-none flex-col gap-2.5 p-0 text-[13.5px]">
              <li>
                <a href="#/cc-simulator" onClick={(e) => go(e, 'cc-simulator')} className="text-[var(--ink2)] no-underline hover:text-[var(--accent-text)]">
                  ISC2 CC Practice Quiz
                </a>
              </li>
              <li>
                <a href="#/ai-sanitizer" onClick={(e) => go(e, 'ai-sanitizer')} className="text-[var(--ink2)] no-underline hover:text-[var(--accent-text)]">
                  SanitizeAI Log Cleaner
                </a>
              </li>
              <li>
                <a href="#terminal" onClick={(e) => go(e, 'home', { sectionId: 'terminal' })} className="text-[var(--ink2)] no-underline hover:text-[var(--accent-text)]">
                  Practice Terminal
                </a>
              </li>
              <li>
                <a href="#/investigations?cat=network" onClick={(e) => go(e, 'investigations', { category: 'network' })} className="text-[var(--ink2)] no-underline hover:text-[var(--accent-text)]">
                  Network &amp; Perimeter
                </a>
              </li>
              <li>
                <a href="#/investigations?cat=siem" onClick={(e) => go(e, 'investigations', { category: 'siem' })} className="text-[var(--ink2)] no-underline hover:text-[var(--accent-text)]">
                  SIEM &amp; Detection
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-display mt-0 mb-3.5 text-[13.5px] font-semibold text-[var(--ink)]">
              Connect
            </h4>
            <div className="rounded-xl border border-[var(--hair)] bg-[var(--paper)] p-4">
              <div className="font-mono-code mb-2 truncate text-[12px] text-[var(--accent-text)]">
                {CONTACT_EMAIL}
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={onCopyEmail}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--hair)] bg-[var(--surface)] px-2.5 py-1.5 text-[12px] font-medium text-[var(--ink)] transition-colors duration-150 hover:border-[var(--ink2)] cursor-pointer"
                >
                  <Copy className="h-3.5 w-3.5 text-[var(--mute)]" strokeWidth={1.5} aria-hidden="true" />
                  <span>Copy email</span>
                </button>
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--accent)] bg-[var(--accent)] px-2.5 py-1.5 text-[12px] font-semibold text-white no-underline transition-colors duration-150 hover:bg-[var(--accent-text)]"
                >
                  <Mail className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
                  <span>Email</span>
                </a>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-4 text-[13px] font-medium">
              <a
                href={LINKEDIN_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[var(--ink2)] no-underline hover:text-[var(--accent-text)]"
              >
                <span>LinkedIn</span>
                <ExternalLink className="h-3.5 w-3.5 text-[var(--mute)]" strokeWidth={1.5} aria-hidden="true" />
              </a>
              <a
                href={CREDLY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[var(--ink2)] no-underline hover:text-[var(--accent-text)]"
              >
                <span>Credly</span>
                <ExternalLink className="h-3.5 w-3.5 text-[var(--mute)]" strokeWidth={1.5} aria-hidden="true" />
              </a>
              <a
                href={GITHUB_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[var(--ink2)] no-underline hover:text-[var(--accent-text)]"
              >
                <span>GitHub</span>
                <ExternalLink className="h-3.5 w-3.5 text-[var(--mute)]" strokeWidth={1.5} aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-6 text-[13px]">
          <span>
            &copy; 2026 Sheikh <strong className="font-semibold text-[var(--ink)]">Soban</strong> Fayaz &middot; Security Operations Portfolio
          </span>
          <div className="flex items-center gap-4">
            <span className="font-mono-code text-[12px]">ISC2 CC &middot; Network &amp; SOC</span>
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              aria-label="Back to top"
              className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--hair)] bg-[var(--paper)] px-3 py-1.5 text-[12.5px] font-medium text-[var(--ink2)] transition-colors duration-150 hover:border-[var(--ink2)] cursor-pointer"
            >
              <span>Top</span>
              <ArrowUp className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
