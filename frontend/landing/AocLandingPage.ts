import { LandingNavbar } from './components/navbar';
import { LandingHero } from './components/hero';
import { LandingSocialProof } from './components/social-proof';
import { LandingProblem } from './components/problem';
import { LandingSolution } from './components/solution';
import { LandingUseCases } from './components/use-cases';
import { LandingConsentLayer } from './components/consent-layer';
import { LandingCta } from './components/cta';
import { LandingFooter } from './components/footer';

export function renderAocLandingPage(): string {
  // TODO(figma): Keep section ordering stable while swapping each section with generated UI components.
  return [
    '<main data-route="/landing">',
    LandingNavbar(),
    LandingHero(),
    LandingSocialProof(),
    LandingProblem(),
    LandingSolution(),
    LandingUseCases(),
    LandingConsentLayer(),
    LandingCta(),
    LandingFooter(),
    '</main>',
  ].join('\n');
}
