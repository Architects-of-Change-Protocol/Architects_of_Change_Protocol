import { useEffect } from 'react';
import { LogoRotating } from '../components/logo/LogoRotating';

function useRevealOnScroll() {
  useEffect(() => {
    const elements = Array.from(document.querySelectorAll<HTMLElement>('.reveal'));

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        }
      },
      {
        threshold: 0.16,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

}

export const renderAocLandingPage = () => {
  useRevealOnScroll();

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white overflow-hidden font-sans">

      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center">
              <LogoRotating size={28} inverted={true} />
            </div>
            <span className="text-xl font-semibold tracking-tighter">AOC</span><span className="text-xs text-gray-500 uppercase tracking-[0.2em] ml-2">Protocol</span>
          </div>

          {/* Nav links */}
          <div className="hidden md:flex items-center gap-10 text-sm font-medium">
            <a href="#problem" className="hover:text-gray-300 transition">Problem</a>
            <a href="#solution" className="hover:text-gray-300 transition">Solution</a>
            <a href="#how" className="hover:text-gray-300 transition">How it works</a>
          </div>

          {/* CTA */}
          <a
            href="#how"
            onClick={() => track('launch_app_click', { location: 'navbar', page: 'landing' })}
            className="px-6 py-2.5 bg-white text-black rounded-full text-sm font-semibold hover:bg-gray-200 transition"
          >
            Launch App
          </a>
        </div>
      </nav>

      {/* HERO */}
      <section className="min-h-screen flex items-center pt-16">
        <div className="max-w-5xl mx-auto px-6 text-center">

          <h1 className="reveal text-[68px] md:text-[82px] leading-[1.05] font-semibold tracking-[-3.5px] mb-6">
            You don't own your data.
          </h1>

          <p className="reveal reveal-delay-1 text-[52px] md:text-[62px] leading-none font-light tracking-[-2px] text-gray-400 mb-8">
            You just hope no one abuses it.
          </p>

          <p className="reveal reveal-delay-2 max-w-[620px] mx-auto text-[21px] text-gray-400 leading-relaxed mb-14">
            There is a better system. One where access is granted, not assumed.
          </p>

          <a
            href="#solution"
            onClick={() => track('cta_click', { cta: 'enter_new_model', location: 'hero', page: 'landing' })}
            className="reveal reveal-delay-3 px-12 py-5 bg-[#00f0ff] hover:bg-[#00d4e0] text-black font-semibold text-xl rounded-2xl transition-all active:scale-[0.97] inline-block"
          >
            Enter the new model →
          </a>
        </div>
      </section>

      {/* PROBLEM */}
      <section id="problem" className="scroll-mt-24 py-40 border-t border-white/10 relative">

        <div className="max-w-6xl mx-auto px-6">

          <div className="text-center mb-20 reveal">
            <h2 className="text-5xl md:text-6xl font-semibold tracking-tight">
              The current model is broken.
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-10">

            <div className="reveal bg-red-950/10 border border-red-800/30 rounded-3xl p-12 hover:-translate-y-1 transition">
              <p className="text-2xl text-red-100">
                Your data is copied. Stored. Resold.
              </p>
            </div>

            <div className="reveal reveal-delay-1 bg-red-950/10 border border-red-800/30 rounded-3xl p-12 hover:-translate-y-1 transition">
              <p className="text-2xl text-red-100">
                Consent is implied. Not explicit.
              </p>
            </div>

            <div className="reveal reveal-delay-2 bg-red-950/10 border border-red-800/30 rounded-3xl p-12 hover:-translate-y-1 transition">
              <p className="text-2xl text-red-100">
                You never see who accessed what.
              </p>
            </div>

            <div className="reveal reveal-delay-3 bg-red-950/10 border border-red-800/30 rounded-3xl p-12 hover:-translate-y-1 transition">
              <p className="text-2xl text-red-100">
                Trust is a blind assumption.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* SOLUTION */}
      <section id="solution" className="scroll-mt-24 py-40 border-t border-white/10">

        <div className="max-w-5xl mx-auto px-6 text-center">

          <div className="mb-24 reveal">
            <h2 className="text-5xl md:text-6xl font-semibold mb-6">
              What if access required permission?
            </h2>

            <p className="text-xl text-gray-400">
              Not assumed. Not inherited. Not silently granted.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">

            <div className="reveal bg-white/[0.03] border border-white/10 rounded-3xl p-10 hover:-translate-y-1 transition">
              Explicit consent
            </div>

            <div className="reveal reveal-delay-1 bg-white/[0.03] border border-white/10 rounded-3xl p-10 hover:-translate-y-1 transition">
              Modular permissions
            </div>

            <div className="reveal reveal-delay-2 bg-white/[0.03] border border-white/10 rounded-3xl p-10 hover:-translate-y-1 transition">
              Verifiable interactions
            </div>

            <div className="reveal reveal-delay-3 bg-white/[0.03] border border-white/10 rounded-3xl p-10 hover:-translate-y-1 transition">
              Full control remains with the user
            </div>

          </div>
        </div>
      </section>

      {/* HOW */}
      <section id="how" className="scroll-mt-24 py-32 border-t border-white/10">

        <div className="max-w-5xl mx-auto px-6 text-center">

          <h2 className="reveal text-6xl font-semibold mb-16">
            How it works
          </h2>

          <div className="flex flex-col md:flex-row gap-10 justify-center">

            <div className="reveal bg-white/5 border border-white/10 rounded-3xl p-8 w-64">
              01 Define permissions
            </div>

            <div className="reveal reveal-delay-1 text-gray-500 text-3xl">→</div>

            <div className="reveal reveal-delay-2 bg-white/5 border border-white/10 rounded-3xl p-8 w-64">
              02 Evaluate request
            </div>

            <div className="reveal reveal-delay-2 text-gray-500 text-3xl">→</div>

            <div className="reveal reveal-delay-3 bg-white/5 border border-white/10 rounded-3xl p-8 w-64">
              03 Grant & audit access
            </div>

          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 border-t border-white/10 text-center">

        <div className="reveal">
          <h2 className="text-6xl font-semibold mb-8">
            Access should be earned.
          </h2>

          <button
            onClick={() => track('final_cta_click', { cta: 'start_building_on_aoc', location: 'footer', page: 'landing' })}
            className="px-12 py-6 bg-[#00f0ff] text-black font-semibold text-2xl rounded-2xl hover:scale-[1.02] transition"
          >
            Start building on AOC →
          </button>
        </div>

      </section>

    </div>
  );
};
