import type { Mineral } from '../enterprise/primitives';

const REPO_URL = 'https://github.com/Architects-of-Change-Protocol/Architects_of_Change_Protocol'

type FooterItem = {
  label: string
  href?: string
  external?: boolean
}

const protocolLinks: FooterItem[] = [
  { label: 'Architecture' },
  { label: 'Digital Assets' },
  { label: 'Capability Model' },
  { label: 'Sovereignty' },
]

const navigationLinks: FooterItem[] = [
  { label: 'Enterprise', href: '/?view=enterprise' },
  { label: 'Docs', href: '/?view=docs' },
  { label: 'About', href: '/?view=about' },
  { label: 'Contact Us', href: '/?view=contact' },
  { label: 'GitHub', href: REPO_URL, external: true },
]

// Every AOC surface renders the same footer component (shared layout,
// copy structure and interaction model) — only its Capability Mineral
// accent changes, per surface: Protocol -> Amethyst, Enterprise ->
// Sapphire, Governed Access -> Turquoise, Assurance -> Emerald. Amber
// (reserved for a future AI Governance surface) is defined for
// completeness even though nothing renders it yet.
const ACCENT_CLASSES: Record<Mineral, { eyebrow: string; divider: string; primaryButton: string }> = {
  amethyst: {
    eyebrow: 'text-violet-200/60',
    divider: 'bg-violet-200/20',
    primaryButton: 'border-violet-400/40 bg-violet-500 text-white hover:bg-violet-400',
  },
  sapphire: {
    eyebrow: 'text-indigo-300/70',
    divider: 'bg-indigo-300/20',
    primaryButton: 'border-indigo-400/40 bg-indigo-500 text-white hover:bg-indigo-400',
  },
  turquoise: {
    eyebrow: 'text-teal-200/60',
    divider: 'bg-teal-200/20',
    primaryButton: 'border-teal-400/40 bg-teal-500 text-white hover:bg-teal-400',
  },
  emerald: {
    eyebrow: 'text-emerald-200/60',
    divider: 'bg-emerald-200/20',
    primaryButton: 'border-emerald-400/40 bg-emerald-500 text-white hover:bg-emerald-400',
  },
  amber: {
    eyebrow: 'text-amber-200/60',
    divider: 'bg-amber-200/20',
    primaryButton: 'border-amber-400/40 bg-amber-500 text-white hover:bg-amber-400',
  },
} as const;

export function ProtocolFooter({ accent = 'sapphire' }: { accent?: Mineral }) {
  const tone = ACCENT_CLASSES[accent];
  return (
    <section className="border-t border-white/10 bg-[#050816]">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 pb-6 pt-12 md:pt-16">
        <div className="footer-fade rounded-3xl border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))] px-4 sm:px-6 py-8 text-center md:px-10 md:py-12">
          <p className={`text-[11px] uppercase tracking-[0.24em] ${tone.eyebrow}`}>Protocol handoff</p>
          <h2 className="mx-auto mt-4 max-w-2xl text-3xl font-semibold tracking-tight text-white md:text-4xl">
            Ship digital assets with identity, integrity and capabilities built in.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-white/65 md:text-base">
            Explore the docs, review enterprise positioning, or contact the protocol directly.
          </p>

          <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
            <a href="/?view=docs" className={`footer-link-hover inline-flex w-full sm:w-auto sm:min-w-[170px] items-center justify-center rounded-xl border px-5 py-3 text-sm font-semibold transition-colors ${tone.primaryButton}`}>
              Read the Docs
            </a>
            <a href="/?view=enterprise" className="footer-link-hover inline-flex w-full sm:w-auto sm:min-w-[170px] items-center justify-center rounded-xl border border-white/20 px-5 py-3 text-sm font-medium text-white/80 transition-colors hover:border-white/35 hover:text-white">
              Enterprise
            </a>
            <a href={REPO_URL} target="_blank" rel="noreferrer" className="footer-link-hover inline-flex w-full sm:w-auto sm:min-w-[170px] items-center justify-center rounded-xl border border-white/20 px-5 py-3 text-sm font-medium text-white/80 transition-colors hover:border-white/35 hover:text-white">
              View GitHub
            </a>
          </div>
        </div>

        <footer className="footer-fade mt-10 rounded-3xl border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0.008))] px-4 sm:px-6 py-8 md:px-10 md:py-12">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            <div className="max-w-sm">
              <h3 className="text-base font-semibold tracking-tight text-white">AOC Protocol</h3>
              <div className={`mt-4 h-px w-16 ${tone.divider}`} />
              <p className="mt-4 text-sm leading-6 text-white/62">
                An open, provider-neutral protocol for digital assets — identity, integrity,
                provenance and capabilities that compatible systems can interpret.
              </p>
            </div>

            <FooterColumn title="Protocol" items={protocolLinks} />
            <FooterColumn title="Navigation" items={navigationLinks} />
          </div>

          <div className="mt-10 flex flex-col gap-4 border-t border-white/10 pt-5 text-xs text-white/45 sm:flex-row sm:items-center sm:justify-between">
            <p>© 2026 AOC Protocol</p>
            <div className="flex items-center gap-5">
              <span className="text-white/35">Privacy</span>
              <span className="text-white/35">Terms</span>
            </div>
          </div>
        </footer>
      </div>

      <style>{`
        :root {
          --aoc-ease-premium: cubic-bezier(0.22, 1, 0.36, 1);
        }

        @keyframes footer-fade-up {
          0% { opacity: 0; transform: translateY(4px); }
          100% { opacity: 1; transform: translateY(0); }
        }

        .footer-fade {
          animation: footer-fade-up 560ms var(--aoc-ease-premium) both;
        }

        .footer-link-hover {
          transition:
            opacity 180ms var(--aoc-ease-premium),
            transform 180ms var(--aoc-ease-premium),
            border-color 180ms var(--aoc-ease-premium),
            color 180ms var(--aoc-ease-premium),
            background-color 180ms var(--aoc-ease-premium);
        }

        .footer-link-hover:hover {
          transform: translateY(-1px);
        }

        @media (prefers-reduced-motion: reduce) {
          .footer-fade,
          .footer-link-hover,
          .footer-link-hover:hover {
            animation: none !important;
            transform: none !important;
            transition: none !important;
          }
        }
      `}</style>
    </section>
  )
}

function FooterColumn({ title, items }: { title: string; items: FooterItem[] }) {
  return (
    <div>
      <h3 className="text-sm font-medium uppercase tracking-[0.16em] text-white/62">{title}</h3>
      <ul className="mt-4 space-y-2.5">
        {items.map((item) => (
          <li key={item.label}>
            {item.href ? (
              <a href={item.href} target={item.external ? '_blank' : undefined} rel={item.external ? 'noreferrer' : undefined} className="footer-link-hover inline-block text-sm text-white/55 hover:text-white/80">
                {item.label}
              </a>
            ) : (
              <span className="inline-block text-sm text-white/38">{item.label}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
