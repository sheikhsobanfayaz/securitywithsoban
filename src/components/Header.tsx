import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  ArrowRight,
  ChevronDown,
  Menu,
  Moon,
  Search,
  Sun,
  X,
} from 'lucide-react';
import { LINKEDIN_URL } from '@/data/portfolio';
import type { AppRoute } from '@/types/project';

interface HeaderProps {
  theme: 'light' | 'dark';
  activeRoute: AppRoute;
  scrollProgress: number;
  onToggleTheme: () => void;
  onOpenSearch: () => void;
  onNavigate: (
    route: AppRoute,
    options?: { sectionId?: string; caseId?: string; category?: string },
  ) => void;
}

interface SubMenuItem {
  title: string;
  sub: string;
  route: AppRoute;
  sectionId?: string;
  category?: string;
  href: string;
}

interface NavEntry {
  route: AppRoute;
  label: string;
  href: string;
  children: SubMenuItem[];
}

const NAV_ITEMS: NavEntry[] = [
  {
    route: 'home',
    label: 'Home',
    href: '#/',
    children: [
      {
        title: 'Operations Desk & Media',
        sub: 'Live telemetry reel and domain visuals',
        route: 'home',
        sectionId: 'operations',
        href: '#operations',
      },
      {
        title: 'Practice Terminal',
        sub: 'Walk through sample alert checks step by step',
        route: 'home',
        sectionId: 'terminal',
        href: '#terminal',
      },
      {
        title: 'Background & Trajectory',
        sub: 'MSSP SOC operations and network security roots',
        route: 'home',
        sectionId: 'experience',
        href: '#experience',
      },
      {
        title: 'Featured Case Studies',
        sub: 'Filterable playbooks and triage workflows',
        route: 'home',
        sectionId: 'projects',
        href: '#projects',
      },
      {
        title: 'Attack Stages Monitored',
        sub: 'MITRE ATT&CK mapped investigation guides',
        route: 'home',
        sectionId: 'mitre',
        href: '#mitre',
      },
    ],
  },
  {
    route: 'investigations',
    label: 'Investigations',
    href: '#/investigations',
    children: [
      {
        title: 'All Write-Ups',
        sub: 'Complete 17-case investigation archive',
        route: 'investigations',
        category: 'all',
        href: '#/investigations',
      },
      {
        title: 'Network & Perimeter',
        sub: 'Firewalls, IPsec/SSL VPN, routing, and L2 bridge',
        route: 'investigations',
        category: 'network',
        href: '#/investigations?cat=network',
      },
      {
        title: 'SIEM & Detection',
        sub: 'Microsoft Sentinel, KQL, DLP, and Sysmon',
        route: 'investigations',
        category: 'siem',
        href: '#/investigations?cat=siem',
      },
      {
        title: 'AI & Automation',
        sub: 'Offline LoRA deobfuscation and triage harness',
        route: 'investigations',
        category: 'ai',
        href: '#/investigations?cat=ai',
      },
    ],
  },
  {
    route: 'tools',
    label: 'Tools',
    href: '#/tools',
    children: [
      {
        title: 'ISC2 CC Practice Quiz',
        sub: '143 exam questions with instant explanations',
        route: 'cc-simulator',
        href: '#/cc-simulator',
      },
      {
        title: 'SanitizeAI Log Cleaner',
        sub: 'Strip client names, IPs, and secrets locally',
        route: 'ai-sanitizer',
        href: '#/ai-sanitizer',
      },
      {
        title: 'All Browser Utilities',
        sub: 'Zero-backend security study and triage tools',
        route: 'tools',
        href: '#/tools',
      },
    ],
  },
  {
    route: 'news',
    label: 'News',
    href: '#/news',
    children: [
      {
        title: 'Latest Briefings',
        sub: 'Daily automated security digest',
        route: 'news',
        category: 'all',
        href: '#/news',
      },
      {
        title: 'Advisories',
        sub: 'CISA alerts and vulnerability notices',
        route: 'news',
        category: 'advisories',
        href: '#/news?cat=advisories',
      },
      {
        title: 'Threat Intel',
        sub: 'SANS ISC diaries and incident research',
        route: 'news',
        category: 'threat-intel',
        href: '#/news?cat=threat-intel',
      },
      {
        title: 'Security News',
        sub: 'Industry vulnerability and breach reporting',
        route: 'news',
        category: 'security-news',
        href: '#/news?cat=security-news',
      },
    ],
  },
  {
    route: 'architecture',
    label: 'Architecture',
    href: '#/architecture',
    children: [
      {
        title: 'Static Architecture',
        sub: 'Zero database, zero trackers, GitHub Pages',
        route: 'architecture',
        href: '#/architecture',
      },
    ],
  },
  {
    route: 'contact',
    label: 'Contact',
    href: '#/contact',
    children: [
      {
        title: 'Send a Message',
        sub: 'Direct inquiry form and copyable email',
        route: 'contact',
        href: '#/contact',
      },
    ],
  },
];

