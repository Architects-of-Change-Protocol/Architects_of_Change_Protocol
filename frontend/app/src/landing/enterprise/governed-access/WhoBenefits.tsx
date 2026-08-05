import { IconCircle, SectionHeader } from '../primitives';
import { AUDIENCES } from './content';

// Same layout as ../CustomerSegments.tsx (icon + title + body, two-column),
// scoped to the eight audiences this specific product serves rather than
// the Enterprise homepage's six verticals.
export function WhoBenefits() {
  return (
    <section id="who-benefits" className="scroll-mt-16 max-w-5xl mx-auto px-6 py-20 border-t border-slate-200">
      <SectionHeader
        eyebrow="Who Benefits"
        title="Where governed access is the product, not a checkbox"
        description="Eight audiences where proving what happened to a digital asset is routine, not rare."
      />

      <div className="grid md:grid-cols-2 gap-x-10 gap-y-9">
        {AUDIENCES.map((audience) => (
          <div key={audience.title} className="flex items-start gap-5">
            <IconCircle mineral="turquoise">
              <svg viewBox="0 0 24 24" aria-hidden="true" dangerouslySetInnerHTML={{ __html: audience.icon }} />
            </IconCircle>
            <div>
              <h4 className="text-base font-extrabold text-slate-900">{audience.title}</h4>
              <p className="mt-1.5 text-[12.5px] leading-relaxed text-slate-500">{audience.body}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
