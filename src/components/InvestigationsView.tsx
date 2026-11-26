import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { ArrowRight, BookOpen, Eye, Search } from 'lucide-react';
import BlurText from '@/components/reactbits/BlurText/BlurText';
import SpotlightCard from '@/components/reactbits/SpotlightCard/SpotlightCard';
import { CATEGORY_MEDIA } from '@/data/portfolio';
import type { ProjectCategory, ProjectItem } from '@/types/project';

type FilterValue = 'all' | ProjectCategory;

interface InvestigationsViewProps {
  theme: 'light' | 'dark';
  projects: ProjectItem[];
  loading: boolean;
  initialCategory?: string;
  onPreviewProject: (project: ProjectItem) => void;
  onOpenCase: (caseId: string) => void;
}

const FILTER_OPTIONS: { value: FilterValue; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'network', label: 'Networks & Firewalls' },
  { value: 'siem', label: 'Alerts & Logs' },
  { value: 'ai', label: 'AI & Scripts' },
];

const TOPIC_SHORTCUTS = [
  {
    tag: 'C2 Detection',
    title: 'Command & Control',
    tech: 'T1071 · Web Protocols',
    cases: 'Sentinel C2, Sysmon 4688',
  },
  {
    tag: 'LoRA Fine-Tuning',
    title: 'AI & Deobfuscation',
    tech: 'T1027 · Obfuscated Scripts',
    cases: 'Unsloth Llama-3, AI Harness',
  },
  {
    tag: 'Port Scan',
    title: 'Discovery',
    tech: 'T1046 · Network Discovery',
    cases: 'Internal Port-Scan, WAF Recon',
  },
  {
    tag: 'DLP',
    title: 'Exfiltration',
    tech: 'T1567 · Web Service Egress',
    cases: 'Netskope DLP, IP Reputation',
  },
];

