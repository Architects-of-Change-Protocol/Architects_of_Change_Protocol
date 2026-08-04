import { IconCircle, SectionHeader } from './primitives';

const BENEFITS = [
  {
    icon: 'M226.76,69a8,8,0,0,0-12.84-2.88l-40.3,37.19-17.23-3.7-3.7-17.23,37.19-40.3A8,8,0,0,0,187,29.24,72,72,0,0,0,88,96,72.34,72.34,0,0,0,94,124.94L33.79,177c-.15.12-.29.26-.43.39a32,32,0,0,0,45.26,45.26c.13-.13.27-.28.39-.42L131.06,162A72,72,0,0,0,232,96,71.56,71.56,0,0,0,226.76,69ZM160,152a56.14,56.14,0,0,1-27.07-7,8,8,0,0,0-9.92,1.77L67.11,211.51a16,16,0,0,1-22.62-22.62L109.18,133a8,8,0,0,0,1.77-9.93,56,56,0,0,1,58.36-82.31l-31.2,33.81a8,8,0,0,0-1.94,7.1L141.83,108a8,8,0,0,0,6.14,6.14l26.35,5.66a8,8,0,0,0,7.1-1.94l33.81-31.2A56.06,56.06,0,0,1,160,152Z',
    title: 'Engineering focus',
    body: 'Ship product, not per-provider glue code',
  },
  {
    icon: 'M223.85,47.12a16,16,0,0,0-15-15c-12.58-.75-44.73.4-71.41,27.07L132.69,64H74.36A15.91,15.91,0,0,0,63,68.68L28.7,103a16,16,0,0,0,9.07,27.16l38.47,5.37,44.21,44.21,5.37,38.49a15.94,15.94,0,0,0,10.78,12.92,16.11,16.11,0,0,0,5.1.83A15.91,15.91,0,0,0,153,227.3L187.32,193A15.91,15.91,0,0,0,192,181.64V123.31l4.77-4.77C223.45,91.86,224.6,59.71,223.85,47.12ZM74.36,80h42.33L77.16,119.52,40,114.34Zm74.41-9.45a76.65,76.65,0,0,1,59.11-22.47,76.46,76.46,0,0,1-22.42,59.16L128,164.68,91.32,128ZM176,181.64,141.67,216l-5.19-37.17L176,139.31Z',
    title: 'Lower implementation cost',
    body: 'Adopt a reviewed model, not a blank page',
  },
  {
    icon: 'M184,89.57V84c0-25.08-37.83-44-88-44S8,58.92,8,84v40c0,20.89,26.25,37.49,64,42.46V172c0,25.08,37.83,44,88,44s88-18.92,88-44V132C248,111.3,222.58,94.68,184,89.57Z',
    title: 'Lower ownership cost',
    body: 'Provider logic lives in a swappable adapter',
  },
  {
    icon: 'M240,56v64a8,8,0,0,1-16,0V75.31l-82.34,82.35a8,8,0,0,1-11.32,0L96,123.31,29.66,189.66a8,8,0,0,1-11.32-11.32l72-72a8,8,0,0,1,11.32,0L136,140.69,212.69,64H168a8,8,0,0,1,0-16h64A8,8,0,0,1,240,56Z',
    title: 'Faster enterprise sales',
    body: "Answer 'prove it' with a record, not a promise",
  },
  {
    icon: 'M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z',
    title: 'Better auditability',
    body: "Read a chain — don't reconstruct logs",
  },
  {
    icon: 'M208,40H48A16,16,0,0,0,32,56v56c0,52.72,25.52,84.67,46.93,102.19,23.06,18.86,46,25.26,47,25.53a8,8,0,0,0,4.2,0c1-.27,23.91-6.67,47-25.53C198.48,196.67,224,164.72,224,112V56A16,16,0,0,0,208,40Z',
    title: 'Reduced architectural risk',
    body: 'A provider migration touches one adapter',
  },
];

// Deck slide 8. Doubles as the interactive version of the One Pager's
// "Why Not Build It Yourself" callout.
export function Benefits() {
  return (
    <section id="benefits" className="scroll-mt-16 max-w-5xl mx-auto px-6 py-20 border-t border-slate-200">
      <SectionHeader
        eyebrow="Build vs. Buy"
        title="The build-it-yourself alternative, priced honestly"
        description="Six ways Governed Access changes what your team spends time and risk on."
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {BENEFITS.map((benefit) => (
          <div key={benefit.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
            <IconCircle size="sm">
              <svg viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">
                <path d={benefit.icon} />
              </svg>
            </IconCircle>
            <h4 className="mt-1.5 text-[15.5px] font-extrabold text-slate-900">{benefit.title}</h4>
            <p className="mt-2 text-[12.5px] leading-relaxed text-slate-500">{benefit.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
