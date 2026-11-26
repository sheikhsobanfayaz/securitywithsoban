import { Fragment, useMemo, useState } from 'react';
import { ArrowLeft, ChevronDown, Copy, ShieldCheck } from 'lucide-react';
import type { AppRoute } from '@/types/project';

interface SanitizeAIViewProps {
  onNavigate: (route: AppRoute) => void;
  onNotify: (msg: string) => void;
}

interface ToggleState {
  clients: boolean;
  ip: boolean;
  email: boolean;
  users: boolean;
  domains: boolean;
  creds: boolean;
  mac: boolean;
  pii: boolean;
}

const DEFAULT_SAVED_CLIENTS = ['ABC_Client', 'Acme Corp', 'Starlight Health'];
const SAMPLE_ALERT_LOG = `[SECURITY ALERT]
Source: Microsoft Sentinel
Alert: Suspicious sign-in and script activity for ABC_Client.
Computer: WS-ABC_Client-091.corp.internal (MAC: 00:1A:2B:3C:4D:5E, IP: 192.168.10.45)
External IP contacted: 198.51.100.22:443
Database Server: DB-PROD-01.abc_client.internal (IP: 10.200.4.15)

Account Info:
User Account: ABC_CLIENT\\administrator
Email: admin@abcclient.com
Contact: security-lead@abc_client.com

Credentials found in log:
AWS Key: AKIAIOSFODNN7EXAMPLE
Token: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IlNvYmFuIn0.sflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
Password: Pwd_Summer2026!BankClean

Note:
Checked traffic on ABC Client network. Device 192.168.10.45 connected to 198.51.100.22 under ABC_CLIENT\\administrator.`;

const WHITELIST_IPS = new Set(['0.0.0.0', '127.0.0.1', '255.255.255.255']);
const WHITELIST_DOMAINS = new Set([
  'microsoft.com',
  'google.com',
  'virustotal.com',
  'github.com',
  'linkedin.com',
]);

function generateClientVariations(clientName: string): string[] {
  if (!clientName || clientName.trim().length < 2) return [];
  const base = clientName.trim();
  const variations = new Set([
    base,
    base.replace(/[_-]+/g, ' '),
    base.replace(/[\s-]+/g, '_'),
    base.replace(/[\s_]+/g, '-'),
    base.replace(/[\s_-]+/g, ''),
  ]);
  const strippedSuffix = base
    .replace(
      /\b(inc|corp|corporation|llc|ltd|limited|group|bank|technologies|tech|solutions|systems|health)\b/gi,
      '',
    )
    .trim();
  if (strippedSuffix.length >= 2 && strippedSuffix !== base) {
    variations.add(strippedSuffix);
    variations.add(strippedSuffix.replace(/[_-]+/g, ' '));
    variations.add(strippedSuffix.replace(/[\s_-]+/g, ''));
    variations.add(strippedSuffix.replace(/[\s-]+/g, '_'));
    variations.add(strippedSuffix.replace(/[\s_]+/g, '-'));
  }
  return Array.from(variations)
    .filter((v) => v.length >= 2)
    .sort((a, b) => b.length - a.length);
}

const RULE_LABELS: { key: keyof ToggleState; label: string }[] = [
  { key: 'clients', label: 'Client Name' },
  { key: 'ip', label: 'IP Addresses' },
  { key: 'email', label: 'Emails' },
  { key: 'users', label: 'Usernames & IDs' },
  { key: 'domains', label: 'Internal Links & Hosts' },
  { key: 'creds', label: 'Passwords & Keys' },
  { key: 'mac', label: 'MAC Addresses' },
  { key: 'pii', label: 'Phone & Card Numbers' },
];

