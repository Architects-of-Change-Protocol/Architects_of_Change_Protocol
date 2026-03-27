export function LandingProblem(): string {
  return [
    '<section id="problem" data-landing-section="problem" class="landing-problem section section--dark" aria-labelledby="landing-problem-title">',
    '  <div class="landing-problem__container container container--narrow">',
    '    <div class="landing-problem__content text-center stack stack--lg">',
    '      <h2 id="landing-problem-title" class="landing-problem__title display display--xl weight--semibold tracking--tight max-w-prose mx-auto">This is the system most people live inside.</h2>',
    '      <p class="landing-problem__body body body--lg tone--muted max-w-prose mx-auto">Your data is collected in moments that feel routine, then copied across systems you never see.</p>',
    '      <p class="landing-problem__body body body--lg tone--muted max-w-prose mx-auto">Access is treated as default behavior instead of a permission you explicitly grant, revoke, or audit.</p>',
    '      <p class="landing-problem__body body body--lg tone--muted max-w-prose mx-auto">You are expected to trust a chain of decisions you do not control.</p>',
    '      <p class="landing-problem__statement body body--lg weight--semibold max-w-prose mx-auto">It was designed for convenience. Not for ownership.</p>',
    '    </div>',
    '  </div>',
    '</section>',
  ].join('\n');
}
