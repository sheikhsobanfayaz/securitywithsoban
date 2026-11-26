export interface ExperienceItem {
  meta: string;
  title: string;
  description: string;
}

export interface MethodologyItem {
  meta: string;
  title: string;
  description: string;
}

export interface CapabilityGroup {
  title: string;
  items: { name: string; level: string }[];
}

export const EXPERIENCE_ITEMS: ExperienceItem[] = [
  {
    meta: 'CURRENT · MSSP ENVIRONMENT',
    title: 'SOC Analyst',
    description:
      'Monitoring multi-tenant SIEM and EDR queues, validating true-positive incidents against MITRE ATT&CK, and writing clear client-ready escalation reports under strict SLAs.',
  },
  {
    meta: 'PRIOR · NETWORK SECURITY',
    title: 'Network Security Engineer',
    description:
      'Enterprise firewall troubleshooting, NAT translations, site-to-site IPsec and SSL VPN tunnels, Layer 2 bridge interfaces, and physical hardware diagnostics for perimeter defense.',
  },
  {
    meta: 'CREDENTIALS · ACTIVE STUDY',
    title: 'ISC2 CC & Detection',
    description:
      'ISC2 Certified in Cybersecurity (CC) holder, actively advancing through CompTIA Security+ (V8), Sigma rule engineering, and Python log automation.',
  },
];

export const METHODOLOGY_ITEMS: MethodologyItem[] = [
  {
    meta: 'TRIAGE & SCOPING',
    title: 'Alert Triage & Context Discovery',
    description:
      'Review alert severity, affected hosts, users, indicators, and timestamps. Prioritize investigations based on verifiable threat telemetry rather than assuming every alert is a compromise.',
  },
  {
    meta: 'SIEM & LOG ANALYTICS',
    title: 'Microsoft Sentinel & KQL Analysis',
    description:
      'Scope investigations across lookback windows using KQL. Correlate user sessions, application activity, IP reputation, and build accurate multi-source event timelines.',
  },
  {
    meta: 'CROSS-TELEMETRY',
    title: 'Endpoint & Network Correlation',
    description:
      'Differentiate endpoint connection states from perimeter firewall disposition. Validate whether connections were allowed, denied, or dropped by matching CommonSecurityLog records with host process events.',
  },
  {
    meta: 'DATA LOSS PREVENTION',
    title: 'Cloud DLP & User Justification',
    description:
      'Triage cloud DLP alerts across file repositories. Evaluate self-reported user justification strings against verified enterprise policies, sensitive data classifications, and authorized channels.',
  },
  {
    meta: 'WEB DEFENSE',
    title: 'WAF & Reconnaissance Analysis',
    description:
      'Inspect web application attack traffic targeting sensitive directories, credentials, and API endpoints. Separate automated vulnerability scanner sweeps from confirmed application impact.',
  },
  {
    meta: 'REPORTING & HANDOVER',
    title: 'Evidence Collection & Escalation',
    description:
      'Distinguish observed facts from unconfirmed assumptions. Document technical timelines, preserve forensic evidence, and escalate actionable incident reports under strict SLAs.',
  },
];

export const CAPABILITY_GROUPS: CapabilityGroup[] = [
  {
    title: 'Network & Perimeter',
    items: [
      { name: 'Enterprise Firewalls & NAT', level: 'Production' },
      { name: 'IPsec & Enterprise SSL VPN', level: 'Production' },
      { name: 'Layer 2 Bridging & Anti-Spoof', level: 'Production' },
      { name: 'Packet & DNS Analysis', level: 'Wireshark' },
      { name: 'Physical & Link Diagnostics', level: 'Hardware' },
    ],
  },
  {
    title: 'SOC & Detection',
    items: [
      { name: 'Microsoft Sentinel & KQL', level: 'Daily Ops' },
      { name: 'Multi-Tenant SIEM Triage', level: 'Daily Ops' },
      { name: 'Firewall & Edge Telemetry', level: 'CommonSecurityLog' },
      { name: 'Cloud DLP (Netskope)', level: 'Monitoring' },
      { name: 'WAF & Web Recon Triage', level: 'Analysis' },
    ],
  },
  {
    title: 'Threat Defense & Governance',
    items: [
      { name: 'Cloud Sandbox & ATP', level: 'Malware Analysis' },
      { name: 'Endpoint Detection & Response', level: 'EDR' },
      { name: 'Anonymized Log Triage', level: 'LLM Harness' },
      { name: 'ISC2 CC Fundamentals', level: 'Certified' },
      { name: 'CompTIA Security+ (V8)', level: 'In Progress' },
    ],
  },
];

export const CONTACT_EMAIL = 'sheikhsobanfayaz@gmail.com';
export const LINKEDIN_URL = 'https://www.linkedin.com/in/sheikhsobanfayaz';
export const CREDLY_URL = 'https://www.credly.com/badges/1d1902d2-5a61-4795-b01a-6ee418bbfae1';
export const GITHUB_URL = 'https://github.com/sheikhsobanfayaz';
