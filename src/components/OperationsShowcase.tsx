import { useRef, useState } from 'react';
import { ArrowRight, Pause, Play, Terminal } from 'lucide-react';
import GlareHover from '@/components/reactbits/GlareHover/GlareHover';
import { CATEGORY_MEDIA, LAB_VIDEO } from '@/data/portfolio';
import type { AppRoute, ProjectCategory } from '@/types/project';

interface OperationsShowcaseProps {
  onNavigate: (route: AppRoute, options?: { sectionId?: string; category?: string }) => void;
}

const DOMAIN_ORDER: ProjectCategory[] = ['network', 'siem', 'ai'];

export function OperationsShowcase({ onNavigate }: OperationsShowcaseProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);

  const togglePlayback = () => {
    const vid = videoRef.current;
    if (!vid) return;
    if (vid.paused) {
      void vid.play();
      setIsPlaying(true);
    } else {
      vid.pause();
      setIsPlaying(false);
    }
  };

  return (
    <section id="operations" className="border-b border-[var(--hair)] py-16">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="font-mono-code mb-2 inline-flex items-center gap-2 text-[12px] font-medium text-[var(--accent-text)]">
            <span className="h-2 w-2 rounded-full bg-[var(--emerald)]" aria-hidden="true" />
            <span>Operations desk &amp; domains</span>
          </div>
          <h2 className="font-display m-0 text-[clamp(26px,3vw,34px)] font-semibold leading-[1.15] tracking-[-0.02em] text-[var(--ink)]">
            Inside the SOC Workflow
          </h2>
          <p className="mt-2 mb-0 max-w-[56ch] text-[15px] text-[var(--mute)]">
            From packet-level perimeter validation to multi-tenant SIEM correlation and air-gapped script analysis
          </p>
        </div>

        <button
          type="button"
          onClick={() => onNavigate('investigations')}
          className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--hair)] bg-[var(--paper)] px-3.5 py-2 text-[13px] font-semibold text-[var(--ink)] transition-colors duration-150 hover:border-[var(--ink2)] cursor-pointer"
        >
          <span>Browse All Write-Ups</span>
          <ArrowRight className="h-4 w-4 text-[var(--mute)]" strokeWidth={1.5} aria-hidden="true" />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.2fr_0.9fr]">
        {/* Interactive Video Reel */}
        <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-800 bg-[#0B1120] text-slate-100">
          <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#070B14]">
            <video
              ref={videoRef}
              src={LAB_VIDEO.src}
              poster={LAB_VIDEO.poster}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              className="h-full w-full object-cover opacity-85 transition-opacity duration-300 group-hover:opacity-95"
            />
            <div
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0B1120] via-[#0B1120]/30 to-transparent"
              aria-hidden="true"
            />

            <div className="absolute top-4 right-4 left-4 flex items-center justify-between gap-2">
              <span className="font-mono-code inline-flex items-center gap-2 rounded-md border border-white/15 bg-[#0B1120]/80 px-2.5 py-1 text-[11.5px] font-medium text-slate-200 backdrop-blur-xs">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" aria-hidden="true" />
                <span>{isPlaying ? 'Live monitor loop' : 'Paused'}</span>
              </span>

              <button
                type="button"
                onClick={togglePlayback}
                aria-label={isPlaying ? 'Pause monitoring video' : 'Play monitoring video'}
                className="inline-flex h-8 items-center gap-1.5 rounded-md border border-white/15 bg-[#0B1120]/80 px-2.5 text-[12px] font-medium text-white backdrop-blur-xs transition-colors duration-150 hover:border-white/35 cursor-pointer"
              >
                {isPlaying ? (
                  <>
                    <Pause className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
                    <span>Play</span>
                  </>
                )}
              </button>
            </div>

            <div className="absolute right-5 bottom-5 left-5 flex flex-wrap items-end justify-between gap-4">
              <div>
                <span className="font-mono-code mb-1 block text-[11.5px] text-sky-300">
                  Telemetry &amp; triage environment
                </span>
                <h3 className="font-display m-0 text-[20px] font-semibold text-white">
                  {LAB_VIDEO.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('home', { sectionId: 'terminal' })}
                className="inline-flex items-center gap-1.5 rounded-lg border border-blue-400/50 bg-blue-600 px-3.5 py-2 text-[12.5px] font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] transition-colors duration-150 hover:bg-blue-500 cursor-pointer"
              >
                <Terminal className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
                <span>Open Practice Terminal</span>
              </button>
            </div>
          </div>
        </div>

        {/* 3 Editorial Photo Domain Cards */}
        <div className="flex flex-col gap-3.5">
          {DOMAIN_ORDER.map((cat) => {
            const media = CATEGORY_MEDIA[cat];
            return (
              <GlareHover
                key={cat}
                width="100%"
                height="auto"
                background="transparent"
                borderRadius="14px"
                borderColor="transparent"
                glareColor="#60A5FA"
                glareOpacity={0.2}
                glareSize={35}
                transitionDuration={550}
                className="block!"
              >
                <button
                  type="button"
                  onClick={() => onNavigate('investigations', { category: cat })}
                  className="group flex w-full items-center gap-4 overflow-hidden rounded-[14px] border border-[var(--hair)] bg-[var(--surface)] p-3 text-left transition-colors duration-150 hover:border-[var(--accent)] cursor-pointer"
                >
                  <div className="h-24 w-32 shrink-0 overflow-hidden rounded-lg border border-[var(--hair)] bg-[#0B1120] sm:w-36">
                    <img
                      src={media.image}
                      alt={media.alt}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-300 ease-[var(--ease-unslop)] group-hover:scale-105"
                    />
                  </div>
                  <div className="min-w-0 flex-1 py-1 pr-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-display text-[16px] font-semibold text-[var(--ink)] group-hover:text-[var(--accent-text)]">
                        {media.label}
                      </span>
                      <ArrowRight
                        className="h-4 w-4 shrink-0 text-[var(--mute)] transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-[var(--accent-text)]"
                        strokeWidth={1.5}
                        aria-hidden="true"
                      />
                    </div>
                    <p className="mt-1 mb-0 text-[13px] leading-snug text-[var(--ink2)]">
                      {media.subtitle}
                    </p>
                  </div>
                </button>
              </GlareHover>
            );
          })}
        </div>
      </div>
    </section>
  );
}
