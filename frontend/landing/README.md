# AOC Landing Integration Scaffold

This folder is a framework-agnostic landing page scaffold prepared for future Figma-generated UI code.

## Current intent
- Preserve existing protocol/business logic code.
- Add a dedicated, modular landing structure without assuming a frontend framework yet.
- Keep all landing copy/config centralized under `frontend/landing/lib`.

## Where to place future Figma code
1. Replace each section file in `frontend/landing/components/*/index.ts`.
2. Keep section exports stable (for example `LandingHero`) to avoid breaking imports.
3. Keep `renderAocLandingPage` as the composition root in `AocLandingPage.ts`.

## Routing integration notes
The repository does not currently include an app/pages router implementation. When a UI app is introduced:
- Mount `renderAocLandingPage` (or framework-specific equivalents) at `/landing` first.
- After QA, promote `/landing` to `/` if needed by wiring the existing home route to the same composition root.

## Assets
Use `public/landing/images`, `public/landing/icons`, and `public/landing/logos` for assets generated from Figma exports.
