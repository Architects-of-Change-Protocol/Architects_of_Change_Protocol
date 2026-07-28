import { useState } from 'react';
import { LogoRotating } from '../../components/logo/LogoRotating';
import { NAV_ITEMS } from './content';

export function EnterpriseNav() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-30 border-b border-white/10 bg-[#090b11]/85 backdrop-blur">
      <div className="max-w-[100rem] mx-auto px-6">
        <div className="flex h-16 items-center gap-3">
          <a href="/" className="flex items-center gap-3 shrink-0">
            <LogoRotating size={26} inverted />
            <span className="font-semibold tracking-tight text-white">AOC Enterprise</span>
          </a>

          <div className="hidden lg:flex flex-1 min-w-0 items-center gap-0.5 text-[13px] overflow-x-auto no-scrollbar">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="shrink-0 rounded-lg px-2 py-2 text-white/65 transition-colors hover:text-white hover:bg-white/5"
              >
                {item.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-3 ml-auto lg:ml-0 shrink-0">
            <a
              href="mailto:hello@aocprotocol.xyz?subject=AOC%20Enterprise%20Governance%20Walkthrough"
              className="hidden md:inline-flex items-center rounded-xl bg-cyan-300 px-4 py-2 text-sm font-semibold text-black hover:bg-cyan-200 transition-colors whitespace-nowrap"
            >
              Talk to architecture
            </a>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="enterprise-mobile-nav"
              className="lg:hidden inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/15 text-white/70"
            >
              <span className="sr-only">Toggle navigation</span>
              <span className={`block h-px w-4 bg-current transition-transform ${open ? 'translate-y-0 rotate-45' : '-translate-y-1'}`} />
              <span className={`block h-px w-4 bg-current absolute transition-opacity ${open ? 'opacity-0' : 'opacity-100'}`} />
              <span className={`block h-px w-4 bg-current transition-transform ${open ? 'translate-y-0 -rotate-45' : 'translate-y-1'}`} />
            </button>
          </div>
        </div>

        {open ? (
          <div id="enterprise-mobile-nav" className="lg:hidden border-t border-white/10 py-3">
            <div className="flex flex-col">
              {NAV_ITEMS.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-white/70 hover:bg-white/5 hover:text-white"
                >
                  {item.label}
                </a>
              ))}
              <a
                href="mailto:hello@aocprotocol.xyz?subject=AOC%20Enterprise%20Governance%20Walkthrough"
                className="mt-2 inline-flex items-center justify-center rounded-xl bg-cyan-300 px-4 py-2.5 text-sm font-semibold text-black"
              >
                Talk to architecture
              </a>
            </div>
          </div>
        ) : null}
      </div>
    </nav>
  );
}
