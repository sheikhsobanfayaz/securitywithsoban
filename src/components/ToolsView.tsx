import { useMemo, type CSSProperties } from 'react';
import { ArrowRight, Check, Wrench } from 'lucide-react';
import BlurText from '@/components/reactbits/BlurText/BlurText';
import SpotlightCard from '@/components/reactbits/SpotlightCard/SpotlightCard';
import type { AppRoute } from '@/types/project';

interface ToolsViewProps {
  theme: 'light' | 'dark';
  onNavigate: (route: AppRoute) => void;
}

export function ToolsView({ theme, onNavigate }: ToolsViewProps) {
  const spotlightStyle = useMemo(
    () =>
      ({
        '--spotlight-card-surface': 'var(--surface)',
        '--spotlight-card-border': 'var(--hair)',
        '--spotlight-card-shadow': 'none',
      }) as CSSProperties,
    [],
  );

  return (
    <main className="mx-auto max-w-[1120px] px-5 pt-12 pb-20 sm:px-8 lg:px-12">
      <section className="border-b border-[var(--hair)] pb-10">
        <div className="font-mono-code mb-3 inline-flex items-center gap-2 text-[12px] font-medium text-[var(--accent-text)]">
          <Wrench className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
          <span>
            Tools built by <strong className="font-semibold">Soban</strong>
          </span>
        </div>

        <div role="heading" aria-level={1} className="max-w-[18ch]">
          <BlurText
            text="Simple browser tools. No setup needed"
            trigger="load"
            animateBy="words"
            direction="top"
            delay={55}
            stepDuration={0.3}
            className="font-display m-0 text-[clamp(30px,4.5vw,44px)] font-semibold leading-[1.12] tracking-[-0.025em] text-[var(--ink)]"
          />
        </div>

        <p className="mt-3 max-w-[66ch] text-[16px] leading-relaxed text-[var(--ink2)]">
          Small tools built to make studying for security exams and working with logs easier. Everything runs right in your browser, with nothing saved on any outside server.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => onNavigate('cc-simulator')}
            className="inline-flex h-11 items-center gap-2 rounded-lg border border-[var(--accent)] bg-[var(--accent)] px-5 text-[14px] font-semibold text-white transition-colors duration-150 hover:border-[var(--accent-text)] hover:bg-[var(--accent-text)] cursor-pointer"
          >
            <span>Open CC Practice Quiz</span>
            <ArrowRight className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => onNavigate('ai-sanitizer')}
            className="inline-flex h-11 items-center gap-2 rounded-lg border border-[var(--hair)] bg-[var(--paper)] px-5 text-[14px] font-semibold text-[var(--ink)] transition-colors duration-150 hover:border-[var(--ink2)] cursor-pointer"
          >
            <span>Open SanitizeAI</span>
            <ArrowRight className="h-4 w-4 text-[var(--mute)]" strokeWidth={1.5} aria-hidden="true" />
          </button>
        </div>
      </section>

      <section className="pt-10">
        <div className="mb-6">
          <h2 className="font-display m-0 text-[26px] font-semibold text-[var(--ink)]">
            Available Tools
          </h2>
          <p className="mt-1.5 mb-0 text-[15px] text-[var(--mute)]">
            Pick a browser utility below to launch it immediately
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <SpotlightCard
            theme={theme}
            spotlightColor={theme === 'dark' ? '#3B82F6' : '#2563EB'}
            intensity={theme === 'dark' ? 0.1 : 0.06}
            borderGlow={0.25}
            spotlightSize={280}
            style={spotlightStyle}
            className="flex flex-col justify-between gap-5 rounded-xl! border! border-[var(--hair)]! p-6!"
          >
            <div>
              <div className="mb-4 flex items-center justify-between gap-3">
                <span className="font-mono-code inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--hair)] bg-[var(--accent-soft)] text-[14px] font-semibold text-[var(--accent-text)]">
                  CC
                </span>
                <span className="font-mono-code tabular-nums rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[11.5px] font-medium text-[var(--emerald)]">
                  143 Questions
                </span>
              </div>
              <span className="font-mono-code text-[12px] text-[var(--accent-text)]">
                Exam prep
              </span>
              <h3 className="font-display mt-1 mb-2 text-[22px] font-semibold text-[var(--ink)]">
                ISC2 CC Practice Quiz
              </h3>
              <p className="mt-0 mb-4 text-[14.5px] leading-relaxed text-[var(--ink2)]">
                Practice quiz for the ISC2 Certified in Cybersecurity exam. Pick how many questions you want, click an answer, and immediately see why it is right or wrong.
              </p>
              <ul className="m-0 list-none space-y-2 p-0 text-[13.5px] text-[var(--ink2)]">
                <li className="flex items-start gap-2.5">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-[var(--mute)]" strokeWidth={1.5} aria-hidden="true" />
                  <span>Pick 10, 25, 50, 100, or all 143 questions right from the menu</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-[var(--mute)]" strokeWidth={1.5} aria-hidden="true" />
                  <span>Instant explanation showing why the right answer works and why others fail</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-[var(--mute)]" strokeWidth={1.5} aria-hidden="true" />
                  <span>Shows your score by topic and lets you retry only missed questions</span>
                </li>
              </ul>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--hair)] pt-4">
              <div className="flex flex-wrap gap-1.5">
                {['ISC2 CC', '5 Topics', 'Static'].map((tag) => (
                  <span
                    key={tag}
                    className="font-mono-code rounded-md border border-[var(--hair)] bg-[var(--paper)] px-2 py-0.5 text-[11.5px] text-[var(--mute)]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <button
                type="button"
                onClick={() => onNavigate('cc-simulator')}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--accent)] bg-[var(--accent)] px-3.5 py-1.5 text-[13px] font-semibold text-white transition-colors duration-150 hover:border-[var(--accent-text)] hover:bg-[var(--accent-text)] cursor-pointer"
              >
                <span>Start Quiz</span>
                <ArrowRight className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
              </button>
            </div>
          </SpotlightCard>

          <SpotlightCard
            theme={theme}
            spotlightColor={theme === 'dark' ? '#0D9488' : '#2563EB'}
            intensity={theme === 'dark' ? 0.1 : 0.06}
            borderGlow={0.25}
            spotlightSize={280}
            style={spotlightStyle}
            className="flex flex-col justify-between gap-5 rounded-xl! border! border-[var(--hair)]! p-6!"
          >
            <div>
              <div className="mb-4 flex items-center justify-between gap-3">
                <span className="font-mono-code inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--hair)] bg-[var(--accent-soft)] text-[14px] font-semibold text-[var(--accent-text)]">
                  AI
                </span>
                <span className="font-mono-code rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[11.5px] font-medium text-[var(--emerald)]">
                  Runs Locally
                </span>
              </div>
              <span className="font-mono-code text-[12px] text-[var(--accent-text)]">
                Privacy helper
              </span>
              <h3 className="font-display mt-1 mb-2 text-[22px] font-semibold text-[var(--ink)]">
                SanitizeAI Log Cleaner
              </h3>
              <p className="mt-0 mb-4 text-[14.5px] leading-relaxed text-[var(--ink2)]">
                Before pasting work logs into an AI assistant, clean them here first. It automatically hides client names, IP addresses, emails, usernames, and passwords inside your browser.
              </p>
              <ul className="m-0 list-none space-y-2 p-0 text-[13.5px] text-[var(--ink2)]">
                <li className="flex items-start gap-2.5">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-[var(--mute)]" strokeWidth={1.5} aria-hidden="true" />
                  <span>Finds client names even with spaces, hyphens, underscores, or inside domains</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-[var(--mute)]" strokeWidth={1.5} aria-hidden="true" />
                  <span>Replaces details with clean placeholders like [CLIENT_1] or [IP_1]</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-[var(--mute)]" strokeWidth={1.5} aria-hidden="true" />
                  <span>Includes a lookup table so you can match placeholders back to real values</span>
                </li>
              </ul>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--hair)] pt-4">
              <div className="flex flex-wrap gap-1.5">
                {['Privacy', 'Log Cleaner', 'Browser Only'].map((tag) => (
                  <span
                    key={tag}
                    className="font-mono-code rounded-md border border-[var(--hair)] bg-[var(--paper)] px-2 py-0.5 text-[11.5px] text-[var(--mute)]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <button
                type="button"
                onClick={() => onNavigate('ai-sanitizer')}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--accent)] bg-[var(--accent)] px-3.5 py-1.5 text-[13px] font-semibold text-white transition-colors duration-150 hover:border-[var(--accent-text)] hover:bg-[var(--accent-text)] cursor-pointer"
              >
                <span>Open SanitizeAI</span>
                <ArrowRight className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
              </button>
            </div>
          </SpotlightCard>
        </div>
      </section>
    </main>
  );
}
