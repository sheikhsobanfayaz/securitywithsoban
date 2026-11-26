import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, RotateCcw, X } from 'lucide-react';
import type { AppRoute, CCQuestion } from '@/types/project';

declare global {
  interface Window {
    CC_QUESTIONS?: CCQuestion[];
  }
}

interface CCSimulatorViewProps {
  onNavigate: (route: AppRoute) => void;
}

interface RenderedOption {
  text: string;
  origIdx: number;
  isCorrect: boolean;
  whyWrong: string;
}

interface PreparedQuestion extends CCQuestion {
  renderedOptions: RenderedOption[];
  renderedCorrectIndex: number;
}

interface HistoryItem {
  question: PreparedQuestion;
  chosenIdx: number;
  isCorrect: boolean;
}

const LETTERS = ['A', 'B', 'C', 'D'];
const COUNT_PRESETS = [
  { val: 10, label: '10', sub: 'Quick' },
  { val: 25, label: '25', sub: 'Short Set' },
  { val: 50, label: '50', sub: 'Medium' },
  { val: 100, label: '100', sub: 'Full Mock' },
  { val: 999, label: 'All', sub: 'Full Bank' },
];

const DOMAIN_PILLS = [
  { id: 'all', label: 'All Topics' },
  { id: '1', label: '1. Security Basics' },
  { id: '2', label: '2. Rules & Policies' },
  { id: '3', label: '3. Logins & Access' },
  { id: '4', label: '4. Networks & Cloud' },
  { id: '5', label: '5. Handling Incidents' },
];

