import { useEffect, useState } from 'react';
import { ArrowRight, Check, Copy, X } from 'lucide-react';
import type { ProjectItem } from '@/types/project';

interface WriteUpModalProps {
  project: ProjectItem | null;
  onClose: () => void;
  onOpenStandalone: (caseId: string) => void;
  onNotify: (msg: string) => void;
}

export function WriteUpModal({
  project,
  onClose,
  onOpenStandalone,
  onNotify,
}: WriteUpModalProps) {
  const [copiedQuery, setCopiedQuery] = useState(false);

  useEffect(() => {
    setCopiedQuery(false);
    if (!project) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [project, onClose]);

  if (!project) return null;

  const handleCopySnippet = async () => {
    try {
      await navigator.clipboard.writeText(project.snippet);
      setCopiedQuery(true);
      onNotify('Copied query snippet');
      setTimeout(() => setCopiedQuery(false), 2000);
    } catch {
      onNotify('Copy failed; select text manually');
    }
  };

  const analysisParagraphs = project.analysis
    ? project.analysis.split('\n\n').filter((p) => p.trim().length > 0)
    : [];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 p-4 backdrop-blur-xs"
    >
      <div className="max-h-[86vh] w-full max-w-[720px] overflow-y-auto rounded-[14px] border border-[var(--hair)] bg-[var(--paper)] p-6 shadow-2xl sm:p-7">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <span className="font-mono-code mb-1.5 block text-[12px] text-[var(--accent-text)]">
              {project.categoryLabel}
            </span>
            <h3 id="modal-title" className="font-display text-[22px] font-semibold leading-tight text-[var(--ink)] sm:text-[24px]">
              {project.title}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-[var(--hair)] bg-[var(--paper)] px-3 py-1.5 text-[13px] font-semibold text-[var(--ink)] transition-colors hover:border-[var(--ink2)] cursor-pointer"
          >
            <X className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Close</span>
          </button>
        </div>

        <div className="space-y-5 text-[14.5px] leading-relaxed text-[var(--ink2)]">
          <div>
            <h4 className="font-display mb-1.5 text-[15px] font-semibold text-[var(--ink)]">
              Scenario
            </h4>
            <p className="m-0">{project.scenario}</p>
          </div>

          <div>
            <h4 className="font-display mb-1.5 text-[15px] font-semibold text-[var(--ink)]">
              Investigation Workflow
            </h4>
            <div className="whitespace-pre-line rounded-lg border border-[var(--hair)] bg-[var(--surface)] p-3.5 text-[14px] leading-7">
              {project.steps}
            </div>
          </div>

          {analysisParagraphs.length > 0 && (
            <div>
              <h4 className="font-display mb-1.5 text-[15px] font-semibold text-[var(--ink)]">
                Technical Analysis &amp; Telemetry Insights
              </h4>
              <div className="space-y-2.5 rounded-lg border border-[var(--hair)] border-l-[3px] border-l-[var(--accent)] bg-[var(--surface)] p-4 text-[14px]">
                {analysisParagraphs.map((para, idx) => (
                  <p key={idx} className="m-0 whitespace-pre-line">
                    {para}
                  </p>
                ))}
              </div>
            </div>
          )}

          <div>
            <div className="mb-1.5 flex items-center justify-between gap-2">
              <h4 className="font-display m-0 text-[15px] font-semibold text-[var(--ink)]">
                Query / Logic Sample
              </h4>
              <button
                type="button"
                onClick={handleCopySnippet}
                className="inline-flex items-center gap-1.5 rounded-md border border-[var(--hair)] bg-[var(--surface)] px-2.5 py-1 text-[12px] font-medium text-[var(--ink)] transition-colors hover:border-[var(--ink2)] cursor-pointer"
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
            <pre className="font-mono-code m-0 overflow-x-auto whitespace-pre-wrap rounded-lg border border-[var(--hair)] bg-[var(--surface)] p-3.5 text-[12.5px] leading-relaxed text-[var(--ink)]">
              {project.snippet}
            </pre>
          </div>

          {project.valueDemonstrated && project.valueDemonstrated.length > 0 && (
            <div>
              <h4 className="font-display mb-1.5 text-[15px] font-semibold text-[var(--ink)]">
                Competencies &amp; Value Demonstrated
              </h4>
              <ul className="m-0 list-none space-y-1.5 p-0 text-[14px]">
                {project.valueDemonstrated.map((val, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="mt-0.5 text-[var(--emerald)]" aria-hidden="true">
                      +
                    </span>
                    <span>{val}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {project.outcomeStatus && (
            <div className="rounded-lg border border-[var(--accent)]/40 bg-[var(--accent-soft)] p-3.5 text-[14px] text-[var(--ink)]">
              <strong>Disposition:</strong> {project.outcomeStatus}
            </div>
          )}

          <div className="flex justify-end border-t border-[var(--hair)] pt-4">
            <button
              type="button"
              onClick={() => {
                const id = project.id;
                onClose();
                onOpenStandalone(id);
              }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--accent)] bg-[var(--accent)] px-4 py-2 text-[13.5px] font-semibold text-white transition-colors hover:border-[var(--accent-text)] hover:bg-[var(--accent-text)] cursor-pointer"
            >
              <span>Open Full Standalone Page</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
