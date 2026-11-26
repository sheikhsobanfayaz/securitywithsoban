import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { ArrowDown, ArrowRight, Check, Copy, Eye, Search, Terminal } from 'lucide-react';
import Aurora from '@/components/reactbits/Aurora/Aurora';
import BlurText from '@/components/reactbits/BlurText/BlurText';
import ClickSpark from '@/components/reactbits/ClickSpark/ClickSpark';
import DecryptedText from '@/components/reactbits/DecryptedText/DecryptedText';
import GradientText from '@/components/reactbits/GradientText/GradientText';
import SpotlightCard from '@/components/reactbits/SpotlightCard/SpotlightCard';
import { ArchitectureView } from '@/components/ArchitectureView';
import { CaseDetailView } from '@/components/CaseDetailView';
import { CCSimulatorView } from '@/components/CCSimulatorView';
import { ContactSection } from '@/components/ContactSection';
import { ContactView } from '@/components/ContactView';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { InvestigationsView } from '@/components/InvestigationsView';
import { NewsView } from '@/components/NewsView';
import { PracticeTerminal } from '@/components/PracticeTerminal';
import { SanitizeAIView } from '@/components/SanitizeAIView';
import { ToolsView } from '@/components/ToolsView';
import { WriteUpModal } from '@/components/WriteUpModal';
import {
  CAPABILITY_GROUPS,
  CONTACT_EMAIL,
  EXPERIENCE_ITEMS,
  MITRE_STAGES,
  PLAYBOOK_STEPS,
} from '@/data/portfolio';
import type { AppRoute, ProjectCategory, ProjectItem } from '@/types/project';

type FilterValue = 'all' | ProjectCategory;

interface ParsedRoute {
  route: AppRoute;
  caseId?: string;
  category?: string;
  sectionId?: string;
}

const FILTER_OPTIONS: { value: FilterValue; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'network', label: 'Network & Perimeter' },
  { value: 'siem', label: 'SIEM & Detection' },
  { value: 'ai', label: 'AI & Automation' },
];

const HOME_SECTION_IDS = new Set([
  'top',
  'terminal',
  'experience',
  'projects',
  'mitre',
  'methodology',
  'stack',
  'contact',
]);

