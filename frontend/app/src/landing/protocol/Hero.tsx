export function Hero() {
  return (
    <section className="min-h-screen flex items-center pt-16">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <p className="text-cyan-300/80 text-xs uppercase tracking-[0.22em] font-mono mb-6">
          Open Protocol &middot; Digital Assets &amp; Sovereignty
        </p>

        <h1 className="text-[52px] md:text-[68px] leading-[1.05] font-semibold tracking-[-2.5px] mb-8">
          Digital assets should be capable of more than being stored.
        </h1>

        <p className="max-w-[640px] mx-auto text-[19px] md:text-[21px] text-white/70 leading-relaxed mb-14">
          AOC Protocol is an open, provider-neutral language for digital assets — a way to give any
          file or resource identity, integrity, provenance and declared capabilities that
          compatible systems can interpret.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="#digital-asset"
            className="px-10 py-5 bg-[#00f0ff] hover:bg-[#00d4e0] text-black font-semibold text-lg rounded-2xl transition-all active:scale-[0.98] inline-block"
          >
            Explore the capabilities &darr;
          </a>

          <a
            href="/?view=enterprise"
            className="px-10 py-5 border border-white/15 hover:border-white/30 text-white font-semibold text-lg rounded-2xl transition-all active:scale-[0.98] inline-block"
          >
            See AOC Enterprise
          </a>
        </div>
      </div>
    </section>
  );
}
