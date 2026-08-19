// ---------------------------------------------------------------------------
// Capability Minerals — the semantic accent layer of the unified AOC Design
// Language. The layout, typography, spacing, nav, footer and component
// library (./primitives.tsx) are the single shared foundation across every
// AOC surface. A "mineral" is the one thing that's allowed to differ
// per-surface: an accent token applied to badges, diagrams, icons, chips,
// highlights and section identifiers so each capability family reads as its
// own domain within one coherent platform — never a full re-skin, never a
// different layout, never a different component.
//
//   Amethyst   (violet)  -> Soberanía Protocol / Sovereignty
//   Sapphire   (indigo)  -> Soberanía Enterprise / Governance (the original W005
//                           deck accent — unchanged, just named)
//   Turquoise  (teal)    -> Governed Access
//   Emerald    (emerald) -> Assurance
//   Amber      (amber)   -> reserved for a future AI Governance capability
//                           family — defined here, not yet wired into any
//                           live page.
//
// Every field below is a complete, literal Tailwind class string (not
// interpolated at the call site) so Tailwind's content scanner picks each
// one up regardless of which mineral a given page ends up using at runtime.
//
// This is a pure data/type module (no components) — kept separate from
// ./primitives.tsx so that file can stay component-only for Vite Fast Refresh.
// ---------------------------------------------------------------------------

export type Mineral = 'amethyst' | 'sapphire' | 'turquoise' | 'emerald' | 'amber';

export type MineralTokens = {
  label: string;
  domain: string;
  text: string;
  textHover: string;
  textDeep: string;
  onDark: string;
  onDarkSecondary: string;
  soft: string;
  solid: string;
  solidHover: string;
  border: string;
  dot: string;
};

export const MINERALS: Record<Mineral, MineralTokens> = {
  amethyst: {
    label: 'Amethyst',
    domain: 'Soberanía Protocol · Sovereignty',
    text: 'text-violet-600',
    textHover: 'hover:text-violet-500',
    textDeep: 'text-violet-800',
    onDark: 'text-violet-300',
    onDarkSecondary: 'text-violet-200',
    soft: 'bg-violet-50',
    solid: 'bg-violet-600',
    solidHover: 'hover:bg-violet-500',
    border: 'border-violet-400/40',
    dot: 'bg-violet-500',
  },
  sapphire: {
    label: 'Sapphire',
    domain: 'Soberanía Enterprise · Governance',
    text: 'text-indigo-600',
    textHover: 'hover:text-indigo-500',
    textDeep: 'text-indigo-800',
    onDark: 'text-indigo-300',
    onDarkSecondary: 'text-indigo-200',
    soft: 'bg-indigo-50',
    solid: 'bg-indigo-600',
    solidHover: 'hover:bg-indigo-500',
    border: 'border-indigo-400/40',
    dot: 'bg-indigo-500',
  },
  turquoise: {
    label: 'Turquoise',
    domain: 'Governed Access',
    text: 'text-teal-600',
    textHover: 'hover:text-teal-500',
    textDeep: 'text-teal-800',
    onDark: 'text-teal-300',
    onDarkSecondary: 'text-teal-200',
    soft: 'bg-teal-50',
    solid: 'bg-teal-600',
    solidHover: 'hover:bg-teal-500',
    border: 'border-teal-400/40',
    dot: 'bg-teal-500',
  },
  emerald: {
    label: 'Emerald',
    domain: 'Assurance',
    text: 'text-emerald-600',
    textHover: 'hover:text-emerald-500',
    textDeep: 'text-emerald-800',
    onDark: 'text-emerald-300',
    onDarkSecondary: 'text-emerald-200',
    soft: 'bg-emerald-50',
    solid: 'bg-emerald-600',
    solidHover: 'hover:bg-emerald-500',
    border: 'border-emerald-400/40',
    dot: 'bg-emerald-500',
  },
  amber: {
    label: 'Amber',
    domain: 'AI Governance (reserved)',
    text: 'text-amber-600',
    textHover: 'hover:text-amber-500',
    textDeep: 'text-amber-800',
    onDark: 'text-amber-300',
    onDarkSecondary: 'text-amber-200',
    soft: 'bg-amber-50',
    solid: 'bg-amber-600',
    solidHover: 'hover:bg-amber-500',
    border: 'border-amber-400/40',
    dot: 'bg-amber-500',
  },
};
