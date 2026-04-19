import { LogoRotating } from '../components/logo/LogoRotating';
import { LaunchEntryExperience } from './components/LaunchEntryExperience';

export const renderLaunchEntryPage = () => {
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white overflow-hidden font-sans">
      <header>
        <nav className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-lg border-b border-white/10">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <a href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 flex items-center justify-center">
                <LogoRotating size={28} inverted />
              </div>

              <div className="flex items-baseline">
                <span className="text-xl font-semibold tracking-tighter">AOC</span>
                <span className="text-xs text-white uppercase tracking-[0.2em] ml-2">
                  App Entry
                </span>
              </div>
            </a>

            <a
              href="/enterprise"
              className="px-6 py-2.5 border border-white/15 rounded-full text-sm font-semibold hover:border-white/30 transition"
            >
              Enterprise
            </a>
          </div>
        </nav>
      </header>

      <LaunchEntryExperience />
    </main>
  );
};
