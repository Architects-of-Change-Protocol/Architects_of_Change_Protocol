// Central route constants for the marketing site.
//
// The site is a hybrid of query-param "views" (`?view=x`) and clean paths,
// dispatched in src/App.tsx. This file exists so every nav/footer/CTA link
// references one canonical string instead of retyping `/?view=enterprise`
// in a dozen files.
//
// Information architecture (approved): Protocol is the open foundation.
// Enterprise is the commercial umbrella built on Protocol, and owns
// Solutions (Governed Access), Services (Assurance), Architecture, and
// Developers. See ROUTES.enterprise.* for that hierarchy.
//
// Assurance is the canonical assessment layer — it evaluates and
// continuously monitors every Protocol sovereignty capability and every
// Enterprise governance capability. AOC Intelligence Risk
// (ROUTES.enterprise.intelligenceRisk) is one specialized assessment
// module WITHIN Assurance, not a peer top-level offering — it keeps its
// own route/page (preserved as-is) but is reached from within the
// Assurance page rather than from top-level nav. See
// docs/audits/w007-assurance-canonical-refactor.md (supersedes W007A's
// earlier framing).

export const ROUTES = {
  protocol: '/',
  about: '/?view=about',
  contact: '/?view=contact',
  docs: '/?view=docs',
  enterprise: {
    overview: '/?view=enterprise',
    architecture: '/?view=enterprise#architecture',
    developers: '/?view=docs',
    solutions: {
      governedAccess: '/?view=governed-access',
    },
    services: {
      assurance: '/?view=assurance',
    },
    intelligenceRisk: '/?view=intelligence-risk',
  },
} as const;
