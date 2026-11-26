import { MessageSquare } from 'lucide-react';
import BlurText from '@/components/reactbits/BlurText/BlurText';
import { ContactSection } from '@/components/ContactSection';

interface ContactViewProps {
  onCopyEmail: () => void;
  onNotify: (msg: string) => void;
}

export function ContactView({ onCopyEmail, onNotify }: ContactViewProps) {
  return (
    <main className="mx-auto max-w-[1120px] px-5 pt-12 pb-20 sm:px-8 lg:px-12">
      <section className="mb-10 border-b border-[var(--hair)] pb-8">
        <div className="font-mono-code mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--accent-soft)] px-3 py-1 text-[12px] font-medium text-[var(--accent-text)]">
          <MessageSquare className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Get in Touch</span>
        </div>

        <div role="heading" aria-level={1}>
          <BlurText
            text="Contact Me"
            trigger="load"
            animateBy="words"
            direction="top"
            delay={55}
            stepDuration={0.3}
            className="font-display m-0 text-[clamp(30px,4.5vw,44px)] font-bold leading-[1.14] tracking-[-0.025em] text-[var(--ink)]"
          />
        </div>

        <p className="mt-3 max-w-[720px] text-[16.5px] leading-relaxed text-[var(--ink2)]">
          Based in Jammu and Kashmir, India. Feel free to reach out about SOC Analyst roles, network security, or security engineering projects.
        </p>
      </section>

      <ContactSection onCopyEmail={onCopyEmail} onNotify={onNotify} standalone />
    </main>
  );
}