function shuffleArray<T>(arr: T[]): T[] {
  const copy = arr.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function decodeHtmlEntities(input: string): string {
  return input
    .replace(/&bull;/g, '·')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

function prepareQuestion(rawQ: CCQuestion, doShuffle: boolean): PreparedQuestion {
  const indexed: RenderedOption[] = rawQ.options.map((text, origIdx) => ({
    text: decodeHtmlEntities(text),
    origIdx,
    isCorrect: origIdx === rawQ.correct_index,
    whyWrong: decodeHtmlEntities(
      (rawQ.why_incorrect && rawQ.why_incorrect[String(origIdx)]) || '',
    ),
  }));
  const opts = doShuffle ? shuffleArray(indexed) : indexed;
  return {
    ...rawQ,
    question: decodeHtmlEntities(rawQ.question),
    why_correct: decodeHtmlEntities(rawQ.why_correct),
    exam_tip: rawQ.exam_tip ? decodeHtmlEntities(rawQ.exam_tip) : undefined,
    renderedOptions: opts,
    renderedCorrectIndex: opts.findIndex((o) => o.isCorrect),
  };
}

export function CCSimulatorView({ onNavigate }: CCSimulatorViewProps) {
  const [bank, setBank] = useState<CCQuestion[]>([]);
  const [loadingBank, setLoadingBank] = useState(true);

  const [view, setView] = useState<'setup' | 'quiz' | 'results'>('setup');
  const [selectedDomain, setSelectedDomain] = useState<string>('all');
  const [questionCount, setQuestionCount] = useState<number>(25);
  const [shuffleOrder, setShuffleOrder] = useState<boolean>(true);

  const [sessionQuestions, setSessionQuestions] = useState<PreparedQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [chosenIdx, setChosenIdx] = useState<number | null>(null);
  const [showAllWhy, setShowAllWhy] = useState(false);
  const [showMissedOnly, setShowMissedOnly] = useState(false);

  useEffect(() => {
    let active = true;
    import('../../assets/cc-questions.js')
      .then(() => {
        if (!active) return;
        setBank(Array.isArray(window.CC_QUESTIONS) ? window.CC_QUESTIONS : []);
      })
      .catch(() => {
        if (active) setBank([]);
      })
      .finally(() => {
        if (active) setLoadingBank(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const pool = useMemo(() => {
    if (selectedDomain === 'all') return bank;
    const dId = Number.parseInt(selectedDomain, 10);
    return bank.filter((q) => q.domain_id === dId);
  }, [bank, selectedDomain]);

  useEffect(() => {
    if (pool.length > 0 && questionCount > pool.length) {
      setQuestionCount(pool.length);
    }
  }, [pool.length, questionCount]);

  const startSession = useCallback(
    (customList?: CCQuestion[]) => {
      let source = customList || pool;
      if (source.length === 0) return;
      if (shuffleOrder) source = shuffleArray(source);
      const requested = customList
        ? source.length
        : Math.max(1, Math.min(source.length, questionCount || 25));

      setSessionQuestions(
        source.slice(0, requested).map((q) => prepareQuestion(q, shuffleOrder)),
      );
      setCurrentIdx(0);
      setHistory([]);
      setChosenIdx(null);
      setShowAllWhy(false);
      setShowMissedOnly(false);
      setView('quiz');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [pool, questionCount, shuffleOrder],
  );

  const currentQuestion = sessionQuestions[currentIdx] ?? null;
  const answered = chosenIdx !== null;
  const score = useMemo(
    () => history.filter((item) => item.isCorrect).length,
    [history],
  );

  const handleAnswer = useCallback(
    (idx: number) => {
      if (answered || !currentQuestion) return;
      const isCorrect = idx === currentQuestion.renderedCorrectIndex;
      setChosenIdx(idx);
      setHistory((prev) => [...prev, { question: currentQuestion, chosenIdx: idx, isCorrect }]);
    },
    [answered, currentQuestion],
  );

  const goNext = useCallback(() => {
    if (currentIdx + 1 < sessionQuestions.length) {
      setCurrentIdx((prev) => prev + 1);
      setChosenIdx(null);
      setShowAllWhy(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setView('results');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentIdx, sessionQuestions.length]);

  useEffect(() => {
    if (view !== 'quiz') return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (!answered && ['1', '2', '3', '4'].includes(e.key) && currentQuestion) {
        const idx = Number.parseInt(e.key, 10) - 1;
        if (idx < currentQuestion.renderedOptions.length) {
          handleAnswer(idx);
        }
      } else if (answered && e.key === 'Enter') {
        e.preventDefault();
        goNext();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [view, answered, currentQuestion, handleAnswer, goNext]);

  const domainBreakdown = useMemo(() => {
    const map: Record<string, { total: number; correct: number }> = {};
    for (const item of history) {
      const name = item.question.domain_name;
      if (!map[name]) map[name] = { total: 0, correct: 0 };
      map[name].total += 1;
      if (item.isCorrect) map[name].correct += 1;
    }
    return Object.keys(map)
      .sort()
      .map((name) => ({ name, ...map[name] }));
  }, [history]);

  const missedItems = useMemo(() => history.filter((h) => !h.isCorrect), [history]);
  const pct = history.length ? Math.round((score / history.length) * 100) : 0;

  return (
    <main className="mx-auto max-w-[900px] px-5 pt-10 pb-20 sm:px-8">
      {view === 'setup' && (
        <section className="rounded-2xl border border-[var(--hair)] bg-[var(--surface)] p-6 sm:p-8">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <span className="font-mono-code rounded-full bg-[var(--accent-soft)] px-3 py-1 text-[12px] font-medium text-[var(--accent-text)]">
              ISC2 CC Practice Quiz
            </span>
            <button
              type="button"
              onClick={() => onNavigate('tools')}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--hair)] bg-[var(--paper)] px-3 py-1.5 text-[13px] font-semibold text-[var(--ink)] transition-colors hover:border-[var(--ink2)] cursor-pointer"
            >
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
              <span>All Tools</span>
            </button>
          </div>

          <h1 className="font-display mt-0 mb-2 text-[clamp(26px,3.8vw,34px)] font-bold text-[var(--ink)]">
            ISC2 CC Practice Questions
          </h1>
          <p className="mt-0 mb-6 text-[15.5px] leading-relaxed text-[var(--ink2)]">
            Pick how many questions you want and start practicing right away. After each question, you will see if you got it right and a clear explanation why.
          </p>

          <span className="font-mono-code mb-2.5 block text-[11.5px] font-semibold uppercase tracking-wider text-[var(--accent-text)]">
            1. How many questions do you want?
          </span>

          <div className="mb-4 grid grid-cols-3 gap-2.5 sm:grid-cols-5">
            {COUNT_PRESETS.map((preset) => {
              const target = preset.val >= pool.length ? pool.length : preset.val;
              const isActive = questionCount === target && pool.length > 0;
              return (
                <button
                  key={preset.label}
                  type="button"
                  disabled={loadingBank}
                  onClick={() => setQuestionCount(target)}
                  className={`flex flex-col items-center justify-center rounded-xl border p-3 transition-colors cursor-pointer ${
                    isActive
                      ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--ink)]'
                      : 'border-[var(--hair)] bg-[var(--paper)] text-[var(--ink)] hover:border-[var(--accent)]'
                  }`}
                >
                  <strong className="font-display text-[20px] leading-tight">{preset.label}</strong>
                  <span className="font-mono-code mt-0.5 text-[11px] text-[var(--mute)]">
                    {preset.val === 999 ? `${pool.length} Bank` : preset.sub}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mb-6 flex flex-wrap items-center gap-3">
            <label htmlFor="customCountInput" className="text-[13.5px] text-[var(--ink2)]">
              Or type a number:
            </label>
            <input
              id="customCountInput"
              type="number"
              min={1}
              max={Math.max(1, pool.length)}
              value={questionCount}
              onChange={(e) => setQuestionCount(Math.max(1, Number.parseInt(e.target.value, 10) || 1))}
              className="font-mono-code w-24 rounded-lg border border-[var(--hair)] bg-[var(--paper)] px-3 py-2 text-[14px] text-[var(--ink)] focus:outline-2 focus:outline-[var(--accent)]"
            />
            <span className="font-mono-code text-[12px] text-[var(--mute)]">
              {loadingBank ? 'Loading question bank...' : `${pool.length} questions available`}
            </span>
          </div>

          <span className="font-mono-code mb-2.5 block text-[11.5px] font-semibold uppercase tracking-wider text-[var(--accent-text)]">
            2. Pick a topic (Optional)
          </span>
          <div className="mb-7 flex flex-wrap gap-2">
            {DOMAIN_PILLS.map((pill) => {
              const active = selectedDomain === pill.id;
              return (
                <button
                  key={pill.id}
                  type="button"
                  onClick={() => setSelectedDomain(pill.id)}
                  className={`font-mono-code rounded-full border px-3.5 py-1.5 text-[12px] transition-colors cursor-pointer ${
                    active
                      ? 'border-[var(--accent)] bg-[var(--accent)] text-white'
                      : 'border-[var(--hair)] bg-[var(--paper)] text-[var(--ink2)] hover:border-[var(--accent)]'
                  }`}
                >
                  {pill.id === 'all' && bank.length ? `${pill.label} (${bank.length})` : pill.label}
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[var(--hair)] pt-5">
            <label className="inline-flex items-center gap-2.5 text-[13.5px] text-[var(--ink2)] cursor-pointer select-none">
              <input
                type="checkbox"
                checked={shuffleOrder}
                onChange={(e) => setShuffleOrder(e.target.checked)}
                className="h-4 w-4 accent-[var(--accent)]"
              />
              <span>Mix up question and answer order</span>
            </label>

            <button
              type="button"
              disabled={loadingBank || pool.length === 0}
              onClick={() => startSession()}
              className="inline-flex items-center gap-2 rounded-lg border border-[var(--accent)] bg-[var(--accent)] px-5 py-2.5 text-[14px] font-semibold text-white transition-colors hover:border-[var(--accent-text)] hover:bg-[var(--accent-text)] disabled:opacity-50 cursor-pointer"
            >
              <span>Start Quiz</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </section>
      )}

      {view === 'quiz' && currentQuestion && (
        <section className="rounded-2xl border border-[var(--hair)] bg-[var(--surface)] p-6 sm:p-8">
          <div className="mb-3.5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="font-mono-code text-[12.5px] font-semibold text-[var(--accent-text)]">
                Question {currentIdx + 1} of {sessionQuestions.length}
              </span>
              <span className="font-mono-code rounded border border-[var(--hair)] bg-[var(--paper)] px-2 py-0.5 text-[11.5px] text-[var(--mute)]">
                {currentQuestion.domain_name}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-mono-code text-[12.5px] text-[var(--accent-text)]">
                Score: {score} / {history.length}
              </span>
              <button
                type="button"
                onClick={() => setView('setup')}
                className="rounded-lg border border-[var(--hair)] bg-[var(--paper)] px-3 py-1 text-[12.5px] font-semibold text-[var(--ink)] cursor-pointer"
              >
                Menu
              </button>
            </div>
          </div>

          <div className="mb-6 h-2 w-full overflow-hidden rounded-full border border-[var(--hair)] bg-[var(--paper)]">
            <div
              className="h-full bg-gradient-to-r from-[var(--accent)] to-[var(--emerald)] transition-all duration-300"
              style={{
                width: `${((currentIdx + (answered ? 1 : 0)) / sessionQuestions.length) * 100}%`,
              }}
            />
          </div>

          <h2 className="font-display mt-0 mb-5 text-[clamp(18px,2.5vw,22px)] font-semibold leading-snug text-[var(--ink)]">
            {currentQuestion.question}
          </h2>

          <div className="flex flex-col gap-2.5">
            {currentQuestion.renderedOptions.map((opt, idx) => {
              const isSelected = chosenIdx === idx;
              const isCorrectChoice = idx === currentQuestion.renderedCorrectIndex;
              let cardClass =
                'border-[var(--hair)] bg-[var(--paper)] hover:border-[var(--accent)] hover:bg-[var(--accent-soft)]';
              let badgeClass = 'border-[var(--hair)] bg-[var(--surface)] text-[var(--accent-text)]';

              if (answered) {
                if (isCorrectChoice) {
                  cardClass = 'border-emerald-500 bg-emerald-500/12';
                  badgeClass = 'border-emerald-500 bg-emerald-500 text-slate-950';
                } else if (isSelected) {
                  cardClass = 'border-rose-500 bg-rose-500/12';
                  badgeClass = 'border-rose-500 bg-rose-500 text-white';
                } else {
                  cardClass = 'border-[var(--hair)] bg-[var(--paper)] opacity-60';
                }
              }

              return (
                <button
                  key={`${currentQuestion.id}-${idx}`}
                  type="button"
                  disabled={answered}
                  onClick={() => handleAnswer(idx)}
                  className={`flex w-full items-start gap-3.5 rounded-xl border p-4 text-left text-[15px] leading-relaxed text-[var(--ink)] transition-all ${cardClass} ${
                    answered ? 'cursor-default' : 'cursor-pointer'
                  }`}
                >
                  <span
                    className={`font-mono-code mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md border text-[12.5px] font-bold ${badgeClass}`}
                  >
                    {LETTERS[idx]}
                  </span>
                  <span>{opt.text}</span>
                </button>
              );
            })}
          </div>

          {answered && chosenIdx !== null && (
            <div
              className={`mt-6 rounded-xl border p-5 ${
                chosenIdx === currentQuestion.renderedCorrectIndex
                  ? 'border-emerald-500/45 bg-emerald-500/5'
                  : 'border-rose-500/45 bg-rose-500/5'
              }`}
            >
              <div className="mb-3 flex items-center gap-2 font-display text-[17px] font-bold">
                {chosenIdx === currentQuestion.renderedCorrectIndex ? (
                  <span className="inline-flex items-center gap-1.5 text-emerald-500">
                    <Check className="h-5 w-5" aria-hidden="true" />
                    Correct ({LETTERS[currentQuestion.renderedCorrectIndex]})
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-rose-500">
                    <X className="h-5 w-5" aria-hidden="true" />
                    Not quite. The right answer is {LETTERS[currentQuestion.renderedCorrectIndex]}
                  </span>
                )}
              </div>

              {chosenIdx !== currentQuestion.renderedCorrectIndex &&
                currentQuestion.renderedOptions[chosenIdx]?.whyWrong && (
                  <div className="mb-2.5 rounded-lg border border-[var(--hair)] bg-[var(--paper)] p-3.5 text-[14px] text-[var(--ink2)]">
                    <strong className="font-mono-code mb-1 block text-[11px] uppercase tracking-wider text-rose-500">
                      Why That Answer Is Wrong
                    </strong>
                    {currentQuestion.renderedOptions[chosenIdx].whyWrong}
                  </div>
                )}

              <div className="mb-2.5 rounded-lg border border-[var(--hair)] bg-[var(--paper)] p-3.5 text-[14px] text-[var(--ink2)]">
                <strong className="font-mono-code mb-1 block text-[11px] uppercase tracking-wider text-emerald-500">
                  Why The Right Answer Works
                </strong>
                {currentQuestion.why_correct}
              </div>

              {currentQuestion.exam_tip && (
                <div className="rounded-lg border border-[var(--hair)] bg-[var(--paper)] p-3.5 text-[14px] text-[var(--ink2)]">
                  <strong className="font-mono-code mb-1 block text-[11px] uppercase tracking-wider text-[var(--accent-text)]">
                    Quick Tip
                  </strong>
                  {currentQuestion.exam_tip}
                </div>
              )}

              <div className="mt-3">
                <button
                  type="button"
                  onClick={() => setShowAllWhy((prev) => !prev)}
                  className="rounded-lg border border-[var(--hair)] bg-[var(--paper)] px-3 py-1.5 text-[12.5px] font-semibold text-[var(--ink)] cursor-pointer"
                >
                  {showAllWhy ? 'Hide other choices' : 'See why the other choices are wrong'}
                </button>

                {showAllWhy && (
                  <div className="mt-2.5 space-y-2">
                    {currentQuestion.renderedOptions.map((opt, idx) =>
                      opt.isCorrect ? null : (
                        <div
                          key={idx}
                          className="rounded-lg border border-[var(--hair)] bg-[var(--paper)] p-3 text-[13.5px] text-[var(--ink2)]"
                        >
                          <strong className="font-mono-code mb-0.5 block text-[11.5px] text-rose-500">
                            {LETTERS[idx]}. {opt.text}
                          </strong>
                          <div>{opt.whyWrong || 'Not the best fit for this question.'}</div>
                        </div>
                      ),
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--hair)] pt-4">
            <span className="font-mono-code text-[11.5px] text-[var(--mute)]">
              Shortcut: keys 1-4 to answer, Enter for next
            </span>
            {answered && (
              <button
                type="button"
                onClick={goNext}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--accent)] bg-[var(--accent)] px-4 py-2 text-[14px] font-semibold text-white cursor-pointer"
              >
                <span>
                  {currentIdx + 1 >= sessionQuestions.length
                    ? 'Finish & See Score'
                    : 'Next Question'}
                </span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            )}
          </div>
        </section>
      )}

      {view === 'results' && (
        <section className="rounded-2xl border border-[var(--hair)] bg-[var(--surface)] p-6 sm:p-8">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <span className="font-mono-code rounded-full bg-[var(--accent-soft)] px-3 py-1 text-[12px] font-medium text-[var(--accent-text)]">
              Quiz Complete
            </span>
            <button
              type="button"
              onClick={() => setView('setup')}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--hair)] bg-[var(--paper)] px-3 py-1.5 text-[13px] font-semibold text-[var(--ink)] cursor-pointer"
            >
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Pick Another Set</span>
            </button>
          </div>

          <div className="mb-6 flex flex-wrap items-center gap-6 rounded-xl border border-[var(--hair)] bg-[var(--paper)] p-5">
            <div className="flex h-24 w-24 shrink-0 flex-col items-center justify-center rounded-full border-[3px] border-[var(--accent)] bg-[var(--accent-soft)]">
              <strong className="font-display text-[26px] leading-none text-[var(--ink)]">
                {pct}%
              </strong>
              <span className="font-mono-code mt-1 text-[11px] text-[var(--ink2)]">
                {score} / {history.length}
              </span>
            </div>
            <div>
              <h2 className="font-display mt-0 mb-1.5 text-[24px] font-bold text-[var(--ink)]">
                {pct >= 70 ? 'Great job!' : 'Good practice run'}
              </h2>
              <p className="m-0 text-[14.5px] text-[var(--ink2)]">
                {pct >= 70
                  ? `You got ${pct}% (${score} out of ${history.length}), which clears the 70% passing mark.`
                  : `You got ${pct}% (${score} out of ${history.length}). Check the missed questions below and try them again to push past 70%.`}
              </p>
            </div>
          </div>

          <span className="font-mono-code mb-2.5 block text-[11.5px] font-semibold uppercase tracking-wider text-[var(--accent-text)]">
            Score by Topic
          </span>
          <div className="mb-6 space-y-2.5">
            {domainBreakdown.map((d) => {
              const dpct = Math.round((d.correct / d.total) * 100);
              return (
                <div
                  key={d.name}
                  className="rounded-xl border border-[var(--hair)] bg-[var(--paper)] p-3.5"
                >
                  <div className="mb-1.5 flex justify-between text-[13px] text-[var(--ink)]">
                    <span>{d.name}</span>
                    <strong>
                      {d.correct}/{d.total} ({dpct}%)
                    </strong>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--surface)]">
                    <div
                      className="h-full bg-gradient-to-r from-[var(--accent)] to-[var(--emerald)]"
                      style={{ width: `${dpct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mb-6 flex flex-wrap gap-2.5">
            {missedItems.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  const missedQs = missedItems
                    .map((m) => bank.find((b) => b.id === m.question.id))
                    .filter((q): q is CCQuestion => Boolean(q));
                  if (missedQs.length) startSession(missedQs);
                }}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--accent)] bg-[var(--accent)] px-4 py-2 text-[13.5px] font-semibold text-white cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Retry Missed ({missedItems.length})</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => startSession()}
              className="rounded-lg border border-[var(--hair)] bg-[var(--paper)] px-4 py-2 text-[13.5px] font-semibold text-[var(--ink)] cursor-pointer"
            >
              Try a Fresh Set
            </button>
            <button
              type="button"
              onClick={() => setShowMissedOnly((prev) => !prev)}
              className="rounded-lg border border-[var(--hair)] bg-[var(--paper)] px-4 py-2 text-[13.5px] font-semibold text-[var(--ink)] cursor-pointer"
            >
              {showMissedOnly ? 'Show All Questions' : 'Show Missed Only'}
            </button>
          </div>

          <span className="font-mono-code mb-2.5 block text-[11.5px] font-semibold uppercase tracking-wider text-[var(--accent-text)]">
            Question Review
          </span>
          <div className="space-y-3">
            {(showMissedOnly ? missedItems : history).map((item, idx) => {
              const chosenText = item.question.renderedOptions[item.chosenIdx]?.text ?? '';
              const correctText =
                item.question.renderedOptions[item.question.renderedCorrectIndex]?.text ?? '';
              return (
                <div
                  key={`${item.question.id}-${idx}`}
                  className={`rounded-xl border border-[var(--hair)] border-l-4 bg-[var(--paper)] p-4 ${
                    item.isCorrect ? 'border-l-emerald-500' : 'border-l-rose-500'
                  }`}
                >
                  <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
                    <span className="font-mono-code rounded border border-[var(--hair)] bg-[var(--surface)] px-2 py-0.5 text-[11px] text-[var(--mute)]">
                      {item.question.domain_name}
                    </span>
                    <span
                      className={`font-mono-code text-[12px] font-bold ${
                        item.isCorrect ? 'text-emerald-500' : 'text-rose-500'
                      }`}
                    >
                      {item.isCorrect ? 'RIGHT' : 'MISSED'}
                    </span>
                  </div>
                  <div className="mb-1.5 font-semibold text-[var(--ink)]">
                    {idx + 1}. {item.question.question}
                  </div>
                  <div className="mb-1 text-[13.5px] text-[var(--ink2)]">
                    <strong>Your Answer:</strong> {chosenText}
                  </div>
                  {!item.isCorrect && (
                    <div className="mb-1.5 text-[13.5px] text-emerald-500">
                      <strong>Right Answer:</strong> {correctText}
                    </div>
                  )}
                  <div className="text-[13px] leading-relaxed text-[var(--ink2)]">
                    {item.question.why_correct}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </main>
  );
}