function parseHashLocation(hash: string): ParsedRoute {
  const cleaned = hash.replace(/^#/, '');
  if (!cleaned || cleaned === '/') {
    return { route: 'home' };
  }

  if (HOME_SECTION_IDS.has(cleaned)) {
    return { route: 'home', sectionId: cleaned };
  }

  const [rawPath, queryStr] = cleaned.split('?');
  const path = rawPath.replace(/^\/+/, '').replace(/\/+$/, '');
  const params = new URLSearchParams(queryStr || '');
  const cat = params.get('cat') || undefined;

  if (path === 'investigations') return { route: 'investigations', category: cat };
  if (path.startsWith('cases/')) {
    const id = path.slice('cases/'.length).replace(/\.html$/i, '');
    return { route: 'case-detail', caseId: id };
  }
  if (path === 'news') return { route: 'news', category: cat };
  if (path === 'tools') return { route: 'tools' };
  if (path === 'cc-simulator') return { route: 'cc-simulator' };
  if (path === 'ai-sanitizer') return { route: 'ai-sanitizer' };
  if (path === 'architecture') return { route: 'architecture' };
  if (path === 'contact') return { route: 'contact' };

  return { route: 'home' };
}

function buildHash(route: AppRoute, options?: { caseId?: string; category?: string }): string {
  switch (route) {
    case 'home':
      return '#/';
    case 'investigations':
      return options?.category ? `#/investigations?cat=${options.category}` : '#/investigations';
    case 'case-detail':
      return `#/cases/${options?.caseId || ''}`;
    case 'news':
      return options?.category ? `#/news?cat=${options.category}` : '#/news';
    case 'tools':
      return '#/tools';
    case 'cc-simulator':
      return '#/cc-simulator';
    case 'ai-sanitizer':
      return '#/ai-sanitizer';
    case 'architecture':
      return '#/architecture';
    case 'contact':
      return '#/contact';
  }
}

export function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      return localStorage.getItem('soban_theme') === 'dark' ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  });

  const [locationState, setLocationState] = useState<ParsedRoute>(() =>
    parseHashLocation(window.location.hash),
  );
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterValue>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activePlaybookIdx, setActivePlaybookIdx] = useState(0);
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    if (toastTimerRef.current !== null) {
      window.clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = window.setTimeout(() => {
      setToastMessage(null);
    }, 2600);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.setAttribute('data-theme', 'dark');
    } else {
      root.removeAttribute('data-theme');
    }
    try {
      localStorage.setItem('soban_theme', theme);
    } catch {
      // ignore storage errors
    }
  }, [theme]);

  useEffect(() => {
    const onHashChange = () => {
      const parsed = parseHashLocation(window.location.hash);
      setLocationState(parsed);
      if (parsed.sectionId) {
        window.setTimeout(() => {
          document.getElementById(parsed.sectionId!)?.scrollIntoView({ behavior: 'smooth' });
        }, 40);
      } else {
        window.scrollTo({ top: 0, behavior: 'auto' });
      }
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  useEffect(() => {
    const updateScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const docHeight =
        document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const pct = docHeight > 0 ? Math.min(100, Math.max(0, (scrollTop / docHeight) * 100)) : 0;
      setScrollProgress(pct);
    };
    updateScroll();
    window.addEventListener('scroll', updateScroll, { passive: true });
    return () => window.removeEventListener('scroll', updateScroll);
  }, []);

  useEffect(() => {
    let active = true;
    fetch('./projects.json', { cache: 'no-store' })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load projects.json');
        return res.json() as Promise<ProjectItem[]>;
      })
      .then((data) => {
        if (active && Array.isArray(data)) {
          setProjects(data);
        }
      })
      .catch(() => {
        if (active) setProjects([]);
      })
      .finally(() => {
        if (active) setLoadingProjects(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const navigate = useCallback(
    (route: AppRoute, options?: { sectionId?: string; caseId?: string; category?: string }) => {
      if (route === 'home' && options?.sectionId) {
        if (locationState.route !== 'home') {
          window.location.hash = `#/${options.sectionId === 'top' ? '' : ''}`;
          setLocationState({ route: 'home', sectionId: options.sectionId });
        }
        window.setTimeout(() => {
          document
            .getElementById(options.sectionId!)
            ?.scrollIntoView({ behavior: 'smooth' });
        }, 40);
        return;
      }

      const nextHash = buildHash(route, options);
      if (window.location.hash !== nextHash) {
        window.location.hash = nextHash;
      } else {
        setLocationState({ route, caseId: options?.caseId, category: options?.category });
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    },
    [locationState.route],
  );

  const openCaseDetail = useCallback(
    (caseId: string) => {
      navigate('case-detail', { caseId });
    },
    [navigate],
  );

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === 'light' ? 'dark' : 'light';
      showToast(next === 'dark' ? 'Dark mode enabled' : 'Light mode enabled');
      return next;
    });
  }, [showToast]);

  const copyEmail = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(CONTACT_EMAIL);
      showToast(`Copied: ${CONTACT_EMAIL}`);
    } catch {
      const el = document.createElement('textarea');
      el.value = CONTACT_EMAIL;
      document.body.appendChild(el);
      el.select();
      try {
        document.execCommand('copy');
        showToast(`Copied: ${CONTACT_EMAIL}`);
      } catch {
        showToast(`Email: ${CONTACT_EMAIL}`);
      }
      document.body.removeChild(el);
    }
  }, [showToast]);

  const filteredProjects = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = projects.filter((project) => {
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
    return activeFilter === 'all' && !q ? list.slice(0, 6) : list;
  }, [projects, activeFilter, searchQuery]);

  const activeCase = useMemo(() => {
    if (locationState.route !== 'case-detail' || !locationState.caseId) return null;
    return projects.find((p) => p.id === locationState.caseId) || null;
  }, [projects, locationState.route, locationState.caseId]);

  const activePlaybook = PLAYBOOK_STEPS[activePlaybookIdx] ?? PLAYBOOK_STEPS[0];

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
    <ClickSpark
      sparkColor={theme === 'dark' ? ['#60A5FA', '#2DD4BF'] : ['#2563EB', '#0D9488']}
      sparkSize={10}
      sparkRadius={18}
      sparkCount={8}
      duration={380}
      className="min-h-screen bg-[var(--paper)] text-[var(--ink)]"
    >
      <Header
        theme={theme}
        activeRoute={locationState.route}
        scrollProgress={scrollProgress}
        onToggleTheme={toggleTheme}
        onNavigate={navigate}
      />

      {locationState.route === 'investigations' && (
        <InvestigationsView
          theme={theme}
          projects={projects}
          loading={loadingProjects}
          initialCategory={locationState.category}
          onPreviewProject={setSelectedProject}
          onOpenCase={openCaseDetail}
        />
      )}

      {locationState.route === 'case-detail' && (
        <CaseDetailView
          project={activeCase}
          loading={loadingProjects}
          onBack={() => navigate('investigations')}
          onNavigate={navigate}
          onNotify={showToast}
        />
      )}

      {locationState.route === 'news' && (
        <NewsView theme={theme} initialCategory={locationState.category} />
      )}

      {locationState.route === 'tools' && (
        <ToolsView theme={theme} onNavigate={navigate} />
      )}

      {locationState.route === 'cc-simulator' && (
        <CCSimulatorView onNavigate={navigate} />
      )}

      {locationState.route === 'ai-sanitizer' && (
        <SanitizeAIView onNavigate={navigate} onNotify={showToast} />
      )}

      {locationState.route === 'architecture' && (
        <ArchitectureView theme={theme} onNavigate={navigate} />
      )}

      {locationState.route === 'contact' && (
        <ContactView onCopyEmail={copyEmail} onNotify={showToast} />
      )}

      {locationState.route === 'home' && (
        <>
          {/* Hero with React Bits Aurora Animated Background */}
          <section className="relative overflow-hidden border-b border-[var(--hair)]">
            <div className="pointer-events-none absolute inset-0 z-0" aria-hidden="true">
              <Aurora
                colorStops={
                  theme === 'dark'
                    ? ['#1D4ED8', '#06B6D4', '#3B82F6']
                    : ['#2563EB', '#0D9488', '#60A5FA']
                }
                amplitude={1.2}
                blend={0.6}
                speed={0.85}
                height={1.15}
                brightness={theme === 'dark' ? 1.18 : 1.05}
                opacity={theme === 'dark' ? 0.65 : 0.4}
                lightMode={theme === 'light'}
                direction="top"
                mouseInteraction
              />
              <div
                className={`absolute inset-0 ${
                  theme === 'dark'
                    ? 'bg-gradient-to-b from-[#0B0F17]/30 via-[#0B0F17]/55 to-[#0B0F17]'
                    : 'bg-gradient-to-b from-white/45 via-white/70 to-white'
                }`}
              />
            </div>

            <div
              id="top"
              className="relative z-10 mx-auto grid max-w-[1120px] grid-cols-1 items-center gap-10 px-5 pt-14 pb-14 sm:px-8 sm:pt-[72px] sm:pb-[64px] lg:grid-cols-[1.35fr_0.95fr] lg:px-12"
            >
              <div>
                <div className="font-mono-code mb-5 inline-flex items-center gap-2 rounded-full border border-[var(--accent)]/25 bg-[var(--accent-soft)]/90 px-3.5 py-1.5 text-[12.5px] font-medium text-[var(--accent-text)] backdrop-blur-xs">
                  <span
                    className="h-2 w-2 shrink-0 rounded-full bg-[var(--emerald)]"
                    aria-hidden="true"
                  />
                  <DecryptedText
                    text="MSSP SOC Analyst · ISC2 CC · Network Security"
                    animateOn="view"
                    sequential
                    speed={35}
                    revealDirection="start"
                  />
                </div>

                <div role="heading" aria-level={1} className="m-0 max-w-[19ch]">
                  <BlurText
                    text="Network security roots. Modern SOC execution."
                    trigger="load"
                    animateBy="words"
                    direction="top"
                    delay={65}
                    stepDuration={0.32}
                    className="m-0 font-display text-[clamp(36px,5vw,56px)] font-bold leading-[1.1] tracking-[-0.025em] text-[var(--ink)]"
                  />
                </div>

                <p className="mt-5 max-w-[60ch] text-[clamp(16.5px,2vw,19px)] leading-relaxed text-[var(--ink2)]">
                  I&apos;m{' '}
                  <GradientText
                    colors={
                      theme === 'dark'
                        ? ['#60A5FA', '#2DD4BF', '#93C5FD']
                        : ['#1E40AF', '#0D9488', '#2563EB']
                    }
                    animationSpeed={7}
                    className="font-display font-bold"
                  >
                    Sheikh Soban Fayaz
                  </GradientText>
                  , a Security Operations Center (SOC) analyst in an MSSP environment. Combining enterprise network security engineering roots with ISC2 Certified in Cybersecurity (CC) fundamentals, I focus on fast alert triage, endpoint-to-network correlation, and practical browser utilities.
                </p>

                <div className="mt-7 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => navigate('investigations')}
                    className="inline-flex items-center gap-2 rounded-lg border border-[var(--accent)] bg-[var(--accent)] px-[18px] py-2.5 text-[14px] font-semibold text-white transition-colors hover:border-[var(--accent-text)] hover:bg-[var(--accent-text)] cursor-pointer"
                  >
                    <span>Explore Case Studies</span>
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('home', { sectionId: 'terminal' })}
                    className="inline-flex items-center gap-2 rounded-lg border border-[var(--hair)] bg-[var(--paper)]/90 px-[18px] py-2.5 text-[14px] font-semibold text-[var(--ink)] backdrop-blur-xs transition-colors hover:border-[var(--ink2)] cursor-pointer"
                  >
                    <Terminal className="h-4 w-4" aria-hidden="true" />
                    <span>Try Practice Console</span>
                    <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={copyEmail}
                    className="inline-flex items-center gap-2 rounded-lg border border-[var(--hair)] bg-[var(--paper)]/90 px-[18px] py-2.5 text-[14px] font-semibold text-[var(--ink)] backdrop-blur-xs transition-colors hover:border-[var(--ink2)] cursor-pointer"
                  >
                    <Copy className="h-4 w-4" aria-hidden="true" />
                    <span>Copy Email</span>
                  </button>
                </div>
              </div>

              {/* Quick Jump Panel */}
              <div className="rounded-2xl border border-[var(--hair)] bg-[var(--paper)]/85 p-4 shadow-lg backdrop-blur-md sm:p-5">
                <div className="font-mono-code mb-3 border-b border-[var(--hair)] pb-2.5 text-[11.5px] font-semibold uppercase tracking-wider text-[var(--accent-text)]">
                  Quick Jump
                </div>
                <div className="flex flex-col divide-y divide-[var(--hair)]">
                  {[
                    {
                      title: 'ISC2 CC Practice Quiz',
                      sub: '143 exam questions with instant explanations',
                      action: () => navigate('cc-simulator'),
                      arrow: '->',
                    },
                    {
                      title: 'SanitizeAI Log Cleaner',
                      sub: 'Strip client names, IPs, and secrets locally',
                      action: () => navigate('ai-sanitizer'),
                      arrow: '->',
                    },
                    {
                      title: 'Cybersecurity News Feed',
                      sub: 'Daily CISA, SANS ISC, and threat intel briefings',
                      action: () => navigate('news'),
                      arrow: '->',
                    },
                    {
                      title: 'Practice Terminal',
                      sub: 'Walk through sample alert checks step by step',
                      action: () => navigate('home', { sectionId: 'terminal' }),
                      arrow: 'v',
                    },
                    {
                      title: 'Case Studies Archive',
                      sub: 'All 17 firewall, VPN, Sentinel, and AI notes',
                      action: () => navigate('investigations'),
                      arrow: '->',
                    },
                  ].map((item) => (
                    <button
                      key={item.title}
                      type="button"
                      onClick={item.action}
                      className="flex w-full items-center justify-between gap-3 py-3 text-left transition-colors hover:text-[var(--accent-text)] cursor-pointer"
                    >
                      <div>
                        <strong className="font-display block text-[14.5px] font-semibold text-[var(--ink)]">
                          {item.title}
                        </strong>
                        <small className="block text-[12.5px] text-[var(--mute)]">
                          {item.sub}
                        </small>
                      </div>
                      <span className="font-mono-code text-[13px] font-semibold text-[var(--accent-text)]">
                        {item.arrow === 'v' ? <>&darr;</> : <>&rarr;</>}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <main className="mx-auto max-w-[1120px] px-5 sm:px-8 lg:px-12">
            {/* Interactive Practice Terminal */}
            <PracticeTerminal onOpenCase={openCaseDetail} onNavigate={navigate} />

            {/* Background & Trajectory */}
            <section id="experience" className="border-b border-[var(--hair)] py-16">
              <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <h2 className="font-display m-0 text-[clamp(26px,3vw,34px)] font-semibold leading-[1.12] tracking-[-0.025em] text-[var(--ink)]">
                    Background &amp; Trajectory
                  </h2>
                  <p className="mt-1.5 mb-0 max-w-[52ch] text-[15px] text-[var(--mute)]">
                    Bridging perimeter firewall intuition with multi-tenant threat detection and response.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-7 md:grid-cols-3">
                {EXPERIENCE_ITEMS.map((item) => (
                  <div key={item.title} className="border-t-2 border-[var(--ink)] pt-[18px]">
                    <span className="font-mono-code mb-2 block text-[12px] text-[var(--accent-text)]">
                      {item.meta}
                    </span>
                    <h3 className="font-display mb-2.5 text-[19px] font-semibold text-[var(--ink)]">
                      {item.title}
                    </h3>
                    <p className="m-0 text-[15px] text-[var(--ink2)]">{item.description}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Filterable Write-Ups */}
            <section id="projects" className="border-b border-[var(--hair)] py-16">
              <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <h2 className="font-display m-0 text-[clamp(26px,3vw,34px)] font-semibold leading-[1.12] tracking-[-0.025em] text-[var(--ink)]">
                    Investigations &amp; Lab Write-Ups
                  </h2>
                  <p className="mt-1.5 mb-0 max-w-[54ch] text-[15px] text-[var(--mute)]">
                    Practical playbooks, detection logic, and triage workflows. Preview here or open the full deep-dive page.
                  </p>
                </div>

                <div className="flex w-full flex-wrap items-center justify-between gap-3 lg:w-auto">
                  <div
                    className="flex flex-wrap gap-2"
                    role="group"
                    aria-label="Filter projects by category"
                  >
                    {FILTER_OPTIONS.map((opt) => {
                      const isActive = activeFilter === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setActiveFilter(opt.value)}
                          className={`font-mono-code rounded-md border px-3 py-1.5 text-[12.5px] transition-colors cursor-pointer ${
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

                  <div className="relative w-full sm:w-64">
                    <Search
                      className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-[var(--mute)]"
                      aria-hidden="true"
                    />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search keyword or tool..."
                      aria-label="Search write-ups"
                      className="w-full rounded-lg border border-[var(--hair)] bg-[var(--paper)] py-1.5 pr-3 pl-8 text-[13.5px] text-[var(--ink)] placeholder:text-[var(--mute)] focus:outline-2 focus:outline-[var(--accent)]"
                    />
                  </div>
                </div>
              </div>

              {loadingProjects ? (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {[0, 1, 2, 3].map((idx) => (
                    <div
                      key={idx}
                      className="h-56 animate-pulse rounded-xl border border-[var(--hair)] bg-[var(--surface)] p-6"
                    />
                  ))}
                </div>
              ) : filteredProjects.length === 0 ? (
                <div className="rounded-xl border border-[var(--hair)] bg-[var(--surface)] px-6 py-12 text-center text-[15px] text-[var(--mute)]">
                  No write-ups matched your current filter or search term.
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {filteredProjects.map((project) => (
                      <SpotlightCard
                        key={project.id}
                        theme={theme}
                        spotlightColor={theme === 'dark' ? '#3B82F6' : '#2563EB'}
                        intensity={theme === 'dark' ? 0.16 : 0.1}
                        borderGlow={0.48}
                        spotlightSize={260}
                        style={spotlightStyle}
                        className="flex flex-col justify-between gap-4 rounded-xl! border! border-[var(--hair)]! p-6!"
                      >
                        <div>
                          <span className="font-mono-code mb-2 block text-[12px] text-[var(--accent-text)]">
                            {project.categoryLabel}
                          </span>
                          <h3 className="font-display mb-2.5 text-[20px] font-semibold leading-snug text-[var(--ink)]">
                            {project.title}
                          </h3>
                          <p className="m-0 text-[14.5px] text-[var(--ink2)]">
                            {project.summary}
                          </p>
                          <div className="mt-3.5 flex flex-wrap gap-1.5">
                            {project.tags.slice(0, 4).map((tag) => (
                              <span
                                key={tag}
                                className="font-mono-code rounded border border-[var(--hair)] bg-[var(--paper)] px-2 py-0.5 text-[11.5px] text-[var(--mute)]"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 border-t border-[var(--hair)] pt-3.5">
                          <button
                            type="button"
                            onClick={() => setSelectedProject(project)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--hair)] bg-[var(--paper)] px-3 py-1.5 text-[13px] font-semibold text-[var(--ink)] transition-colors hover:border-[var(--ink2)] cursor-pointer"
                          >
                            <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                            <span>Quick Preview</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => openCaseDetail(project.id)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--accent)] bg-[var(--accent)] px-3 py-1.5 text-[13px] font-semibold text-white transition-colors hover:border-[var(--accent-text)] hover:bg-[var(--accent-text)] cursor-pointer"
                          >
                            <span>Read Deep-Dive</span>
                            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                          </button>
                        </div>
                      </SpotlightCard>
                    ))}
                  </div>

                  <div className="mt-7 flex justify-end">
                    <button
                      type="button"
                      onClick={() => navigate('investigations')}
                      className="inline-flex items-center gap-2 rounded-lg border border-[var(--hair)] bg-[var(--surface)] px-4 py-2 text-[13.5px] font-semibold text-[var(--ink)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent-text)] cursor-pointer"
                    >
                      <span>View All {projects.length} Case Studies</span>
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                </>
              )}
            </section>

            {/* Attack Stages Monitored (MITRE ATT&CK) */}
            <section id="mitre" className="border-b border-[var(--hair)] py-16">
              <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <h2 className="font-display m-0 text-[clamp(26px,3vw,34px)] font-semibold leading-[1.12] tracking-[-0.025em] text-[var(--ink)]">
                    Attack Stages Monitored
                  </h2>
                  <p className="mt-1.5 mb-0 max-w-[54ch] text-[15px] text-[var(--mute)]">
                    Select an attack stage below to open a matching investigation walkthrough.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('investigations')}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--hair)] bg-[var(--paper)] px-3.5 py-2 text-[13px] font-semibold text-[var(--ink)] transition-colors hover:border-[var(--ink2)] cursor-pointer"
                >
                  <span>Explore Case Studies</span>
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {MITRE_STAGES.map((stage) => (
                  <SpotlightCard
                    key={stage.caseId}
                    theme={theme}
                    spotlightColor={theme === 'dark' ? '#0D9488' : '#2563EB'}
                    intensity={theme === 'dark' ? 0.16 : 0.09}
                    borderGlow={0.45}
                    spotlightSize={240}
                    style={spotlightStyle}
                    onClick={() => openCaseDetail(stage.caseId)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        openCaseDetail(stage.caseId);
                      }
                    }}
                    className="cursor-pointer rounded-xl! border! border-[var(--hair)]! p-5! transition-transform hover:-translate-y-0.5"
                  >
                    <h3 className="font-display mt-0 mb-1.5 text-[18px] font-semibold text-[var(--ink)]">
                      {stage.name}
                    </h3>
                    <p className="mt-0 mb-3 text-[14px] text-[var(--ink2)]">{stage.summary}</p>
                    <div className="font-mono-code text-[12px] text-[var(--accent-text)]">
                      {stage.technique} &rarr;
                    </div>
                  </SpotlightCard>
                ))}
              </div>
            </section>

            {/* Interactive Investigation Playbook */}
            <section id="methodology" className="border-b border-[var(--hair)] py-16">
              <div className="mb-8">
                <h2 className="font-display m-0 text-[clamp(26px,3vw,34px)] font-semibold leading-[1.12] tracking-[-0.025em] text-[var(--ink)]">
                  How I Investigate an Alert
                </h2>
                <p className="mt-1.5 mb-0 max-w-[56ch] text-[15px] text-[var(--mute)]">
                  Walk through each step before closing a false positive or escalating a real incident.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-[0.95fr_1.15fr]">
                <div
                  className="flex flex-col gap-2"
                  role="tablist"
                  aria-label="Investigation steps"
                >
                  {PLAYBOOK_STEPS.map((step, idx) => {
                    const isActive = idx === activePlaybookIdx;
                    return (
                      <button
                        key={step.stepTag}
                        type="button"
                        role="tab"
                        aria-selected={isActive}
                        onClick={() => setActivePlaybookIdx(idx)}
                        className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors cursor-pointer ${
                          isActive
                            ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--ink)]'
                            : 'border-[var(--hair)] bg-[var(--surface)] text-[var(--ink2)] hover:border-[var(--ink2)]'
                        }`}
                      >
                        <span
                          className={`font-mono-code inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[12px] font-bold ${
                            isActive
                              ? 'bg-[var(--accent)] text-white'
                              : 'border border-[var(--hair)] bg-[var(--paper)] text-[var(--mute)]'
                          }`}
                        >
                          {step.num}
                        </span>
                        <span className="font-display text-[14.5px] font-semibold">
                          {step.title}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div
                  aria-live="polite"
                  className="flex flex-col justify-between gap-5 rounded-2xl border border-[var(--hair)] bg-[var(--surface)] p-6 sm:p-7"
                >
                  <div>
                    <span className="font-mono-code text-[12px] font-semibold text-[var(--accent-text)]">
                      {activePlaybook.stepTag}
                    </span>
                    <h3 className="font-display mt-1.5 mb-3 text-[22px] font-semibold text-[var(--ink)]">
                      {activePlaybook.title}
                    </h3>
                    <p className="m-0 text-[15.5px] leading-relaxed text-[var(--ink2)]">
                      {activePlaybook.description}
                    </p>
                  </div>

                  <div className="font-mono-code rounded-xl border border-[var(--hair)] bg-[var(--paper)] p-4 text-[13px] leading-relaxed text-[var(--ink)]">
                    {activePlaybook.example}
                  </div>
                </div>
              </div>
            </section>

            {/* Core Capabilities */}
            <section id="stack" className="border-b border-[var(--hair)] py-16">
              <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <h2 className="font-display m-0 text-[clamp(26px,3vw,34px)] font-semibold leading-[1.12] tracking-[-0.025em] text-[var(--ink)]">
                    Core Capabilities
                  </h2>
                  <p className="mt-1.5 mb-0 max-w-[52ch] text-[15px] text-[var(--mute)]">
                    Tools and operational domains I work with across network, endpoint, and automation layers.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                {CAPABILITY_GROUPS.map((group) => (
                  <div
                    key={group.title}
                    className="rounded-xl border border-[var(--hair)] bg-[var(--surface)] p-[22px]"
                  >
                    <h3 className="font-display mb-3 text-[17px] font-semibold text-[var(--ink)]">
                      {group.title}
                    </h3>
                    <ul className="m-0 flex list-none flex-col gap-2 p-0 text-[14.5px] text-[var(--ink2)]">
                      {group.items.map((item) => (
                        <li
                          key={item.name}
                          className="flex items-center justify-between gap-2 border-b border-dashed border-[var(--hair)] pb-1.5 last:border-b-0 last:pb-0"
                        >
                          <span>{item.name}</span>
                          <span className="font-mono-code shrink-0 text-[12px] text-[var(--mute)]">
                            {item.level}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>

            {/* Contact */}
            <section id="contact" className="py-16">
              <ContactSection onCopyEmail={copyEmail} onNotify={showToast} />
            </section>
          </main>
        </>
      )}

      <Footer onNavigate={navigate} />

      <WriteUpModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
        onOpenStandalone={openCaseDetail}
        onNotify={showToast}
      />

      {/* Toast */}
      <div
        role="status"
        aria-live="polite"
        className={`fixed right-6 bottom-6 z-50 flex items-center gap-2 rounded-lg bg-[var(--ink)] px-4 py-3 text-[13.5px] font-medium text-[var(--paper)] shadow-lg transition-all duration-200 ${
          toastMessage ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-2 opacity-0'
        }`}
      >
        <Check className="h-4 w-4 text-[var(--emerald)]" aria-hidden="true" />
        <span>{toastMessage}</span>
      </div>
    </ClickSpark>
  );
}

export default App;
