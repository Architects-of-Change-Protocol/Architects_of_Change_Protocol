# Commercial collateral

This folder holds the AOC Enterprise commercial artifacts used as the
canonical design and narrative source for the W005 Enterprise landing
reconstruction (see
`frontend/app/docs/w005-enterprise-pitch-deck-design-system.md` for the
full token mapping and reuse-strategy writeup).

| File | Description |
|---|---|
| [`SK005-AOC-ENTERPRISE-PITCH-DECK.html`](./SK005-AOC-ENTERPRISE-PITCH-DECK.html) | Canonical HTML pitch deck (12 slides). Source of truth for both visual language and narrative. Open directly in a browser. |
| [`SK005-AOC-ENTERPRISE-PITCH-DECK.md`](./SK005-AOC-ENTERPRISE-PITCH-DECK.md) | Verbatim content transcription of the HTML deck, for readability/diffing as plain text. The HTML file is canonical; this transcription must be kept in sync with it, not the reverse. No independent Markdown deck was authored — only the HTML deck was ever produced. |
| [`AOC-ENTERPRISE-ONE-PAGER.html`](./AOC-ENTERPRISE-ONE-PAGER.html) | Canonical one-page executive summary (A4, print-oriented). Source for the Enterprise landing page's short-form messaging (solution/service/foundation split, "why not build it yourself", audience tags, CTA copy). |

These are commercial documents, not application code — they are not part
of the website build (`frontend/app`) and are not referenced by any
route or bundle. They live here purely as versioned reference material so
engineering work that draws on them (like the Enterprise landing page)
can cite an exact, diffable source instead of an external, unversioned
copy.
