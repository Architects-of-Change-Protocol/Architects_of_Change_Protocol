import { BUILDER_AUDIENCES } from './content';
import { SectionHeader } from './primitives';

const REPO_URL = 'https://github.com/Architects-of-Change-Protocol/Architects_of_Change_Protocol';
const PROTOCOL_PACKAGE_URL = `${REPO_URL}/tree/main/packages/protocol`;

export function Developers() {
  return (
    <section id="developers" className="scroll-mt-24 max-w-7xl mx-auto px-6 py-20 border-t border-white/10">
      <SectionHeader
        eyebrow="Developers and Builders"
        title="Who builds with AOC Protocol."
        description="@aoc/protocol publishes the versioned public contract layer — capability, proof, credential-manifest and claim shapes — as an open-source package under Apache-2.0. It's not yet published to a registry; build it from source in the repository."
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
        {BUILDER_AUDIENCES.map((audience) => (
          <div key={audience.name} className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
            <p className="text-sm font-semibold text-white">{audience.name}</p>
            <p className="mt-1.5 text-sm leading-relaxed text-white/55">{audience.summary}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <a
          href={PROTOCOL_PACKAGE_URL}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center rounded-xl border border-cyan-300/40 px-6 py-3 text-sm font-semibold text-cyan-200 transition hover:border-cyan-300/70 hover:bg-cyan-300/10"
        >
          View @aoc/protocol on GitHub
        </a>
        <a
          href="/?view=docs"
          className="inline-flex items-center justify-center rounded-xl border border-white/15 px-6 py-3 text-sm font-semibold text-white/80 transition hover:border-white/35 hover:text-white"
        >
          Read the docs
        </a>
      </div>
    </section>
  );
}
