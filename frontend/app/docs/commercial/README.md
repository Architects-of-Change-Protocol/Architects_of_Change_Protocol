# AOC Enterprise commercial collateral

## Purpose

This directory stores the canonical commercial source material for AOC
Enterprise. It exists so future implementation tasks (Enterprise landing,
Governed Access landing, Assurance landing, Pitch Deck maintenance, One
Pager maintenance, Executive Brief, Technical Assessment collateral,
Commercial Design System) can read exact, versioned, repository-backed
copies of this collateral instead of relying on files supplied ad hoc
outside the repository.

## Files in this directory

| File | Status |
|---|---|
| [`SK005-AOC-ENTERPRISE-PITCH-DECK.html`](./SK005-AOC-ENTERPRISE-PITCH-DECK.html) | Imported. Canonical interactive visual language for AOC Enterprise's commercial narrative. |
| `SK005-AOC-ENTERPRISE-PITCH-DECK.md` | **Not available.** No independently-authored Markdown pitch deck exists — only the HTML deck above was ever produced. See "Missing artifact" below. |
| [`SK006-AOC-ENTERPRISE-ONE-PAGER.html`](./SK006-AOC-ENTERPRISE-ONE-PAGER.html) | Imported. Canonical concise executive messaging (A4, print-oriented). |

Both imported files are verbatim, byte-for-byte copies of the source
artifacts as supplied — confirmed identical by diff against the original
uploads, with matching file sizes (43,779 bytes / 13,246 bytes). Neither
file was rewritten, reformatted, minified, or otherwise altered. Both are
fully self-contained single-file HTML documents (inline `<style>`, inline
SVG icon defs) with no relative asset dependencies, so no `assets/`
subdirectory was needed.

## Missing artifact

A Markdown Pitch Deck was listed as a possible required input for this
import, but no such file has ever been produced or provided — only the
HTML pitch deck exists as source. Per the "do not fabricate" rule this
import operates under, no Markdown deck substitute was created here.

(A separate, non-canonical verbatim *transcription* of the HTML deck's
text content into Markdown — for plain-text readability only, explicitly
labeled as a transcription and not independent canon — exists at the
repository root under `docs/commercial/` from an earlier, differently-scoped
task. It is not treated as authoritative here and should not be confused
with an actual Markdown Pitch Deck source. If a real Markdown Pitch Deck
is authored in the future, it belongs in this directory as
`SK005-AOC-ENTERPRISE-PITCH-DECK.md`.)

## Canonical responsibilities

- **Pitch Deck HTML** (`SK005-AOC-ENTERPRISE-PITCH-DECK.html`) — canonical
  commercial visual language: color tokens, typography, spacing, card and
  diagram treatment, section rhythm. Also the primary source for the
  commercial narrative sequence (its 12 slides), since no separate
  Markdown deck exists.
- **One Pager** (`SK006-AOC-ENTERPRISE-ONE-PAGER.html`) — canonical
  concise executive messaging: the Solution/Service/Foundation split, the
  "why not build it yourself" case, audience segments, and CTA copy in
  short form.
- **Pitch Deck Markdown** — would define the long-form narrative
  independently of visual markup, if it existed. It does not yet.

## Important rules

- These files are source material, not production application code.
- They must not be silently rewritten by website refactors. Any task that
  changes Enterprise commercial messaging or visual language should read
  these files first, not assume prior interpretations of them are still
  correct.
- The official AOC logo remains the immutable brand element regardless of
  what these files show (neither currently embeds it — see the W005 design
  system doc, `frontend/app/docs/w005-enterprise-pitch-deck-design-system.md`,
  for the recommended follow-up).
- The HTML Pitch Deck defines the commercial visual direction.
- The One Pager defines concise executive messaging.
- If a Markdown Pitch Deck is added in the future, it defines the
  long-form narrative and takes precedence over inferring narrative
  structure from the HTML deck's markup.

## Publication status

- **Documentation-only.** Nothing in this directory is application source
  code.
- **Not routed publicly.** No route, page, or component in
  `frontend/app/src` references or serves these files.
- **Not bundled into the application.** These files are outside `src/`
  and `public/`, and are excluded from the Vite build by directory
  location alone (the build only processes `index.html` and `src/`).
- **Not deployed** unless a future task explicitly chooses to publish one
  of these documents (e.g. serving the pitch deck at a public URL) — that
  would be a distinct, explicit decision, not a side effect of this import.
