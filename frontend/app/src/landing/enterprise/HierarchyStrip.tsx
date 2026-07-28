import { HierarchyRail } from './primitives';

export function HierarchyStrip() {
  return (
    <section className="max-w-7xl mx-auto px-6 py-10 border-t border-white/10">
      <div className="rounded-2xl border border-white/10 bg-white/[0.015] px-5 py-5 md:px-7">
        <p className="text-[11px] uppercase tracking-[0.16em] text-white/40 font-mono mb-3">
          The AOC Enterprise mental model — every screen sits somewhere on this line
        </p>
        <HierarchyRail />
      </div>
    </section>
  );
}
