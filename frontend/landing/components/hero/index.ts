export function LandingHero(): string {
  return [
    '<section data-landing-section="hero" class="landing-hero section section--xl section--dark" aria-labelledby="landing-hero-title">',
    '  <div class="landing-hero__container container container--narrow">',
    '    <header class="landing-hero__content text-center stack stack--lg">',
    '      <h1 id="landing-hero-title" class="landing-hero__headline display display--xl weight--semibold tracking--tight">',
    "        <span class=\"landing-hero__headline-line block\">You don't own your data.</span>",
    '        <span class="landing-hero__headline-line block">You just hope no one abuses it.</span>',
    '      </h1>',
    '      <p class="landing-hero__subheadline body body--lg tone--muted max-w-prose mx-auto">',
    '        There is a better system. One where access is granted, not assumed.',
    '      </p>',
    '      <button type="button" class="landing-hero__cta btn btn--primary btn--premium">Enter the new model →</button>',
    '    </header>',
    '  </div>',
    '</section>',
  ].join('\n');
}
