import { OTHER_ASSET_EXAMPLES, PHOTO_PROGRESSION } from './content';
import { SectionHeader, StepFlow } from './primitives';

export function PhotographExample() {
  return (
    <section id="example" className="scroll-mt-24 max-w-5xl mx-auto px-6 py-20 border-t border-white/10">
      <SectionHeader
        eyebrow="A Simple Example"
        title="A photograph, walked through the model."
        description="A normal photograph is only photo.jpg — content, format, wherever it's stored. Walking it through the protocol model makes the difference concrete."
      />

      <div className="rounded-2xl border border-white/10 bg-white/[0.015] p-6 md:p-8">
        <StepFlow steps={PHOTO_PROGRESSION} />
      </div>

      <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.02] p-6">
        <p className="text-sm leading-relaxed text-white/60">
          Honesty matters here: compatible systems interpret and enforce these declarations. The
          JPEG bytes themselves don't enforce a license or a permission once copied outside a
          controlled system — enforcement depends on compatible applications and, for organizations
          that need it, on{' '}
          <a href="/?view=enterprise" className="text-cyan-300/80 hover:text-cyan-200 underline underline-offset-2">
            AOC Enterprise
          </a>{' '}
          operationalizing governed delivery on top of the asset's declarations.
        </p>
      </div>

      <p className="mt-6 text-sm text-white/45">
        The same model applies to{' '}
        {OTHER_ASSET_EXAMPLES.map((asset, idx) => (
          <span key={asset.name}>
            {asset.name}
            {idx < OTHER_ASSET_EXAMPLES.length - 1 ? ', ' : ''}
          </span>
        ))}
        {' '}— any digitally represented resource with value, identity, operational meaning or governance relevance.
      </p>
    </section>
  );
}