export function SanitizeAIView({ onNavigate, onNotify }: SanitizeAIViewProps) {
  const [targetClient, setTargetClient] = useState('ABC_Client');
  const [rawText, setRawText] = useState(SAMPLE_ALERT_LOG);
  const [isConsistentMode, setIsConsistentMode] = useState(true);
  const [lookupOpen, setLookupOpen] = useState(false);
  const [savedClients, setSavedClients] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('user_saved_client_pills');
      if (saved) {
        const parsed = JSON.parse(saved) as string[];
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore storage errors
    }
    return DEFAULT_SAVED_CLIENTS;
  });

  const [toggles, setToggles] = useState<ToggleState>({
    clients: true,
    ip: true,
    email: true,
    users: true,
    domains: true,
    creds: true,
    mac: true,
    pii: true,
  });

  const result = useMemo(() => {
    const tokenMap = new Map<string, string>();
    const reverseEntries: { token: string; type: string; original: string }[] = [];
    const counters: Record<string, number> = {
      CLIENT: 1,
      IP: 1,
      EMAIL: 1,
      USER: 1,
      DOMAIN: 1,
      KEY: 1,
      MAC: 1,
      PII: 1,
    };
    const metrics = {
      clients: 0,
      ip: 0,
      email: 0,
      users: 0,
      domains: 0,
      creds: 0,
      mac: 0,
      pii: 0,
    };

    const getToken = (originalValue: string, type: string) => {
      if (isConsistentMode) {
        const existing = tokenMap.get(originalValue);
        if (existing) return existing;
        const token = `[${type}_${counters[type]++}]`;
        tokenMap.set(originalValue, token);
        reverseEntries.push({ token, type, original: originalValue });
        return token;
      }
      return `[REDACTED_${type}]`;
    };

    let clean = rawText || '';
    if (clean) {
      if (toggles.clients && targetClient.trim().length >= 2) {
        for (const variation of generateClientVariations(targetClient)) {
          const esc = variation.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
          clean = clean.replace(new RegExp(esc, 'gi'), (matched) => {
            metrics.clients += 1;
            return getToken(matched, 'CLIENT');
          });
        }
      }

      if (toggles.creds) {
        clean = clean.replace(
          /-----BEGIN[ A-Z0-9_-]+PRIVATE KEY-----[\s\S]*?-----END[ A-Z0-9_-]+PRIVATE KEY-----/g,
          () => {
            metrics.creds += 1;
            return getToken('[CERTIFICATE_PRIVATE_KEY_BLOCK]', 'KEY');
          },
        );
        clean = clean.replace(/\beyJ[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*\b/g, (m) => {
          metrics.creds += 1;
          return getToken(m, 'KEY');
        });
        clean = clean.replace(/\bAKIA[0-9A-Z]{16}\b/g, (m) => {
          metrics.creds += 1;
          return getToken(m, 'KEY');
        });
        clean = clean.replace(
          /\b(?:bearer|token|apikey|api_key|client_secret|password|passwd|pwd)\s*[:=]\s*([A-Za-z0-9._~+/-]{8,}=*)/gi,
          (match, secretVal: string) => {
            metrics.creds += 1;
            return match.replace(secretVal, getToken(secretVal, 'KEY'));
          },
        );
      }

      if (toggles.users) {
        clean = clean.replace(/\bS-1-[0-59]-\d{2}-\d{8,10}-\d{8,10}-\d{8,10}-\d{3,5}\b/g, (m) => {
          metrics.users += 1;
          return getToken(m, 'USER');
        });
        clean = clean.replace(/\b[A-Za-z0-9_-]{2,15}\\[A-Za-z0-9._-]{2,25}\b/g, (m) => {
          metrics.users += 1;
          return getToken(m, 'USER');
        });
      }

      if (toggles.email) {
        clean = clean.replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g, (m) => {
          metrics.email += 1;
          return getToken(m, 'EMAIL');
        });
      }

      if (toggles.ip) {
        clean = clean.replace(
          /\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(?:\/\d{1,2})?\b/g,
          (m) => {
            if (WHITELIST_IPS.has(m)) return m;
            metrics.ip += 1;
            return getToken(m, 'IP');
          },
        );
        clean = clean.replace(
          /\b(?:[A-Fa-f0-9]{1,4}:){7}[A-Fa-f0-9]{1,4}\b|\b(?:[A-Fa-f0-9]{1,4}:){1,7}:|:(?::[A-Fa-f0-9]{1,4}){1,7}\b/g,
          (m) => {
            if (m === '::1') return m;
            metrics.ip += 1;
            return getToken(m, 'IP');
          },
        );
      }

      if (toggles.mac) {
        clean = clean.replace(
          /\b(?:[0-9A-Fa-f]{2}[:-]){5}(?:[0-9A-Fa-f]{2})\b|\b[0-9A-Fa-f]{4}\.[0-9A-Fa-f]{4}\.[0-9A-Fa-f]{4}\b/g,
          (m) => {
            metrics.mac += 1;
            return getToken(m, 'MAC');
          },
        );
      }

      if (toggles.domains) {
        clean = clean.replace(
          /\b[a-zA-Z0-9-]+\.(?:corp|local|internal|lan|intranet|domain|priv)\b/gi,
          (m) => {
            metrics.domains += 1;
            return getToken(m, 'DOMAIN');
          },
        );
        clean = clean.replace(/https?:\/\/[^\s/$.?#].[^\s]*/gi, (m) => {
          for (const w of WHITELIST_DOMAINS) {
            if (m.includes(w)) return m;
          }
          metrics.domains += 1;
          return getToken(m, 'DOMAIN');
        });
      }

      if (toggles.pii) {
        clean = clean.replace(/\b(?:\d{4}[-\s]?){3}\d{4}\b/g, (m) => {
          metrics.pii += 1;
          return getToken(m, 'PII');
        });
        clean = clean.replace(/\b\d{3}-\d{2}-\d{4}\b/g, (m) => {
          metrics.pii += 1;
          return getToken(m, 'PII');
        });
        clean = clean.replace(
          /\b(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g,
          (m) => {
            metrics.pii += 1;
            return getToken(m, 'PII');
          },
        );
      }
    }

    return { clean, metrics, reverseEntries };
  }, [rawText, targetClient, toggles, isConsistentMode]);

  const highlightedParts = useMemo(() => {
    if (!result.clean) return [];
    const regex =
      /(\[(?:CLIENT|IP|EMAIL|USER|DOMAIN|KEY|MAC|PII)_\d+\]|\[REDACTED_(?:CLIENT|IP|EMAIL|USER|DOMAIN|KEY|MAC|PII)\])/g;
    return result.clean.split(regex);
  }, [result.clean]);

  const lineCount = rawText ? rawText.split('\n').length : 0;

  const saveClientPill = () => {
    const val = targetClient.trim();
    if (!val) return;
    if (!savedClients.some((s) => s.toLowerCase() === val.toLowerCase())) {
      const next = [...savedClients, val];
      setSavedClients(next);
      try {
        localStorage.setItem('user_saved_client_pills', JSON.stringify(next));
      } catch {
        // ignore storage errors
      }
      onNotify(`Saved: ${val}`);
    }
  };

  const removeClientPill = (idx: number) => {
    const next = savedClients.filter((_, i) => i !== idx);
    setSavedClients(next);
    try {
      localStorage.setItem('user_saved_client_pills', JSON.stringify(next));
    } catch {
      // ignore storage errors
    }
  };

  const copyCleaned = async () => {
    if (!result.clean.trim()) {
      onNotify('Paste original text on the left first.');
      return;
    }
    try {
      await navigator.clipboard.writeText(result.clean);
      onNotify('Cleaned text copied!');
    } catch {
      onNotify('Copy failed; select text manually.');
    }
  };

  const pasteClipboard = async () => {
    try {
      const txt = await navigator.clipboard.readText();
      setRawText(txt);
    } catch {
      onNotify('Press Ctrl+V inside the left text box.');
    }
  };

  return (
    <main className="mx-auto max-w-[1120px] px-5 pt-10 pb-20 sm:px-8 lg:px-12">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="font-mono-code mb-2 inline-flex items-center gap-1.5 rounded-full bg-[var(--accent-soft)] px-3 py-1 text-[12px] font-medium text-[var(--accent-text)]">
            <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Privacy Tool &middot; Runs Locally</span>
          </span>
          <h1 className="font-display m-0 text-[clamp(26px,4vw,38px)] font-bold text-[var(--ink)]">
            SanitizeAI Log Cleaner
          </h1>
          <p className="mt-1.5 mb-0 max-w-[680px] text-[15px] text-[var(--ink2)]">
            Hide client names, IP addresses, emails, usernames, and passwords before pasting logs into AI tools. Nothing leaves your browser.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => onNavigate('tools')}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--hair)] bg-[var(--paper)] px-3 py-1.5 text-[13px] font-semibold text-[var(--ink)] cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            <span>All Tools</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setTargetClient('ABC_Client');
              setRawText(SAMPLE_ALERT_LOG);
            }}
            className="rounded-lg border border-[var(--hair)] bg-[var(--paper)] px-3 py-1.5 text-[13px] font-semibold text-[var(--ink)] cursor-pointer"
          >
            Load Example Log
          </button>
          <button
            type="button"
            onClick={copyCleaned}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--accent)] bg-[var(--accent)] px-3.5 py-1.5 text-[13px] font-semibold text-white cursor-pointer"
          >
            <Copy className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Copy Cleaned Text</span>
          </button>
        </div>
      </div>

      {/* Client name section */}
      <section className="mb-4 rounded-xl border border-[var(--hair)] border-l-4 border-l-[var(--accent)] bg-[var(--surface)] p-4 sm:p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <span className="font-mono-code text-[12px] font-semibold uppercase tracking-wider text-[var(--accent-text)]">
            Company or Client Name to Hide
          </span>
          <span className="font-mono-code rounded-full border border-emerald-500/35 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-[var(--emerald)]">
            100% Local &middot; Stays on your device
          </span>
        </div>

        <div className="mb-3 flex flex-wrap items-center gap-2.5">
          <input
            type="text"
            value={targetClient}
            onChange={(e) => setTargetClient(e.target.value)}
            placeholder="Type client name (e.g. ABC_Client, Acme Corp, Starlight Health)..."
            aria-label="Company or Client Name to Hide"
            className="min-w-[220px] flex-1 rounded-lg border border-[var(--hair)] bg-[var(--paper)] px-3.5 py-2.5 text-[14.5px] font-semibold text-[var(--ink)] placeholder:font-normal placeholder:text-[var(--mute)] focus:outline-2 focus:outline-[var(--accent)]"
          />
          <button
            type="button"
            onClick={saveClientPill}
            className="rounded-lg border border-[var(--accent)] bg-[var(--accent)] px-3.5 py-2.5 text-[13px] font-semibold text-white cursor-pointer"
          >
            + Save Quick Pick
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono-code text-[11px] uppercase text-[var(--mute)]">
            Saved Names:
          </span>
          {savedClients.map((cName, idx) => {
            const active = cName.trim().toLowerCase() === targetClient.trim().toLowerCase();
            return (
              <div
                key={cName}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[12px] font-semibold transition-colors ${
                  active
                    ? 'border-[var(--accent)] bg-[var(--accent)] text-white'
                    : 'border-[var(--hair)] bg-[var(--paper)] text-[var(--ink2)]'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setTargetClient(cName)}
                  className="cursor-pointer bg-transparent border-0 p-0 text-inherit font-inherit"
                >
                  {cName}
                </button>
                <button
                  type="button"
                  aria-label={`Remove ${cName}`}
                  onClick={() => removeClientPill(idx)}
                  className="cursor-pointer bg-transparent border-0 p-0 text-[10px] opacity-75 hover:opacity-100 text-inherit"
                >
                  &#10005;
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* Toolbar rules */}
      <section className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--hair)] bg-[var(--surface)] px-4 py-3.5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono-code text-[11px] uppercase text-[var(--mute)]">
            What to hide:
          </span>
          {RULE_LABELS.map((rule) => {
            const active = toggles[rule.key];
            return (
              <button
                key={rule.key}
                type="button"
                onClick={() =>
                  setToggles((prev) => ({ ...prev, [rule.key]: !prev[rule.key] }))
                }
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[12px] font-semibold transition-colors cursor-pointer ${
                  active
                    ? 'border-[var(--accent)]/40 bg-[var(--accent-soft)] text-[var(--accent-text)]'
                    : 'border-[var(--hair)] bg-[var(--paper)] text-[var(--mute)]'
                }`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${
                    active ? 'bg-[var(--accent)]' : 'bg-[var(--mute)]'
                  }`}
                />
                <span>{rule.label}</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <span className="font-mono-code text-[11px] uppercase text-[var(--mute)]">Style:</span>
          <div className="inline-flex rounded-full border border-[var(--hair)] bg-[var(--paper)] p-0.5">
            <button
              type="button"
              onClick={() => setIsConsistentMode(true)}
              className={`font-mono-code rounded-full px-3 py-1 text-[11.5px] font-semibold cursor-pointer ${
                isConsistentMode
                  ? 'bg-[var(--accent)] text-white'
                  : 'text-[var(--ink2)]'
              }`}
            >
              Labels [CLIENT_1]
            </button>
            <button
              type="button"
              onClick={() => setIsConsistentMode(false)}
              className={`font-mono-code rounded-full px-3 py-1 text-[11.5px] font-semibold cursor-pointer ${
                !isConsistentMode
                  ? 'bg-[var(--accent)] text-white'
                  : 'text-[var(--ink2)]'
              }`}
            >
              Blank [REDACTED]
            </button>
          </div>
        </div>
      </section>

      {/* Dual pane editor */}
      <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="flex min-h-[420px] flex-col overflow-hidden rounded-xl border border-[var(--hair)] bg-[var(--surface)]">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--hair)] bg-[var(--paper)] px-4 py-3">
            <span className="text-[13.5px] font-bold text-[var(--ink)]">
              Original Text (Paste Log or Alert)
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono-code rounded-full border border-[var(--hair)] bg-[var(--surface)] px-2.5 py-0.5 text-[11px] text-[var(--ink2)]">
                {rawText.length} chars &middot; {lineCount} lines
              </span>
              <button
                type="button"
                onClick={pasteClipboard}
                className="rounded-md border border-[var(--hair)] bg-[var(--surface)] px-2.5 py-1 text-[12px] font-semibold text-[var(--ink)] cursor-pointer"
              >
                Paste
              </button>
              <button
                type="button"
                onClick={() => setRawText('')}
                className="rounded-md border border-[var(--hair)] bg-[var(--surface)] px-2.5 py-1 text-[12px] font-semibold text-[var(--ink)] cursor-pointer"
              >
                Clear
              </button>
            </div>
          </div>

          <textarea
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            placeholder="Paste any log, alert, or note here. Private details are hidden right away as you type."
            aria-label="Original log text"
            className="font-mono-code min-h-[340px] w-full flex-1 resize-y border-0 bg-transparent p-4 text-[13px] leading-relaxed text-[var(--ink)] placeholder:text-[var(--mute)] focus:outline-none"
          />
        </div>

        <div className="flex min-h-[420px] flex-col overflow-hidden rounded-xl border border-[var(--hair)] bg-[var(--surface)]">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--hair)] bg-[var(--paper)] px-4 py-3">
            <span className="text-[13.5px] font-bold text-[var(--accent-text)]">
              Cleaned Output (Safe to Share)
            </span>
            <button
              type="button"
              onClick={copyCleaned}
              className="rounded-md border border-[var(--accent)] bg-[var(--accent)] px-3 py-1 text-[12px] font-semibold text-white cursor-pointer"
            >
              Copy Cleaned Text
            </button>
          </div>

          <div className="font-mono-code min-h-[340px] flex-1 overflow-y-auto p-4 text-[13px] leading-relaxed whitespace-pre-wrap break-words text-[var(--ink)]">
            {result.clean ? (
              highlightedParts.map((part, idx) => {
                if (
                  /^\[(?:CLIENT|IP|EMAIL|USER|DOMAIN|KEY|MAC|PII)_\d+\]$|^\[REDACTED_(?:CLIENT|IP|EMAIL|USER|DOMAIN|KEY|MAC|PII)\]$/.test(
                    part,
                  )
                ) {
                  const isClient = part.includes('CLIENT');
                  return (
                    <span
                      key={idx}
                      className={`inline-block rounded px-1.5 py-0.5 text-[12px] font-semibold leading-tight ${
                        isClient
                          ? 'border border-rose-500/45 bg-rose-500/15 text-rose-500'
                          : 'border border-[var(--accent)]/40 bg-[var(--accent-soft)] text-[var(--accent-text)]'
                      }`}
                    >
                      {part}
                    </span>
                  );
                }
                return <Fragment key={idx}>{part}</Fragment>;
              })
            ) : (
              <span className="text-[var(--mute)]">Cleaned text will appear here...</span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 border-t border-[var(--hair)] bg-[var(--paper)] px-4 py-2.5">
            <span className="font-mono-code text-[11px] uppercase text-[var(--mute)]">
              Hidden:
            </span>
            {[
              ['Clients', result.metrics.clients],
              ['IPs', result.metrics.ip],
              ['Emails', result.metrics.email],
              ['Users', result.metrics.users],
              ['Hosts', result.metrics.domains],
              ['Keys', result.metrics.creds],
              ['MACs', result.metrics.mac],
              ['Personal Info', result.metrics.pii],
            ].map(([label, val]) => (
              <span
                key={String(label)}
                className="font-mono-code rounded-full border border-[var(--hair)] bg-[var(--surface)] px-2.5 py-0.5 text-[11px] text-[var(--ink2)]"
              >
                {label}: <strong className="text-[var(--accent-text)]">{val}</strong>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Lookup Table */}
      <section className="rounded-xl border border-[var(--hair)] bg-[var(--surface)] px-5 py-4">
        <button
          type="button"
          onClick={() => setLookupOpen((prev) => !prev)}
          className="flex w-full items-center justify-between text-left text-[14px] font-bold text-[var(--ink)] cursor-pointer"
        >
          <span>Placeholder Lookup Table ({result.reverseEntries.length} items hidden)</span>
          <ChevronDown
            className={`h-4 w-4 transition-transform duration-200 ${
              lookupOpen ? 'rotate-180' : ''
            }`}
            aria-hidden="true"
          />
        </button>

        {lookupOpen && (
          <div className="mt-3 border-t border-[var(--hair)] pt-3">
            <p className="mt-0 mb-3 text-[12.5px] text-[var(--ink2)]">
              Kept only in this browser tab so you can look up what{' '}
              <code className="font-mono-code">[CLIENT_1]</code> or{' '}
              <code className="font-mono-code">[IP_1]</code> originally stood for.
            </p>
            <div className="max-h-60 overflow-y-auto">
              <table className="font-mono-code w-full border-collapse text-[12.5px]">
                <thead>
                  <tr className="border-b border-[var(--hair)] text-left text-[11px] uppercase text-[var(--mute)]">
                    <th className="px-2.5 py-2">Placeholder</th>
                    <th className="px-2.5 py-2">Type</th>
                    <th className="px-2.5 py-2">Original Value</th>
                  </tr>
                </thead>
                <tbody>
                  {result.reverseEntries.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="py-4 text-center text-[var(--mute)]">
                        Nothing hidden yet.
                      </td>
                    </tr>
                  ) : (
                    result.reverseEntries.map((entry) => (
                      <tr key={entry.token} className="border-b border-[var(--hair)]/60">
                        <td className="px-2.5 py-2">
                          <span
                            className={`inline-block rounded px-1.5 py-0.5 text-[11.5px] font-semibold ${
                              entry.type === 'CLIENT'
                                ? 'border border-rose-500/45 bg-rose-500/15 text-rose-500'
                                : 'border border-[var(--accent)]/40 bg-[var(--accent-soft)] text-[var(--accent-text)]'
                            }`}
                          >
                            {entry.token}
                          </span>
                        </td>
                        <td className="px-2.5 py-2 font-bold text-[var(--ink2)]">
                          {entry.type}
                        </td>
                        <td className="px-2.5 py-2 text-[var(--ink)]">{entry.original}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
