import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type FormEvent } from 'react';
import { ArrowRight, ArrowUp, Check, Copy, ExternalLink, Mail, Search, Send } from 'lucide-react';
import BlurText from '@/components/reactbits/BlurText/BlurText';
import SpotlightCard from '@/components/reactbits/SpotlightCard/SpotlightCard';
import DecryptedText from '@/components/reactbits/DecryptedText/DecryptedText';
import { Header } from '@/components/Header';
import { WriteUpModal } from '@/components/WriteUpModal';
import {
  CAPABILITY_GROUPS,
  CONTACT_EMAIL,
  CREDLY_URL,
  EXPERIENCE_ITEMS,
  GITHUB_URL,
  LINKEDIN_URL,
  METHODOLOGY_ITEMS,
} from '@/data/portfolio';
import type { ProjectCategory, ProjectItem } from '@/types/project';

type FilterValue = 'all' | ProjectCategory;

const FILTER_OPTIONS: { value: FilterValue; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'network', label: 'Network & Perimeter' },
  { value: 'siem', label: 'SIEM & Detection' },
  { value: 'ai', label: 'AI & Automation' },
];

export function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      return localStorage.getItem('soban_theme') === 'dark' ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  });

  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterValue>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  const [senderName, setSenderName] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [senderSubject, setSenderSubject] = useState('');
  const [senderMessage, setSenderMessage] = useState('');
  const [botcheck, setBotcheck] = useState(false);
  const [submittingForm, setSubmittingForm] = useState(false);
  const [formFeedback, setFormFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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

  const handleContactSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!senderName.trim() || !senderEmail.trim() || !senderMessage.trim()) return;

    setSubmittingForm(true);
    setFormFeedback(null);

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          access_key: 'bb11ccaa-8374-47cb-99f2-45f0dd87c217',
          from_name: 'Portfolio Contact Form',
          name: senderName.trim(),
          email: senderEmail.trim(),
          replyto: senderEmail.trim(),
          subject: senderSubject.trim()
            ? `[Portfolio] ${senderSubject.trim()}`
            : `[Portfolio] Message from ${senderName.trim()}`,
          message: senderMessage.trim(),
          botcheck,
        }),
      });
      const data = (await response.json()) as { success?: boolean; message?: string };
      if (response.ok && data.success) {
        setSenderName('');
        setSenderEmail('');
        setSenderSubject('');
        setSenderMessage('');
        setFormFeedback({
          type: 'success',
          text: 'Message delivered directly to my inbox. Thank you for reaching out.',
        });
        showToast('Message delivered directly!');
      } else {
        throw new Error(data.message || 'Submission failed');
      }
    } catch {
      setFormFeedback({
        type: 'error',
        text: `Could not deliver automatically right now. Please email ${CONTACT_EMAIL} directly.`,
      });
      showToast('Delivery issue. Use Copy Email to reach out.');
    } finally {
      setSubmittingForm(false);
    }
  };

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
    <div className="min-h-screen bg-[var(--paper)] text-[var(--ink)]">
      <Header theme={theme} onToggleTheme={toggleTheme} />

      <main id="top" className="mx-auto max-w-[1120px] px-5 sm:px-8 lg:px-12">
        {/* Hero */}
        <section className="border-b border-[var(--hair)] pt-14 pb-14 sm:pt-[72px] sm:pb-[56px]">
          <div className="font-mono-code mb-5 inline-flex items-center gap-2 rounded-full bg-[var(--accent-soft)] px-3 py-1.5 text-[12.5px] font-medium text-[var(--accent-text)]">
            <span className="h-2 w-2 shrink-0 rounded-full bg-[var(--emerald)]" aria-hidden="true" />
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
              className="m-0 font-display text-[clamp(36px,5vw,56px)] font-bold leading-[1.12] tracking-[-0.025em] text-[var(--ink)]"
            />
          </div>

          <p className="mt-5 max-w-[60ch] text-[clamp(17px,2vw,19.5px)] leading-relaxed text-[var(--ink2)]">
            I&apos;m Sheikh <strong className="font-bold text-[var(--ink)]">Soban</strong> Fayaz, a Security Operations Center (SOC) analyst in an MSSP environment. Combining hands-on enterprise network security experience with ISC2 Certified in Cybersecurity (CC) fundamentals, I focus on fast alert triage, endpoint-to-network correlation, and practical AI-assisted workflows.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <a
              href="#projects"
              className="inline-flex items-center gap-2 rounded-lg border border-[var(--accent)] bg-[var(--accent)] px-[18px] py-2.5 text-[14px] font-semibold text-white no-underline transition-colors hover:border-[var(--accent-text)] hover:bg-[var(--accent-text)]"
            >
              <span>Explore Case Studies</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
            <button
              type="button"
              onClick={copyEmail}
              className="inline-flex items-center gap-2 rounded-lg border border-[var(--hair)] bg-[var(--paper)] px-[18px] py-2.5 text-[14px] font-semibold text-[var(--ink)] transition-colors hover:border-[var(--ink2)] cursor-pointer"
            >
              <Copy className="h-4 w-4" aria-hidden="true" />
              <span>Copy Email</span>
            </button>
          </div>
        </section>

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

        {/* SecOps & Investigation Methodology */}
        <section id="methodology" className="border-b border-[var(--hair)] py-16">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="font-display m-0 text-[clamp(26px,3vw,34px)] font-semibold leading-[1.12] tracking-[-0.025em] text-[var(--ink)]">
                SecOps &amp; Investigation Methodology
              </h2>
              <p className="mt-1.5 mb-0 max-w-[56ch] text-[15px] text-[var(--mute)]">
                A structured, evidence-driven approach connecting network telemetry, endpoint events, and SIEM detections.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {METHODOLOGY_ITEMS.map((item) => (
              <div
                key={item.title}
                className="flex flex-col rounded-xl border border-[var(--hair)] bg-[var(--surface)] p-[22px]"
              >
                <span className="font-mono-code text-[12px] text-[var(--accent-text)]">
                  {item.meta}
                </span>
                <h3 className="font-display mt-2 mb-2.5 text-[17px] font-semibold text-[var(--ink)]">
                  {item.title}
                </h3>
                <p className="m-0 text-[14px] leading-relaxed text-[var(--ink2)]">
                  {item.description}
                </p>
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
                Practical playbooks, detection logic, and triage workflows. Click any card to inspect the full write-up.
              </p>
            </div>

            <div className="flex w-full flex-wrap items-center justify-between gap-3 lg:w-auto">
              <div className="flex flex-wrap gap-2" role="group" aria-label="Filter projects by category">
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
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {filteredProjects.map((project) => (
                <SpotlightCard
                  key={project.id}
                  theme={theme}
                  spotlightColor={theme === 'dark' ? '#3B82F6' : '#2563EB'}
                  intensity={theme === 'dark' ? 0.14 : 0.08}
                  borderGlow={0.45}
                  spotlightSize={260}
                  style={spotlightStyle}
                  className="flex flex-col justify-between gap-4 rounded-xl! p-6!"
                >
                  <div>
                    <span className="font-mono-code mb-2 block text-[12px] text-[var(--accent-text)]">
                      {project.categoryLabel}
                    </span>
                    <h3 className="font-display mb-2.5 text-[20px] font-semibold leading-snug text-[var(--ink)]">
                      {project.title}
                    </h3>
                    <p className="m-0 text-[14.5px] text-[var(--ink2)]">{project.summary}</p>
                    <div className="mt-3.5 flex flex-wrap gap-1.5">
                      {project.tags.map((tag) => (
                        <span
                          key={tag}
                          className="font-mono-code rounded border border-[var(--hair)] bg-[var(--paper)] px-2 py-0.5 text-[11.5px] text-[var(--mute)]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => setSelectedProject(project)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--hair)] bg-[var(--paper)] px-3 py-1.5 text-[13px] font-semibold text-[var(--ink)] transition-colors hover:border-[var(--ink2)] cursor-pointer"
                    >
                      <span>Read Write-Up</span>
                      <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  </div>
                </SpotlightCard>
              ))}
            </div>
          )}
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
        <section id="contact" className="border-b border-[var(--hair)] py-16">
          <div className="grid grid-cols-1 items-start gap-9 lg:grid-cols-[1fr_1.2fr]">
            <div>
              <h2 className="font-display m-0 text-[clamp(26px,3vw,34px)] font-semibold leading-[1.12] tracking-[-0.025em] text-[var(--ink)]">
                Get in Touch
              </h2>
              <p className="mt-2 mb-0 max-w-[52ch] text-[15px] text-[var(--mute)]">
                Open to connecting with security teams, MSSP leads, and detection engineers across India, the UAE, and remote global teams.
              </p>

              <div className="mt-5 flex flex-col gap-2.5 text-[15px] text-[var(--ink2)]">
                <div className="flex flex-wrap items-center gap-2">
                  <strong className="text-[var(--ink)]">Email:</strong>
                  <span className="font-mono-code text-[14px] text-[var(--accent-text)]">
                    {CONTACT_EMAIL}
                  </span>
                </div>
                <div>
                  <strong className="text-[var(--ink)]">Focus:</strong> Security Operations · Network Defense · Threat Intelligence
                </div>
                <div>
                  <strong className="text-[var(--ink)]">Location:</strong> Jammu and Kashmir, India
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-2.5">
                <button
                  type="button"
                  onClick={copyEmail}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--hair)] bg-[var(--paper)] px-3.5 py-2 text-[13px] font-semibold text-[var(--ink)] transition-colors hover:border-[var(--ink2)] cursor-pointer"
                >
                  <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Copy Email Address</span>
                </button>
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--hair)] bg-[var(--paper)] px-3.5 py-2 text-[13px] font-semibold text-[var(--ink)] no-underline transition-colors hover:border-[var(--ink2)]"
                >
                  <Mail className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Open Mail Client</span>
                </a>
              </div>

              <div className="mt-6 flex flex-wrap gap-4 text-[13.5px] font-medium">
                <a
                  href={LINKEDIN_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[var(--accent-text)] no-underline hover:underline"
                >
                  <span>LinkedIn</span>
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
                <a
                  href={CREDLY_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[var(--accent-text)] no-underline hover:underline"
                >
                  <span>Credly ISC2 CC Badge</span>
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
                <a
                  href={GITHUB_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[var(--accent-text)] no-underline hover:underline"
                >
                  <span>GitHub</span>
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
              </div>
            </div>

            <form
              onSubmit={handleContactSubmit}
              className="flex flex-col gap-3.5 rounded-xl border border-[var(--hair)] bg-[var(--surface)] p-6"
            >
              <input
                type="checkbox"
                name="botcheck"
                checked={botcheck}
                onChange={(e) => setBotcheck(e.target.checked)}
                tabIndex={-1}
                autoComplete="off"
                className="hidden"
              />
              <div>
                <label htmlFor="senderName" className="mb-1.5 block text-[13px] font-semibold text-[var(--ink)]">
                  Name
                </label>
                <input
                  id="senderName"
                  type="text"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  placeholder="Your name"
                  required
                  className="w-full rounded-lg border border-[var(--hair)] bg-[var(--paper)] px-3 py-2.5 text-[14.5px] text-[var(--ink)] placeholder:text-[var(--mute)] focus:outline-2 focus:outline-[var(--accent)]"
                />
              </div>
              <div>
                <label htmlFor="senderEmail" className="mb-1.5 block text-[13px] font-semibold text-[var(--ink)]">
                  Email
                </label>
                <input
                  id="senderEmail"
                  type="email"
                  value={senderEmail}
                  onChange={(e) => setSenderEmail(e.target.value)}
                  placeholder="you@company.com"
                  required
                  className="w-full rounded-lg border border-[var(--hair)] bg-[var(--paper)] px-3 py-2.5 text-[14.5px] text-[var(--ink)] placeholder:text-[var(--mute)] focus:outline-2 focus:outline-[var(--accent)]"
                />
              </div>
              <div>
                <label htmlFor="senderTopic" className="mb-1.5 block text-[13px] font-semibold text-[var(--ink)]">
                  Topic (Optional)
                </label>
                <input
                  id="senderTopic"
                  type="text"
                  value={senderSubject}
                  onChange={(e) => setSenderSubject(e.target.value)}
                  placeholder="Role opportunity, project inquiry, or technical question"
                  className="w-full rounded-lg border border-[var(--hair)] bg-[var(--paper)] px-3 py-2.5 text-[14.5px] text-[var(--ink)] placeholder:text-[var(--mute)] focus:outline-2 focus:outline-[var(--accent)]"
                />
              </div>
              <div>
                <label htmlFor="senderMsg" className="mb-1.5 block text-[13px] font-semibold text-[var(--ink)]">
                  Message
                </label>
                <textarea
                  id="senderMsg"
                  rows={4}
                  value={senderMessage}
                  onChange={(e) => setSenderMessage(e.target.value)}
                  placeholder="Role, project, or security topic..."
                  required
                  className="w-full rounded-lg border border-[var(--hair)] bg-[var(--paper)] px-3 py-2.5 text-[14.5px] text-[var(--ink)] placeholder:text-[var(--mute)] focus:outline-2 focus:outline-[var(--accent)]"
                />
              </div>
              <button
                type="submit"
                disabled={submittingForm}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-[var(--accent)] bg-[var(--accent)] px-[18px] py-2.5 text-[14px] font-semibold text-white transition-colors hover:border-[var(--accent-text)] hover:bg-[var(--accent-text)] disabled:opacity-60 cursor-pointer"
              >
                <Send className="h-4 w-4" aria-hidden="true" />
                <span>{submittingForm ? 'Sending...' : 'Send Message'}</span>
              </button>

              {formFeedback && (
                <div
                  aria-live="polite"
                  className={`rounded-lg border px-3.5 py-2.5 text-[13.5px] ${
                    formFeedback.type === 'success'
                      ? 'border-emerald-500/40 bg-emerald-500/10 text-[var(--ink)]'
                      : 'border-red-500/40 bg-red-500/10 text-[var(--ink)]'
                  }`}
                >
                  {formFeedback.text}
                </div>
              )}
            </form>
          </div>
        </section>

        {/* Footer */}
        <footer className="flex flex-wrap items-center justify-between gap-3 pt-8 pb-12 text-[13.5px] text-[var(--mute)]">
          <span>
            &copy; 2026 Sheikh <strong className="font-bold text-[var(--ink)]">Soban</strong> Fayaz · Security Operations Portfolio
          </span>
          <div className="flex items-center gap-4">
            <span className="font-mono-code">ISC2 CC · Network &amp; SOC</span>
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
        </footer>
      </main>

      <WriteUpModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
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
    </div>
  );
}

export default App;
