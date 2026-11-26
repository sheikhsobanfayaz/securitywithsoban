import { useState, type FormEvent } from 'react';
import { Copy, ExternalLink, Mail, Send } from 'lucide-react';
import { CONTACT_EMAIL, CREDLY_URL, GITHUB_URL, LINKEDIN_URL } from '@/data/portfolio';

interface ContactSectionProps {
  onCopyEmail: () => void;
  onNotify: (msg: string) => void;
  standalone?: boolean;
}

export function ContactSection({
  onCopyEmail,
  onNotify,
  standalone = false,
}: ContactSectionProps) {
  const [senderName, setSenderName] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [senderSubject, setSenderSubject] = useState('');
  const [senderMessage, setSenderMessage] = useState('');
  const [botcheck, setBotcheck] = useState(false);
  const [submittingForm, setSubmittingForm] = useState(false);
  const [formFeedback, setFormFeedback] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

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
        onNotify('Message delivered directly!');
      } else {
        throw new Error(data.message || 'Submission failed');
      }
    } catch {
      setFormFeedback({
        type: 'error',
        text: `Could not deliver automatically right now. Please email ${CONTACT_EMAIL} directly.`,
      });
      onNotify('Delivery issue. Use Copy Email to reach out.');
    } finally {
      setSubmittingForm(false);
    }
  };

  return (
    <div className="grid grid-cols-1 items-start gap-9 lg:grid-cols-[1fr_1.2fr]">
      <div>
        {!standalone && (
          <h2 className="font-display m-0 text-[clamp(26px,3vw,34px)] font-semibold leading-[1.12] tracking-[-0.025em] text-[var(--ink)]">
            Get in Touch
          </h2>
        )}
        <p
          className={`${standalone ? 'mt-0' : 'mt-2'} mb-0 max-w-[52ch] text-[15px] text-[var(--mute)]`}
        >
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
            <strong className="text-[var(--ink)]">Focus:</strong> Security Operations &middot; Network Defense &middot; Threat Intelligence
          </div>
          <div>
            <strong className="text-[var(--ink)]">Location:</strong> Jammu and Kashmir, India
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2.5">
          <button
            type="button"
            onClick={onCopyEmail}
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
  );
}