export function InvestigationsView({
  theme,
  projects,
  loading,
  initialCategory,
  onPreviewProject,
  onOpenCase,
}: InvestigationsViewProps) {
  const [activeFilter, setActiveFilter] = useState<FilterValue>(() => {
    if (
      initialCategory === 'network' ||
      initialCategory === 'siem' ||
      initialCategory === 'ai'
    ) {
      return initialCategory;
    }
    return 'all';
  });
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (
      initialCategory === 'network' ||
      initialCategory === 'siem' ||
      initialCategory === 'ai'
    ) {
      setActiveFilter(initialCategory);
    } else if (initialCategory === 'all') {
      setActiveFilter('all');
    }
  }, [initialCategory]);

  const filteredProjects = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return projects.filter((project) => {
      const matchesCategory = activeFilter === 'all' || project.category === activeFilter;
      if (!matchesCategory) return false;
      if (!q) return true;
      const haystack = [
        project.title,
        project.summary,
        project.categoryLabel,
        ...project.tags,
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [projects, activeFilter, searchQuery]);

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
      <section className="border-b border-[var(--hair)] pb-8">
        <div className="font-mono-code mb-3 inline-flex items-center gap-2 text-[12px] font-medium text-[var(--accent-text)]">
          <BookOpen className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
          <span>Case studies &amp; notes</span>
        </div>

        <div role="heading" aria-level={1}>
          <BlurText
            text="Investigations & Case Studies"
            trigger="load"
            animateBy="words"
            direction="top"
            delay={55}
            stepDuration={0.3}
            className="font-display m-0 text-[clamp(30px,4.5vw,44px)] font-semibold leading-[1.12] tracking-[-0.025em] text-[var(--ink)]"
          />
        </div>

        <p className="mt-3 max-w-[740px] text-[16px] leading-relaxed text-[var(--ink2)]">
          Real-world investigation walkthroughs covering firewall and VPN diagnostics, SIEM alert validation, and automation tooling across {projects.length || 17} documented cases.
        </p>

        <div className="mt-8 rounded-2xl border border-[var(--hair)] bg-[var(--surface)] p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <span className="font-display text-[15px] font-semibold text-[var(--ink)]">
              Quick Topic Filter
            </span>
            <span className="font-mono-code text-[12px] text-[var(--mute)]">
              Select a topic to filter
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {TOPIC_SHORTCUTS.map((topic) => (
              <button
                key={topic.tag}
                type="button"
                onClick={() => {
                  setActiveFilter('all');
                  setSearchQuery(topic.tag);
                }}
                className="rounded-xl border border-[var(--hair)] bg-[var(--paper)] p-4 text-left transition-colors duration-150 hover:border-[var(--accent)] cursor-pointer"
              >
                <div className="font-display text-[15px] font-semibold text-[var(--ink)]">
                  {topic.title}
                </div>
                <div className="font-mono-code mt-1 text-[12px] text-[var(--accent-text)]">
                  {topic.tech}
                </div>
                <div className="mt-1.5 text-[12.5px] text-[var(--mute)]">{topic.cases}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter case studies by category">
            {FILTER_OPTIONS.map((opt) => {
              const isActive = activeFilter === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setActiveFilter(opt.value)}
                  className={`font-mono-code rounded-lg border px-3 py-1.5 text-[12.5px] transition-colors duration-150 cursor-pointer ${
                    isActive
                      ? 'border-[var(--ink)] bg-[var(--ink)] text-[var(--paper)]'
                      : 'border-[var(--hair)] bg-[var(--paper)] text-[var(--ink2)] hover:border-[var(--ink2)]'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>

          <div className="relative w-full sm:w-72">
            <Search
              className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[var(--mute)]"
              strokeWidth={1.5}
              aria-hidden="true"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by tool, keyword, or indicator"
              aria-label="Search investigations"
              className="w-full rounded-lg border border-[var(--hair)] bg-[var(--paper)] py-2 pr-3 pl-9 text-[13.5px] text-[var(--ink)] placeholder:text-[var(--mute)] focus:outline-2 focus:outline-[var(--accent)]"
            />
          </div>
        </div>
      </section>

      <section className="pt-8">
        {loading ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {[0, 1, 2, 3].map((idx) => (
              <div
                key={idx}
                className="h-56 rounded-xl border border-[var(--hair)] bg-[var(--surface)]"
              />
            ))}
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="rounded-xl border border-[var(--hair)] bg-[var(--surface)] px-6 py-12 text-center text-[15px] text-[var(--mute)]">
            No investigations matched your filter criteria.{' '}
            <button
              type="button"
              onClick={() => {
                setActiveFilter('all');
                setSearchQuery('');
              }}
              className="font-semibold text-[var(--accent-text)] underline cursor-pointer"
            >
              Reset filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {filteredProjects.map((project) => {
              const media = CATEGORY_MEDIA[project.category];
              return (
                <SpotlightCard
                  key={project.id}
                  theme={theme}
                  spotlightColor={theme === 'dark' ? '#3B82F6' : '#2563EB'}
                  intensity={theme === 'dark' ? 0.1 : 0.06}
                  borderGlow={0.25}
                  spotlightSize={260}
                  style={spotlightStyle}
                  className="flex flex-col justify-between gap-4 rounded-xl! border! border-[var(--hair)]! p-0! overflow-hidden!"
                >
                  <div>
                    <div className="relative h-40 w-full overflow-hidden border-b border-[var(--hair)] bg-[#0B1120]">
                      <img
                        src={media.image}
                        alt={media.alt}
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                      <div
                        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0B1120]/85 via-[#0B1120]/15 to-transparent"
                        aria-hidden="true"
                      />
                      <span className="font-mono-code absolute bottom-3 left-4 rounded-md border border-white/15 bg-[#0B1120]/80 px-2.5 py-0.5 text-[11.5px] font-medium text-sky-300 backdrop-blur-xs">
                        {project.categoryLabel}
                      </span>
                    </div>

                    <div className="px-6 pt-5">
                      <h2 className="font-display mt-0 mb-2 text-[20px] font-semibold leading-snug text-[var(--ink)]">
                        {project.title}
                      </h2>
                      <p className="m-0 text-[14.5px] leading-relaxed text-[var(--ink2)]">
                        {project.summary}
                      </p>
                      <div className="mt-4 flex flex-wrap gap-1.5">
                        {project.tags.map((tag) => (
                          <span
                            key={tag}
                            className="font-mono-code rounded-md border border-[var(--hair)] bg-[var(--paper)] px-2 py-0.5 text-[11.5px] text-[var(--mute)]"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mx-6 mb-6 flex flex-wrap items-center gap-2 border-t border-[var(--hair)] pt-4">
                    <button
                      type="button"
                      onClick={() => onPreviewProject(project)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--hair)] bg-[var(--paper)] px-3 py-1.5 text-[13px] font-medium text-[var(--ink)] transition-colors duration-150 hover:border-[var(--ink2)] cursor-pointer"
                    >
                      <Eye className="h-4 w-4 text-[var(--mute)]" strokeWidth={1.5} aria-hidden="true" />
                      <span>Quick Preview</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onOpenCase(project.id)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--accent)] bg-[var(--accent)] px-3 py-1.5 text-[13px] font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.16)] transition-colors duration-150 hover:border-[var(--accent-text)] hover:bg-[var(--accent-text)] cursor-pointer"
                    >
                      <span>Read Deep-Dive</span>
                      <ArrowRight className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
                    </button>
                  </div>
                </SpotlightCard>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