export function Header({
  theme,
  activeRoute,
  scrollProgress,
  onToggleTheme,
  onOpenSearch,
  onNavigate,
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<AppRoute | null>(null);
  const closeTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpenDropdown(null);
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const isRouteActive = (entryRoute: AppRoute) => {
    if (entryRoute === 'investigations' && activeRoute === 'case-detail') return true;
    if (
      entryRoute === 'tools' &&
      (activeRoute === 'cc-simulator' || activeRoute === 'ai-sanitizer')
    ) {
      return true;
    }
    return activeRoute === entryRoute;
  };

  const handleOpenMenu = (route: AppRoute) => {
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setOpenDropdown(route);
  };

  const handleCloseMenuDelayed = () => {
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
    }
    closeTimerRef.current = window.setTimeout(() => {
      setOpenDropdown(null);
    }, 140);
  };

  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    route: AppRoute,
    options?: { sectionId?: string; category?: string },
  ) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    setOpenDropdown(null);
    onNavigate(route, options);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--hair)] bg-[var(--paper)]/92 backdrop-blur-md">
      <div
        className="h-[2px] bg-[var(--accent)] transition-[width] duration-150 ease-[var(--ease-unslop)]"
        style={{ width: `${scrollProgress}%` }}
        aria-hidden="true"
      />
      <div className="mx-auto flex h-16 max-w-[1160px] items-center justify-between gap-4 px-5 sm:px-8 lg:px-10">
        <a
          href="#/"
          onClick={(e) => handleNavClick(e, 'home')}
          className="font-display flex items-center gap-3 text-[16px] font-medium tracking-normal text-[var(--ink)] no-underline whitespace-nowrap"
        >
          <span className="font-mono-code inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--hair)] bg-[var(--surface)] text-[12.5px] font-semibold text-[var(--accent-text)]">
            SF
          </span>
          <span className="flex flex-col leading-tight">
            <span>
              Sheikh <strong className="font-semibold text-[var(--ink)]">Soban</strong> Fayaz
            </span>
            <span className="hidden font-mono-code text-[10.5px] text-[var(--mute)] sm:block">
              SOC Analyst &middot; Network Defense
            </span>
          </span>
        </a>

        <nav
          aria-label="Primary navigation"
          className="hidden items-center gap-1 lg:flex"
        >
          {NAV_ITEMS.map((item) => {
            const active = isRouteActive(item.route);
            const hasMulti = item.children.length > 1;
            const isOpen = openDropdown === item.route;

            return (
              <div
                key={item.route}
                className="relative"
                onMouseEnter={() => hasMulti && handleOpenMenu(item.route)}
                onMouseLeave={handleCloseMenuDelayed}
              >
                <a
                  href={item.href}
                  onClick={(e) => handleNavClick(e, item.route)}
                  aria-expanded={hasMulti ? isOpen : undefined}
                  className={`relative inline-flex items-center gap-1 rounded-lg px-3 py-2 text-[13.5px] font-medium no-underline whitespace-nowrap transition-colors duration-150 ${
                    active
                      ? 'bg-[var(--surface)] text-[var(--ink)] font-semibold'
                      : 'text-[var(--mute)] hover:bg-[var(--surface)]/70 hover:text-[var(--ink)]'
                  }`}
                >
                  <span>{item.label}</span>
                  {hasMulti && (
                    <ChevronDown
                      className={`h-3.5 w-3.5 opacity-70 transition-transform duration-150 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                      strokeWidth={1.5}
                      aria-hidden="true"
                    />
                  )}
                  {active && (
                    <motion.span
                      layoutId="nav-active-bar"
                      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                      className="absolute right-2.5 bottom-0.5 left-2.5 h-[2px] rounded-full bg-[var(--accent)]"
                      aria-hidden="true"
                    />
                  )}
                </a>

                <AnimatePresence>
                  {hasMulti && isOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 4 }}
                      transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
                      role="menu"
                      className="absolute top-full left-0 z-50 mt-2 w-72 rounded-xl border border-[var(--hair)] bg-[var(--paper)] p-1.5 shadow-xl"
                    >
                      {item.children.map((sub) => (
                        <a
                          key={sub.title}
                          href={sub.href}
                          role="menuitem"
                          onClick={(e) =>
                            handleNavClick(e, sub.route, {
                              sectionId: sub.sectionId,
                              category: sub.category,
                            })
                          }
                          className="group flex items-center justify-between gap-2 rounded-lg px-3 py-2.5 no-underline transition-colors duration-150 hover:bg-[var(--surface)]"
                        >
                          <div>
                            <div className="text-[13.5px] font-semibold text-[var(--ink)] group-hover:text-[var(--accent-text)]">
                              {sub.title}
                            </div>
                            <div className="text-[12px] leading-snug text-[var(--mute)]">
                              {sub.sub}
                            </div>
                          </div>
                          <ArrowRight
                            className="h-3.5 w-3.5 shrink-0 text-[var(--mute)] opacity-0 transition-opacity duration-150 group-hover:opacity-100"
                            strokeWidth={1.5}
                            aria-hidden="true"
                          />
                        </a>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenSearch}
            aria-label="Open quick command search (Ctrl+K)"
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-[var(--hair)] bg-[var(--surface)] px-2.5 text-[12.5px] font-medium text-[var(--mute)] transition-colors duration-150 hover:border-[var(--ink2)] hover:text-[var(--ink)] cursor-pointer"
          >
            <Search className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
            <span className="hidden sm:inline">Search</span>
            <kbd className="font-mono-code hidden rounded border border-[var(--hair)] bg-[var(--paper)] px-1.5 py-0.5 text-[10.5px] md:inline">
              Ctrl K
            </kbd>
          </button>

          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[var(--hair)] bg-[var(--surface)] px-2.5 text-[13px] font-medium text-[var(--ink)] transition-colors duration-150 hover:border-[var(--ink2)] cursor-pointer"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="h-4 w-4 text-[var(--mute)]" strokeWidth={1.5} aria-hidden="true" />
                <span className="hidden xl:inline">Light</span>
              </>
            ) : (
              <>
                <Moon className="h-4 w-4 text-[var(--mute)]" strokeWidth={1.5} aria-hidden="true" />
                <span className="hidden xl:inline">Dark</span>
              </>
            )}
          </button>

          <a
            href={LINKEDIN_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn Profile"
            title="LinkedIn Profile"
            className="hidden h-9 w-9 items-center justify-center rounded-lg border border-[var(--hair)] bg-[var(--surface)] text-[var(--ink2)] transition-colors duration-150 hover:border-[var(--ink2)] hover:text-[var(--ink)] sm:inline-flex"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.45c-.88 0-1.6.72-1.6 1.6 0 .88.72 1.6 1.6 1.6.89 0 1.61-.72 1.61-1.6 0-.88-.72-1.6-1.61-1.6Z" />
            </svg>
          </a>

          <a
            href="#/contact"
            onClick={(e) => handleNavClick(e, 'contact')}
            className="hidden h-9 items-center gap-1.5 rounded-lg border border-[var(--accent)] bg-[var(--accent)] px-3.5 text-[13px] font-semibold text-white no-underline transition-colors duration-150 hover:border-[var(--accent-text)] hover:bg-[var(--accent-text)] md:inline-flex"
          >
            <span>Contact</span>
            <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
          </a>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label="Toggle mobile navigation menu"
            aria-expanded={mobileMenuOpen}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--hair)] bg-[var(--surface)] text-[var(--ink)] transition-colors duration-150 hover:border-[var(--ink2)] lg:hidden cursor-pointer"
          >
            {mobileMenuOpen ? (
              <X className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
            ) : (
              <Menu className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="max-h-[78vh] overflow-y-auto border-t border-[var(--hair)] bg-[var(--paper)] px-5 py-4 lg:hidden"
          >
            <nav aria-label="Mobile navigation" className="flex flex-col gap-3">
              {NAV_ITEMS.map((item) => {
                const active = isRouteActive(item.route);
                return (
                  <div key={item.route} className="space-y-1">
                    <a
                      href={item.href}
                      onClick={(e) => handleNavClick(e, item.route)}
                      className={`flex items-center justify-between rounded-lg px-3 py-2 text-[14.5px] font-semibold no-underline transition-colors duration-150 ${
                        active
                          ? 'bg-[var(--accent-soft)] text-[var(--accent-text)]'
                          : 'text-[var(--ink)] hover:bg-[var(--surface)]'
                      }`}
                    >
                      <span>{item.label}</span>
                      <ArrowRight className="h-4 w-4 text-[var(--mute)]" strokeWidth={1.5} aria-hidden="true" />
                    </a>
                    {item.children.length > 1 && (
                      <div className="grid grid-cols-1 gap-1 pl-3 sm:grid-cols-2">
                        {item.children.map((sub) => (
                          <a
                            key={sub.title}
                            href={sub.href}
                            onClick={(e) =>
                              handleNavClick(e, sub.route, {
                                sectionId: sub.sectionId,
                                category: sub.category,
                              })
                            }
                            className="rounded-lg border border-[var(--hair)] bg-[var(--surface)] px-3 py-2 text-[12.5px] font-medium text-[var(--ink2)] no-underline hover:border-[var(--accent)]"
                          >
                            {sub.title}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
