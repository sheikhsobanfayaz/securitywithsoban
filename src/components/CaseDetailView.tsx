import { useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Copy, Share2 } from 'lucide-react';
import BlurText from '@/components/reactbits/BlurText/BlurText';
import type { AppRoute, ProjectItem } from '@/types/project';

interface CaseDetailViewProps {
  project: ProjectItem | null;
  loading: boolean;
  onBack: () => void;
  onNavigate: (route: AppRoute) => void;
  onNotify: (msg: string) => void;
}

export function CaseDetailView({
  project,
  loading,
  onBack,
  onNavigate,
  onNotify,
}: CaseDetailViewProps) {
  const [copiedQuery, setCopiedQuery] = useState(false);

  if (loading) {
    return (
      <main className="mx-auto max-w-[900px] px-5 py-16 sm:px-8">
        <div className="h-10 w-48 rounded-lg bg-[var(--surface)]" />
        <div className="mt-6 h-72 rounded-2xl border border-[var(--hair)] bg-[var(--surface)]" />
      </main>
    );
  }

  if (!project) {
    return (
      <main className="mx-auto max-w-[900px] px-5 py-20 text-center sm:px-8">
        <h1 className="font-display text-[28px] font-semibold text-[var(--ink)]">
          Case Study Not Found
        </h1>
        <p className="mt-2 text-[15px] text-[var(--mute)]">
          The requested investigation write-up could not be found
        </p>
        <button
          type="button"
          onClick={onBack}
          className="mt-6 inline-flex items-center gap-2 rounded-lg border border-[var(--accent)] bg-[var(--accent)] px-4 py-2 text-[14px] font-semibold text-white cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
          <span>Back to Case Studies</span>
        </button>
      </main>
    );
  }

  const wordCount = [
    project.scenario,
    project.steps,
    project.analysis || '',
    project.outcomeStatus || '',
  ]
    .join(' ')
    .split(/\s+/)
    .filter(Boolean).length;
  const readMins = Math.max(3, Math.ceil(wordCount / 180));
  const analysisParagraphs = project.analysis
    ? project.analysis.split('\n\n').filter((p) => p.trim().length > 0)
    : [];

  const handleCopySnippet = async () => {
    try {
      await navigator.clipboard.writeText(project.snippet);
      setCopiedQuery(true);
      onNotify('Copied query snippet');
      window.setTimeout(() => setCopiedQuery(false), 2000);
    } catch {
      onNotify('Copy failed; select text manually');
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      onNotify('Case study link copied');
    } catch {
      onNotify('Copy link from the browser address bar');
    }
  };

  return (
    <main className="mx-auto max-w-[920px] px-5 pt-10 pb-20 sm:px-8">
      <article className="space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--hair)] bg-[var(--surface)] px-3 py-1.5 text-[13px] font-medium text-[var(--ink)] transition-colors duration-150 hover:border-[var(--ink2)] cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4 text-[var(--mute)]" strokeWidth={1.5} aria-hidden="true" />
            <span>Back to Case Studies</span>
          </button>
          <span className="font-mono-code tabular-nums text-[12px] text-[var(--mute)]">
            Estimated reading: {readMins} min &middot; Technical playbook
          </span>
        </div>

        <header className="border-b border-[var(--hair)] pb-8">
          <span className="font-mono-code mb-2 block text-[12px] font-medium text-[var(--accent-text)]">
            {project.categoryLabel}
          </span>
          <div role="heading" aria-level={1}>
            <BlurText
              text={project.title}
              trigger="load"
              animateBy="words"
              direction="top"
              delay={45}
              stepDuration={0.28}
              className="font-display m-0 text-[clamp(26px,4vw,38px)] font-semibold leading-[1.18] tracking-[-0.02em] text-[var(--ink)]"
            />
          </div>
          <p className="mt-3 mb-5 text-[16.5px] leading-relaxed text-[var(--ink2)]">
            {project.summary}
          </p>
          <div className="flex flex-wrap gap-2">
            {project.tags.map((tag) => (
              <span
                key={tag}
                className="font-mono-code rounded-md border border-[var(--hair)] bg-[var(--surface)] px-2.5 py-1 text-[12px] text-[var(--mute)]"
              >
                {tag}
              </span>
            ))}
          </div>
        </header>

        <section>
          <h2 className="font-display mb-2.5 text-[20px] font-semibold text-[var(--ink)]">
            Incident Scenario &amp; Environmental Context
          </h2>
          <p className="m-0 text-[15.5px] leading-relaxed text-[var(--ink2)]">
            {project.scenario}
          </p>
        </section>

        <section>
          <h2 className="font-display mb-2.5 text-[20px] font-semibold text-[var(--ink)]">
            Investigation Workflow
          </h2>
          <div className="whitespace-pre-line rounded-xl border border-[var(--hair)] bg-[var(--surface)] p-5 text-[14.5px] leading-7 text-[var(--ink2)]">
            {project.steps}
          </div>
        </section>

        {analysisParagraphs.length > 0 && (
          <section>
            <h2 className="font-display mb-2.5 text-[20px] font-semibold text-[var(--ink)]">
              Technical Analysis &amp; Telemetry Insights
            </h2>
            <div className="space-y-3 rounded-xl border border-[var(--hair)] border-l-[4px] border-l-[var(--accent)] bg-[var(--surface)] p-5 text-[14.5px] leading-relaxed text-[var(--ink2)]">
              {analysisParagraphs.map((para, idx) => (
                <p key={idx} className="m-0 whitespace-pre-line">
                  {para}
                </p>
              ))}
            </div>
          </section>
        )}

        <section>
          <div className="mb-2.5 flex items-center justify-between gap-2">
            <h2 className="font-display m-0 text-[20px] font-semibold text-[var(--ink)]">
              Diagnostic Query / Logic Sample
            </h2>
            <button
              type="button"
              onClick={handleCopySnippet}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--hair)] bg-[var(--surface)] px-3 py-1.5 text-[12.5px] font-medium text-[var(--ink)] transition-colors hover:border-[var(--ink2)] cursor-pointer"
            >
              {copiedQuery ? (
                <>
                  <Check className="h-3.5 w-3.5 text-[var(--emerald)]" aria-hidden="true" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Copy Query</span>
                </>
              )}
            </button>
          </div>
          <pre className="font-mono-code m-0 overflow-x-auto whitespace-pre-wrap rounded-xl border border-slate-800 bg-[#0B1120] p-4 text-[13px] leading-relaxed text-slate-200">
            {project.snippet}
          </pre>
        </section>

        {project.valueDemonstrated && project.valueDemonstrated.length > 0 && (
          <section>
            <h2 className="font-display mb-2.5 text-[20px] font-semibold text-[var(--ink)]">
              Competencies &amp; Value Demonstrated
            </h2>
            <ul className="m-0 list-none space-y-2 p-0 text-[14.5px] text-[var(--ink2)]">
              {project.valueDemonstrated.map((val, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-[var(--emerald)]" strokeWidth={1.5} aria-hidden="true" />
                  <span>{val}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {project.outcomeStatus && (
          <section className="rounded-xl border border-[var(--accent)]/40 bg-[var(--accent-soft)] p-5 text-[15px] text-[var(--ink)]">
            <h2 className="font-display mt-0 mb-1.5 text-[17px] font-semibold text-[var(--ink)]">
              Verified Disposition
            </h2>
            <p className="m-0 leading-relaxed text-[var(--ink2)]">{project.outcomeStatus}</p>
          </section>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--hair)] pt-6">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--hair)] bg-[var(--paper)] px-3.5 py-2 text-[13.5px] font-semibold text-[var(--ink)] transition-colors hover:border-[var(--ink2)] cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            <span>View All Case Studies</span>
          </button>

          <div className="flex flex-wrap gap-2.5">
            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--hair)] bg-[var(--paper)] px-3.5 py-2 text-[13.5px] font-semibold text-[var(--ink)] transition-colors hover:border-[var(--ink2)] cursor-pointer"
            >
              <Share2 className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Share Case Study</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate('contact')}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--accent)] bg-[var(--accent)] px-4 py-2 text-[13.5px] font-semibold text-white transition-colors hover:border-[var(--accent-text)] hover:bg-[var(--accent-text)] cursor-pointer"
            >
              <span>Discuss This Investigation</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </article>
    </main>
  );
}
