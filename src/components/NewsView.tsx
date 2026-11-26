import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { ExternalLink, Newspaper, Search } from 'lucide-react';
import BlurText from '@/components/reactbits/BlurText/BlurText';
import SpotlightCard from '@/components/reactbits/SpotlightCard/SpotlightCard';
import type { NewsCategorySlug, NewsFeedPayload, NewsItem } from '@/types/project';

type NewsFilter = 'all' | NewsCategorySlug;

interface NewsViewProps {
  theme: 'light' | 'dark';
  initialCategory?: string;
}

const NEWS_FILTERS: { value: NewsFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'advisories', label: 'Advisories' },
  { value: 'threat-intel', label: 'Threat Intel' },
  { value: 'security-news', label: 'Security News' },
];

function safeExternalUrl(url: string): string {
  const clean = String(url || '').trim();
  return clean.startsWith('https://') || clean.startsWith('http://') ? clean : '#';
}

function formatUpdatedTimestamp(iso?: string): string {
  if (!iso) return 'Unavailable';
  const dt = new Date(iso);
  if (Number.isNaN(dt.getTime())) return iso;
  return dt.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  });
}

export function NewsView({ theme, initialCategory }: NewsViewProps) {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [generatedAt, setGeneratedAt] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeFilter, setActiveFilter] = useState<NewsFilter>(() => {
    if (
      initialCategory === 'advisories' ||
      initialCategory === 'threat-intel' ||
      initialCategory === 'security-news'
    ) {
      return initialCategory;
    }
    return 'all';
  });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (
      initialCategory === 'advisories' ||
      initialCategory === 'threat-intel' ||
      initialCategory === 'security-news'
    ) {
      setActiveFilter(initialCategory);
    } else if (initialCategory === 'all') {
      setActiveFilter('all');
    }
  }, [initialCategory]);

  useEffect(() => {
    let active = true;
    fetch(`./news.json?t=${Date.now()}`, { cache: 'no-store' })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<NewsFeedPayload>;
      })
      .then((data) => {
        if (!active) return;
        setItems(Array.isArray(data.items) ? data.items.slice(0, 15) : []);
        setGeneratedAt(data.generated_at || '');
        setError(false);
      })
      .catch(() => {
        if (!active) return;
        setItems([]);
        setError(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const filteredItems = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return items
      .filter((item) => {
        const matchCat = activeFilter === 'all' || item.category_slug === activeFilter;
        if (!matchCat) return false;
        if (!q) return true;
        const haystack = [item.title, item.summary, item.source, item.category]
          .join(' ')
          .toLowerCase();
        return haystack.includes(q);
      })
      .slice(0, 15);
  }, [items, activeFilter, searchTerm]);

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
          <Newspaper className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
          <span>Daily intelligence feed</span>
        </div>

        <div role="heading" aria-level={1}>
          <BlurText
            text="Daily Cybersecurity News"
            trigger="load"
            animateBy="words"
            direction="top"
            delay={55}
            stepDuration={0.3}
            className="font-display m-0 text-[clamp(30px,4.5vw,44px)] font-semibold leading-[1.12] tracking-[-0.025em] text-[var(--ink)]"
          />
        </div>

        <p className="mt-3 max-w-[760px] text-[16px] leading-relaxed text-[var(--ink2)]">
          Curated advisories, threat intelligence, and defensive security reporting aggregated daily from CISA, SANS ISC, Krebs on Security, BleepingComputer, The Hacker News, and Dark Reading.
        </p>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <div className="font-mono-code inline-flex items-center gap-2 rounded-lg border border-[var(--hair)] bg-[var(--surface)] px-3 py-1.5 text-[12px] text-[var(--ink2)]">
            <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden="true" />
            <span>
              Last updated:{' '}
              <strong className="font-medium text-[var(--ink)]">
                {loading ? 'Loading' : error ? 'Unavailable' : formatUpdatedTimestamp(generatedAt)}
              </strong>
            </span>
          </div>
          <span className="font-mono-code tabular-nums text-[12.5px] text-[var(--mute)]">
            {loading
              ? 'Fetching latest briefings'
              : error
                ? 'Could not load feed'
                : filteredItems.length === 1
                  ? 'Showing 1 story'
                  : `Showing ${filteredItems.length} stories`}
          </span>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter news by category">
            {NEWS_FILTERS.map((opt) => {
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

          <div className="relative w-full sm:w-80">
            <Search
              className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[var(--mute)]"
              strokeWidth={1.5}
              aria-hidden="true"
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search headlines, CVEs, or sources"
              aria-label="Search cybersecurity news"
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
                className="h-52 rounded-xl border border-[var(--hair)] bg-[var(--surface)]"
              />
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="rounded-xl border border-[var(--hair)] bg-[var(--surface)] px-6 py-12 text-center text-[15px] text-[var(--mute)]">
            {error
              ? 'Unable to load daily news right now. Please try refreshing shortly.'
              : 'No cybersecurity briefings matched your current filter or search term'}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {filteredItems.map((item) => (
              <SpotlightCard
                key={`${item.link}-${item.title}`}
                theme={theme}
                spotlightColor={theme === 'dark' ? '#3B82F6' : '#2563EB'}
                intensity={theme === 'dark' ? 0.1 : 0.06}
                borderGlow={0.25}
                spotlightSize={260}
                style={spotlightStyle}
                className="flex flex-col justify-between gap-4 rounded-xl! border! border-[var(--hair)]! p-6!"
              >
                <div>
                  <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2">
                    <span className="font-mono-code text-[12px] font-medium text-[var(--accent-text)]">
                      {item.source}
                    </span>
                    <span className="font-mono-code tabular-nums text-[11.5px] text-[var(--mute)]">
                      {item.published_display || item.published}
                    </span>
                  </div>
                  <h2 className="font-display mt-0 mb-2 text-[19px] font-semibold leading-snug text-[var(--ink)]">
                    {item.title}
                  </h2>
                  <p className="m-0 text-[14.5px] leading-relaxed text-[var(--ink2)]">
                    {item.summary}
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--hair)] pt-4">
                  <span className="font-mono-code rounded-md border border-[var(--hair)] bg-[var(--paper)] px-2.5 py-0.5 text-[11.5px] text-[var(--mute)]">
                    {item.category}
                  </span>
                  <a
                    href={safeExternalUrl(item.link)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--accent)] bg-[var(--accent)] px-3 py-1.5 text-[13px] font-semibold text-white no-underline transition-colors duration-150 hover:border-[var(--accent-text)] hover:bg-[var(--accent-text)]"
                  >
                    <span>Read Article</span>
                    <ExternalLink className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
                  </a>
                </div>
              </SpotlightCard>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
