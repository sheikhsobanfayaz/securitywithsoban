import { useState } from 'react';
import { Menu, Moon, Sun, X } from 'lucide-react';
import type { AppRoute } from '@/types/project';

interface HeaderProps {
  theme: 'light' | 'dark';
  activeRoute: AppRoute;
  scrollProgress: number;
  onToggleTheme: () => void;
  onNavigate: (route: AppRoute, options?: { sectionId?: string; query?: string }) => void;
}

interface NavEntry {
  route: AppRoute;
  label: string;
  href: string;
}

const NAV_ITEMS: NavEntry[] = [
  { route: 'home', label: 'Home', href: '#/' },
  { route: 'investigations', label: 'Investigations', href: '#/investigations' },
  { route: 'tools', label: 'Tools', href: '#/tools' },
  { route: 'news', label: 'News', href: '#/news' },
  { route: 'architecture', label: 'Architecture', href: '#/architecture' },
  { route: 'contact', label: 'Contact', href: '#/contact' },
];

export function Header({
  theme,
  activeRoute,
  scrollProgress,
  onToggleTheme,
  onNavigate,
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    route: AppRoute,
    sectionId?: string,
  ) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    onNavigate(route, sectionId ? { sectionId } : undefined);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--hair)] bg-[var(--paper)]/90 backdrop-blur-md">
      <div
        className="h-[2px] bg-gradient-to-r from-[var(--accent)] to-[var(--emerald)] transition-[width] duration-150"
        style={{ width: `${scrollProgress}%` }}
        aria-hidden="true"
      />
      <div className="mx-auto flex h-[68px] max-w-[1120px] items-center justify-between gap-4 px-5 sm:px-8 lg:px-12">
        <a
          href="#/"
          onClick={(e) => handleNavClick(e, 'home')}
          className="font-display flex items-center gap-2.5 text-[17px] sm:text-[18px] font-normal tracking-[-0.02em] text-[var(--ink)] no-underline whitespace-nowrap"
        >
          <span className="font-mono-code inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--hair)] bg-[var(--accent-soft)] text-[12px] font-bold text-[var(--accent-text)]">
            SF
          </span>
          <span>
            Sheikh <strong className="font-bold text-[var(--accent)]">Soban</strong> Fayaz
          </span>
        </a>

        <nav
          aria-label="Primary navigation"
          className="hidden items-center gap-5 md:flex lg:gap-6"
        >
          {NAV_ITEMS.map((item) => {
            const active = isRouteActive(item.route);
            return (
              <a
                key={item.route}
                href={item.href}
                onClick={(e) => handleNavClick(e, item.route)}
                className={`relative py-1 text-[14px] font-medium no-underline whitespace-nowrap transition-colors ${
                  active
                    ? 'text-[var(--accent-text)] font-semibold'
                    : 'text-[var(--ink2)] hover:text-[var(--accent-text)]'
                }`}
              >
                {item.label}
                {active && (
                  <span
                    className="absolute right-0 -bottom-1 left-0 h-[2px] rounded-full bg-[var(--accent)]"
                    aria-hidden="true"
                  />
                )}
              </a>
            );
          })}
        </nav>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--hair)] bg-[var(--paper)] px-3 py-1.5 text-[13px] font-semibold text-[var(--ink)] transition-colors hover:border-[var(--ink2)] cursor-pointer"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="h-3.5 w-3.5" aria-hidden="true" />
                <span className="hidden sm:inline">Light Mode</span>
                <span className="sm:hidden">Light</span>
              </>
            ) : (
              <>
                <Moon className="h-3.5 w-3.5" aria-hidden="true" />
                <span className="hidden sm:inline">Dark Mode</span>
                <span className="sm:hidden">Dark</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label="Toggle mobile navigation menu"
            aria-expanded={mobileMenuOpen}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--hair)] bg-[var(--paper)] text-[var(--ink)] transition-colors hover:border-[var(--ink2)] md:hidden cursor-pointer"
          >
            {mobileMenuOpen ? (
              <X className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Menu className="h-4 w-4" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="border-t border-[var(--hair)] bg-[var(--paper)] px-5 py-4 md:hidden">
          <nav aria-label="Mobile navigation" className="flex flex-col gap-1.5">
            {NAV_ITEMS.map((item) => {
              const active = isRouteActive(item.route);
              return (
                <a
                  key={item.route}
                  href={item.href}
                  onClick={(e) => handleNavClick(e, item.route)}
                  className={`flex items-center justify-between rounded-lg px-3.5 py-2.5 text-[14.5px] font-medium no-underline transition-colors ${
                    active
                      ? 'bg-[var(--accent-soft)] text-[var(--accent-text)] font-semibold'
                      : 'text-[var(--ink2)] hover:bg-[var(--surface)]'
                  }`}
                >
                  <span>{item.label}</span>
                  <span className="text-[12px] opacity-70">&rarr;</span>
                </a>
              );
            })}
            <div className="mt-2 grid grid-cols-2 gap-2 border-t border-[var(--hair)] pt-3">
              <a
                href="#/cc-simulator"
                onClick={(e) => handleNavClick(e, 'cc-simulator')}
                className="rounded-lg border border-[var(--hair)] bg-[var(--surface)] px-3 py-2 text-center text-[13px] font-semibold text-[var(--ink)] no-underline"
              >
                CC Practice Quiz
              </a>
              <a
                href="#/ai-sanitizer"
                onClick={(e) => handleNavClick(e, 'ai-sanitizer')}
                className="rounded-lg border border-[var(--hair)] bg-[var(--surface)] px-3 py-2 text-center text-[13px] font-semibold text-[var(--ink)] no-underline"
              >
                SanitizeAI
              </a>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
