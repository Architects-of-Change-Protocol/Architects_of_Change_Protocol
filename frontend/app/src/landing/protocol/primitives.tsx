import type { ReactNode } from 'react';
import type { ClaimStatus } from './content';
import { STATUS_COPY } from './content';

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="text-cyan-300/80 text-xs uppercase tracking-[0.22em] font-mono">{children}</p>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  align = 'left',
}: {
  eyebrow: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  align?: 'left' | 'center';
}) {
  return (
    <div className={`max-w-3xl mb-10 md:mb-12 ${align === 'center' ? 'mx-auto text-center' : ''}`}>
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 className="mt-4 text-3xl md:text-4xl font-semibold tracking-tight text-white">{title}</h2>
      {description ? <p className="mt-4 text-white/60 text-base leading-relaxed">{description}</p> : null}
    </div>
  );
}

const statusToneMap: Record<ClaimStatus, string> = {
  'Reference Model': 'text-cyan-300 border-cyan-400/30 bg-cyan-400/10',
  'Future Direction': 'text-white/55 border-white/15 bg-white/[0.03]',
};

/** Maturity label for a claim on the page — see content.ts STATUS_COPY for what each tier means. */
export function StatusPill({ status }: { status: ClaimStatus }) {
  return (
    <span
      title={STATUS_COPY[status]}
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium tracking-wide font-mono ${statusToneMap[status]}`}
    >
      {status}
    </span>
  );
}

/** A vertical, numbered step flow used for the creation and photo-example diagrams.
 * Textual by construction so it stays meaningful without relying on an image. */
export function StepFlow({ steps }: { steps: { label: string; detail: string }[] }) {
  return (
    <ol className="space-y-0">
      {steps.map((step, idx) => (
        <li key={step.label} className="relative pl-9">
          {idx < steps.length - 1 ? (
            <span aria-hidden className="absolute left-[11px] top-7 bottom-[-4px] w-px bg-white/15" />
          ) : null}
          <span
            aria-hidden
            className="absolute left-0 top-0.5 flex h-[22px] w-[22px] items-center justify-center rounded-full border border-cyan-300/40 bg-cyan-300/10 text-[11px] font-mono text-cyan-200"
          >
            {idx + 1}
          </span>
          <p className="text-sm font-semibold text-white">{step.label}</p>
          <p className="mt-1 mb-6 text-sm leading-relaxed text-white/55">{step.detail}</p>
        </li>
      ))}
    </ol>
  );
}
