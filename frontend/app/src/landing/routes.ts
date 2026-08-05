// Central route constants for the marketing site.
//
// The site is a hybrid of query-param "views" (`?view=x`) and clean paths,
// dispatched in src/App.tsx. This file exists so every nav/footer/CTA link
// references one canonical string instead of retyping `/?view=enterprise`
// in a dozen files.
//
// Information architecture (approved): Protocol is the open foundation.
// Enterprise is the commercial umbrella built on Protocol, and owns
// Solutions (Governed Access), Services (Assurance), Intelligence Risk,
// Architecture, and Developers. See ROUTES.enterprise.* for that hierarchy.
//
// Intelligence Risk (AOC Intelligence Risk — Institutional Intelligence
// Risk / Knowledge Loss / the Constitutional Index) is a distinct
// commercial offering from Assurance (the SAF-based governance-posture
// validation service). The two used to share the "Assurance" name and
// route; W007A split them. See
// docs/audits/w007a-assurance-commercial-audit.md.

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
