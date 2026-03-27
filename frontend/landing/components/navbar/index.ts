export function LandingNavbar(): string {
  return [
    '<header data-landing-section="navbar" class="landing-navbar section--dark">',
    '  <div class="landing-navbar__container container container--wide">',
    '    <nav class="landing-navbar__inner" aria-label="Primary navigation">',
    '      <a class="landing-navbar__brand" href="/" aria-label="AOC home">',
    '        <img class="landing-navbar__logo" src="/landing/logos/aoc-logo.svg" alt="" />',
    '        <span class="landing-navbar__wordmark">AOC</span>',
    '      </a>',
    '      <ul class="landing-navbar__links" aria-label="Landing navigation">',
    '        <li class="landing-navbar__item"><a class="landing-navbar__link" href="#problem">Problem</a></li>',
    '        <li class="landing-navbar__item"><a class="landing-navbar__link" href="#solution">Solution</a></li>',
    '        <li class="landing-navbar__item"><a class="landing-navbar__link" href="#consent-layer">Consent</a></li>',
    '      </ul>',
    '    </nav>',
    '  </div>',
    '</header>',
  ].join('\n');
}
