import { Card, SectionHeader } from './primitives';

const HAVE = ['Storage', 'Authentication', 'Signed URLs', 'Permissions'];

const GAPS = [
  'Who approved this, and under what policy?',
  'Does it expire on its own?',
  'Can you prove what happened after?',
];

function CheckIcon() {
  return (
    <svg viewBox="0 0 256 256" className="h-[22px] w-[22px] shrink-0 text-indigo-600" fill="currentColor" aria-hidden="true">
      <path d="M173.66,98.34a8,8,0,0,1,0,11.32l-56,56a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L112,148.69l50.34-50.35A8,8,0,0,1,173.66,98.34ZM232,128A104,104,0,1,1,128,24,104.11,104.11,0,0,1,232,128Zm-16,0a88,88,0,1,0-88,88A88.1,88.1,0,0,0,216,128Z" />
    </svg>
  );
}

function QuestionIcon() {
  return (
    <svg viewBox="0 0 256 256" className="h-[22px] w-[22px] shrink-0 text-indigo-600" fill="currentColor" aria-hidden="true">
      <path d="M140,180a12,12,0,1,1-12-12A12,12,0,0,1,140,180ZM128,72c-22.06,0-40,16.15-40,36v4a8,8,0,0,0,16,0v-4c0-11,10.77-20,24-20s24,9,24,20-10.77,20-24,20a8,8,0,0,0-8,8v8a8,8,0,0,0,16,0v-.72c18.24-3.35,32-17.9,32-35.28C168,88.15,150.06,72,128,72Zm104,56A104,104,0,1,1,128,24,104.11,104.11,0,0,1,232,128Zm-16,0a88,88,0,1,0-88,88A88.1,88.1,0,0,0,216,128Z" />
    </svg>
  );
}

// Deck slide 2. The former GovernanceGap section's four illustrated cards
// ("your data is copied", "consent is implied", ...) covered a broader
// data-misuse narrative that predates the SK005 deck; the deck instead makes
// a narrower, sharper claim — you already have the access primitives, none
// of them answer governance questions — so this section is a full rebuild,
// not a restyle. The underlying concept (the current model doesn't prove
// anything) carries forward in the copy below.
export function Problem() {
  return (
    <section id="problem" className="scroll-mt-16 max-w-5xl mx-auto px-6 py-20 border-t border-slate-200">
      <SectionHeader
        eyebrow="The Governance Gap"
        title="Storage solved access. Not governance."
        description="Authentication, signed URLs, and permissions confirm access happened. None of them prove it should have."
      />

      <div className="grid md:grid-cols-2 gap-12 mt-11">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">You already have</p>
          <ul className="mt-5 flex flex-col gap-6">
            {HAVE.map((item) => (
              <li key={item} className="flex items-center gap-3.5 text-base text-slate-900">
                <CheckIcon />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">None of them answer</p>
          <div className="mt-5 flex flex-col gap-4">
            {GAPS.map((gap) => (
              <Card key={gap} className="flex items-center gap-4 px-6 py-5">
                <QuestionIcon />
                <span className="text-[15px] text-slate-900">{gap}</span>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
