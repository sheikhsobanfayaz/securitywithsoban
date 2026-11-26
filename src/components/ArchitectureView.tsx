import { useMemo, type CSSProperties } from 'react';
import { ArrowRight, Layers } from 'lucide-react';
import BlurText from '@/components/reactbits/BlurText/BlurText';
import SpotlightCard from '@/components/reactbits/SpotlightCard/SpotlightCard';
import type { AppRoute } from '@/types/project';

interface ArchitectureViewProps {
  theme: 'light' | 'dark';
  onNavigate: (route: AppRoute) => void;
}

export function ArchitectureView({ theme, onNavigate }: ArchitectureViewProps) {
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
      <section className="border-b border-[var(--hair)] pb-12">
        <div className="font-mono-code mb-3 inline-flex items-center gap-2 text-[12px] font-medium text-[var(--accent-text)]">
          <Layers className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
          <span>Behind the scenes</span>
        </div>

        <div role="heading" aria-level={1} className="max-w-[22ch]">
          <BlurText
            text="How this website is built. Simple, fast, and private"
            trigger="load"
            animateBy="words"
            direction="top"
            delay={50}
            stepDuration={0.3}
            className="font-display m-0 text-[clamp(30px,4.5vw,44px)] font-semibold leading-[1.12] tracking-[-0.025em] text-[var(--ink)]"
          />
        </div>

        <p className="mt-3 max-w-[68ch] text-[16px] leading-relaxed text-[var(--ink2)]">
          Most websites rely on heavy backends, databases, and background trackers. This portfolio builds into lightweight static files on GitHub Pages so it loads fast, exposes zero server attack surface, and respects visitor privacy.
        </p>

        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { val: '0', label: 'Trackers or Ads' },
            { val: 'Vite', label: 'Static Bundle Output' },
            { val: '100%', label: 'Runs in Browser' },
            { val: '17+', label: 'JSON-Driven Cases' },
          ].map((metric) => (
            <div
              key={metric.label}
              className="rounded-xl border border-[var(--hair)] bg-[var(--surface)] p-5"
            >
              <div className="font-display tabular-nums text-[28px] font-medium text-[var(--ink)]">
                {metric.val}
              </div>
              <div className="mt-1.5 text-[13px] font-normal text-[var(--mute)]">
                {metric.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="border-b border-[var(--hair)] py-16">
        <div className="mb-8">
          <h2 className="font-display m-0 text-[28px] font-semibold text-[var(--ink)]">
            Why Keep It Simple
          </h2>
          <p className="mt-2 mb-0 text-[15px] text-[var(--mute)]">
            Fewer moving parts means fewer vulnerabilities and nothing exposed on a backend server
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <SpotlightCard
            theme={theme}
            spotlightColor={theme === 'dark' ? '#3B82F6' : '#2563EB'}
            intensity={theme === 'dark' ? 0.1 : 0.06}
            borderGlow={0.25}
            spotlightSize={260}
            style={spotlightStyle}
            className="rounded-xl! border! border-[var(--hair)]! p-6!"
          >
            <h3 className="font-display mt-0 mb-2 text-[20px] font-semibold text-[var(--ink)]">
              No Database or Login Server
            </h3>
            <p className="mt-0 mb-3 text-[14.5px] leading-relaxed text-[var(--ink2)]">
              Websites with admin panels, databases, and server plugins need constant patching to stop SQL injection or account takeovers.
            </p>
            <p className="mt-0 mb-4 text-[14.5px] leading-relaxed text-[var(--ink2)]">
              This portfolio compiles into static HTML, CSS, JS, and JSON assets hosted on GitHub Pages. There is no database, no login page, and no server code running in the background.
            </p>
            <div className="flex flex-wrap gap-1.5">
              {['Static Files Only', 'No Database', 'GitHub Pages'].map((tag) => (
                <span
                  key={tag}
                  className="font-mono-code rounded-md border border-[var(--hair)] bg-[var(--paper)] px-2 py-0.5 text-[11.5px] text-[var(--mute)]"
                >
                  {tag}
                </span>
              ))}
            </div>
          </SpotlightCard>

          <SpotlightCard
            theme={theme}
            spotlightColor={theme === 'dark' ? '#0D9488' : '#2563EB'}
            intensity={theme === 'dark' ? 0.1 : 0.06}
            borderGlow={0.25}
            spotlightSize={260}
            style={spotlightStyle}
            className="rounded-xl! border! border-[var(--hair)]! p-6!"
          >
            <h3 className="font-display mt-0 mb-2 text-[20px] font-semibold text-[var(--ink)]">
              No Visitor Tracking
            </h3>
            <p className="mt-0 mb-3 text-[14.5px] leading-relaxed text-[var(--ink2)]">
              Many sites load hidden analytics scripts or ad cookies that follow visitors around the web.
            </p>
            <p className="mt-0 mb-4 text-[14.5px] leading-relaxed text-[var(--ink2)]">
              This site does not collect analytics, set tracking cookies, or send anything you type in the practice quiz or SanitizeAI tool to any outside server.
            </p>
            <div className="flex flex-wrap gap-1.5">
              {['No Analytics', 'No Tracking Cookies', 'Local Browser Only'].map((tag) => (
                <span
                  key={tag}
                  className="font-mono-code rounded-md border border-[var(--hair)] bg-[var(--paper)] px-2 py-0.5 text-[11.5px] text-[var(--mute)]"
                >
                  {tag}
                </span>
              ))}
            </div>
          </SpotlightCard>
        </div>
      </section>

      <section className="py-16">
        <div className="mb-8">
          <h2 className="font-display m-0 text-[28px] font-semibold text-[var(--ink)]">
            How Everything Fits Together
          </h2>
          <p className="mt-2 mb-0 text-[15px] text-[var(--mute)]">
            Structured static JSON feeds and automated GitHub Actions keep content current
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <SpotlightCard
            theme={theme}
            spotlightColor={theme === 'dark' ? '#3B82F6' : '#2563EB'}
            intensity={theme === 'dark' ? 0.1 : 0.06}
            borderGlow={0.25}
            spotlightSize={260}
            style={spotlightStyle}
            className="rounded-xl! border! border-[var(--hair)]! p-6! lg:col-span-2"
          >
            <h3 className="font-display mt-0 mb-2 text-[19px] font-semibold text-[var(--ink)]">
              JSON-Driven Case Studies &amp; Daily News
            </h3>
            <p className="mt-0 mb-4 text-[14.5px] text-[var(--ink2)]">
              Case studies live in <code className="font-mono-code">public/projects.json</code> and daily threat briefings live in <code className="font-mono-code">public/news.json</code>, updated automatically by GitHub Actions workflows.
            </p>
            <pre className="font-mono-code m-0 overflow-x-auto rounded-lg border border-slate-800 bg-[#0B1120] p-4 text-[12.5px] leading-relaxed text-slate-200">{`// Example entry inside public/projects.json
{
  "id": "unsloth-lora-secops",
  "category": "ai",
  "title": "Offline Script Helper with Llama-3",
  "tags": ["Python", "AI", "Offline"]
}`}</pre>
          </SpotlightCard>

          <SpotlightCard
            theme={theme}
            spotlightColor={theme === 'dark' ? '#3B82F6' : '#2563EB'}
            intensity={theme === 'dark' ? 0.1 : 0.06}
            borderGlow={0.25}
            spotlightSize={260}
            style={spotlightStyle}
            className="rounded-xl! border! border-[var(--hair)]! p-6!"
          >
            <h3 className="font-display mt-0 mb-2 text-[19px] font-semibold text-[var(--ink)]">
              Browser-Only Tools
            </h3>
            <p className="mt-0 mb-3 text-[14.5px] leading-relaxed text-[var(--ink2)]">
              The practice terminal, the 143-question ISC2 CC quiz, and the SanitizeAI log cleaner all run directly in your browser tab.
            </p>
            <p className="mt-0 mb-5 text-[14.5px] leading-relaxed text-[var(--ink2)]">
              Nothing is uploaded anywhere, so you can safely test sensitive telemetry patterns locally.
            </p>
            <button
              type="button"
              onClick={() => onNavigate('tools')}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--accent)] bg-[var(--accent)] px-4 py-2 text-[13px] font-semibold text-white transition-colors duration-150 hover:border-[var(--accent-text)] hover:bg-[var(--accent-text)] cursor-pointer"
            >
              <span>Explore Tools</span>
              <ArrowRight className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
            </button>
          </SpotlightCard>
        </div>
      </section>
    </main>
  );
}
