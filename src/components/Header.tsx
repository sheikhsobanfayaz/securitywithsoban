import { Moon, Sun } from 'lucide-react';

interface HeaderProps {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

const NAV_ITEMS = [
  { href: '#experience', label: 'Background', mobileVisible: true },
  { href: '#methodology', label: 'Methodology', mobileVisible: false },
  { href: '#projects', label: 'Write-Ups', mobileVisible: true },
  { href: '#stack', label: 'Stack', mobileVisible: true },
  { href: '#contact', label: 'Contact', mobileVisible: true },
];

export function Header({ theme, onToggleTheme }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--hair)] bg-[var(--paper)]/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1120px] flex-wrap items-center justify-between gap-x-4 gap-y-2.5 px-5 py-3 sm:flex-nowrap sm:px-8 sm:py-0 sm:h-[68px] lg:px-12">
        <a
          href="#top"
          className="font-display text-[18px] font-normal tracking-[-0.02em] text-[var(--ink)] no-underline whitespace-nowrap"
        >
          Sheikh <strong className="font-bold text-[var(--accent)]">Soban</strong> Fayaz
        </a>

        <nav
          aria-label="Primary navigation"
          className="order-3 flex w-full items-center justify-between gap-3 border-t border-[var(--hair)] pt-2.5 sm:order-2 sm:w-auto sm:justify-center sm:gap-6 sm:border-t-0 sm:pt-0"
        >
          {NAV_ITEMS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={`text-[13.5px] sm:text-[14px] font-medium text-[var(--ink2)] no-underline whitespace-nowrap transition-colors hover:text-[var(--accent-text)] ${
                item.mobileVisible ? 'inline-block' : 'hidden md:inline-block'
              }`}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="order-2 flex items-center gap-2.5 sm:order-3">
          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--hair)] bg-[var(--paper)] px-3 py-1.5 text-[13px] font-semibold text-[var(--ink)] transition-colors hover:border-[var(--ink2)] cursor-pointer"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Light Mode</span>
              </>
            ) : (
              <>
                <Moon className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Dark Mode</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
