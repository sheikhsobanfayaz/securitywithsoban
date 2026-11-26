import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  ArrowRight,
  BookOpen,
  FileText,
  Layers,
  Mail,
  Newspaper,
  Search,
  ShieldCheck,
  Terminal,
  Wrench,
  X,
} from 'lucide-react';
import type { AppRoute, ProjectItem } from '@/types/project';

interface CommandPaletteProps {
  open: boolean;
  projects: ProjectItem[];
  onClose: () => void;
  onNavigate: (route: AppRoute, options?: { sectionId?: string; caseId?: string; category?: string }) => void;
}

interface CommandAction {
  id: string;
  group: 'Pages & Tools' | 'Sections' | 'Case Studies';
  title: string;
  subtitle: string;
  keywords: string;
  icon: 'terminal' | 'quiz' | 'shield' | 'book' | 'news' | 'layers' | 'mail' | 'case';
  run: () => void;
}

export function CommandPalette({ open, projects, onClose, onNavigate }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) {
      setQuery('');
      setActiveIdx(0);
      return;
    }
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const timer = window.setTimeout(() => inputRef.current?.focus(), 40);
    return () => {
      window.clearTimeout(timer);
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  const actions = useMemo<CommandAction[]>(() => {
    const base: CommandAction[] = [
      {
        id: 'go-terminal',
        group: 'Sections',
        title: 'Live Investigation Terminal',
        subtitle: 'Interactive SOC triage console (c2, unsloth, vpn, portscan)',
        keywords: 'terminal console cli kql c2 vpn portscan',
        icon: 'terminal',
        run: () => onNavigate('home', { sectionId: 'terminal' }),
      },
      {
        id: 'go-operations',
        group: 'Sections',
        title: 'Operations Desk & Media',
        subtitle: 'Telemetry loop video and security domain showcase',
        keywords: 'video photos media operations lab',
        icon: 'layers',
        run: () => onNavigate('home', { sectionId: 'operations' }),
      },
      {
        id: 'go-cc',
        group: 'Pages & Tools',
        title: 'ISC2 CC Practice Quiz',
        subtitle: '143 questions with instant domain explanations',
        keywords: 'quiz exam isc2 cc simulator questions',
        icon: 'quiz',
        run: () => onNavigate('cc-simulator'),
      },
      {
        id: 'go-sanitize',
        group: 'Pages & Tools',
        title: 'SanitizeAI Log Cleaner',
        subtitle: 'Client-side redaction for logs, IPs, and secrets',
        keywords: 'sanitize ai privacy cleaner redact pii logs',
        icon: 'shield',
        run: () => onNavigate('ai-sanitizer'),
      },
      {
        id: 'go-investigations',
        group: 'Pages & Tools',
        title: 'All Investigations & Case Studies',
        subtitle: `Browse all ${projects.length || 17} playbooks and write-ups`,
        keywords: 'investigations cases writeups playbooks',
        icon: 'book',
        run: () => onNavigate('investigations'),
      },
      {
        id: 'go-news',
        group: 'Pages & Tools',
        title: 'Cybersecurity News Feed',
        subtitle: 'Daily CISA advisories, SANS ISC, and threat intel',
        keywords: 'news cisa sans threat intel advisories',
        icon: 'news',
        run: () => onNavigate('news'),
      },
      {
        id: 'go-arch',
        group: 'Pages & Tools',
        title: 'Static Architecture',
        subtitle: 'Zero-tracking Vite + GitHub Pages security model',
        keywords: 'architecture vite github static privacy',
        icon: 'layers',
        run: () => onNavigate('architecture'),
      },
      {
        id: 'go-contact',
        group: 'Pages & Tools',
        title: 'Contact & Profiles',
        subtitle: 'Send a direct message, copy email, LinkedIn, Credly',
        keywords: 'contact email linkedin credly github hire',
        icon: 'mail',
        run: () => onNavigate('contact'),
      },
    ];

    const caseActions: CommandAction[] = projects.map((p) => ({
      id: `case-${p.id}`,
      group: 'Case Studies',
      title: p.title,
      subtitle: p.categoryLabel,
      keywords: [p.title, p.categoryLabel, p.summary, ...p.tags].join(' '),
      icon: 'case',
      run: () => onNavigate('case-detail', { caseId: p.id }),
    }));

    return [...base, ...caseActions];
  }, [projects, onNavigate]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return actions.slice(0, 12);
    return actions
      .filter((a) => `${a.title} ${a.subtitle} ${a.keywords}`.toLowerCase().includes(q))
      .slice(0, 14);
  }, [actions, query]);

  useEffect(() => {
    setActiveIdx(0);
  }, [query]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIdx((prev) => (filtered.length ? (prev + 1) % filtered.length : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIdx((prev) =>
          filtered.length ? (prev - 1 + filtered.length) % filtered.length : 0,
        );
      } else if (e.key === 'Enter' && filtered[activeIdx]) {
        e.preventDefault();
        filtered[activeIdx].run();
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, filtered, activeIdx, onClose]);

  const renderIcon = (kind: CommandAction['icon']) => {
    const cls = 'h-4 w-4 shrink-0 text-[var(--mute)]';
    switch (kind) {
      case 'terminal':
        return <Terminal className={cls} strokeWidth={1.5} aria-hidden="true" />;
      case 'quiz':
        return <Wrench className={cls} strokeWidth={1.5} aria-hidden="true" />;
      case 'shield':
        return <ShieldCheck className={cls} strokeWidth={1.5} aria-hidden="true" />;
      case 'book':
        return <BookOpen className={cls} strokeWidth={1.5} aria-hidden="true" />;
      case 'news':
        return <Newspaper className={cls} strokeWidth={1.5} aria-hidden="true" />;
      case 'layers':
        return <Layers className={cls} strokeWidth={1.5} aria-hidden="true" />;
      case 'mail':
        return <Mail className={cls} strokeWidth={1.5} aria-hidden="true" />;
      case 'case':
        return <FileText className={cls} strokeWidth={1.5} aria-hidden="true" />;
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
          role="dialog"
          aria-modal="true"
          aria-label="Quick command palette"
          className="fixed inset-0 z-50 flex items-start justify-center bg-slate-950/60 px-4 pt-[10vh] backdrop-blur-xs"
        >
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.99 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-[640px] overflow-hidden rounded-2xl border border-[var(--hair)] bg-[var(--paper)] shadow-2xl"
          >
            <div className="flex items-center gap-3 border-b border-[var(--hair)] px-4 py-3.5">
              <Search className="h-4 w-4 shrink-0 text-[var(--mute)]" strokeWidth={1.5} aria-hidden="true" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Jump to case study, tool, or page"
                aria-label="Command palette search"
                className="w-full bg-transparent text-[14.5px] text-[var(--ink)] placeholder:text-[var(--mute)] focus:outline-none"
              />
              <button
                type="button"
                onClick={onClose}
                aria-label="Close search"
                className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-[var(--hair)] bg-[var(--surface)] text-[var(--mute)] transition-colors hover:text-[var(--ink)] cursor-pointer"
              >
                <X className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
              </button>
            </div>

            <div className="max-h-[58vh] overflow-y-auto p-2">
              {filtered.length === 0 ? (
                <div className="px-4 py-10 text-center text-[14px] text-[var(--mute)]">
                  No matching pages, tools, or case studies
                </div>
              ) : (
                <ul className="m-0 list-none space-y-0.5 p-0">
                  {filtered.map((item, idx) => {
                    const active = idx === activeIdx;
                    return (
                      <li key={item.id}>
                        <button
                          type="button"
                          onMouseEnter={() => setActiveIdx(idx)}
                          onClick={() => {
                            item.run();
                            onClose();
                          }}
                          className={`flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left transition-colors duration-100 cursor-pointer ${
                            active
                              ? 'bg-[var(--accent-soft)] text-[var(--ink)]'
                              : 'text-[var(--ink2)] hover:bg-[var(--surface)]'
                          }`}
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            {renderIcon(item.icon)}
                            <div className="min-w-0">
                              <div className="truncate text-[13.5px] font-semibold text-[var(--ink)]">
                                {item.title}
                              </div>
                              <div className="truncate text-[12px] text-[var(--mute)]">
                                {item.subtitle}
                              </div>
                            </div>
                          </div>
                          <div className="flex shrink-0 items-center gap-2">
                            <span className="font-mono-code rounded border border-[var(--hair)] bg-[var(--paper)] px-1.5 py-0.5 text-[10.5px] text-[var(--mute)]">
                              {item.group}
                            </span>
                            {active && (
                              <ArrowRight
                                className="h-3.5 w-3.5 text-[var(--accent-text)]"
                                strokeWidth={1.5}
                                aria-hidden="true"
                              />
                            )}
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[var(--hair)] bg-[var(--surface)] px-4 py-2 text-[11.5px] text-[var(--mute)]">
              <div className="flex items-center gap-3 font-mono-code">
                <span>
                  <kbd className="rounded border border-[var(--hair)] bg-[var(--paper)] px-1.5 py-0.5">Up/Down</kbd> navigate
                </span>
                <span>
                  <kbd className="rounded border border-[var(--hair)] bg-[var(--paper)] px-1.5 py-0.5">Enter</kbd> open
                </span>
              </div>
              <span className="font-mono-code">
                <kbd className="rounded border border-[var(--hair)] bg-[var(--paper)] px-1.5 py-0.5">Esc</kbd> close
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
