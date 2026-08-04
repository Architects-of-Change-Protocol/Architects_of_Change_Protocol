<!--
This file is a verbatim content transcription of SK005-AOC-ENTERPRISE-PITCH-DECK.html
(the canonical HTML pitch deck, in this same folder). No separate Markdown pitch deck
was authored independently — only the HTML deck was ever produced. This transcription
exists so the deck's narrative is readable/diffable as plain text and reusable outside
an HTML renderer (e.g. for the Enterprise landing page implementation), without altering
a single word of the deck's actual copy. The HTML file remains the canonical visual and
narrative source; this file must be kept in sync with it, not the other way around.
-->

# AOC Enterprise — Official Pitch Deck (SK005)

Governed access, provider neutrality, and continuous assurance.

---

## 1. Hero

**AOC Enterprise**

Governed access to every system your product depends on.

`PROVABLE` · `REVOCABLE` · `AUDITABLE`

Request → Decision → Grant → Evidence

---

## 2. Storage solved access. Not governance.

Authentication, signed URLs, and permissions confirm access happened. None of them prove it should have.

**You already have**
- Storage
- Authentication
- Signed URLs
- Permissions

**None of them answer**
- Who approved this, and under what policy?
- Does it expire on its own?
- Can you prove what happened after?

---

## 3. Governed Access

The layer that decides, records, and proves what happens between a request and access.

`Request` → `Governed Access` → `Access`

---

## 4. One request, one provable record

Every stage produces one immutable record — nothing is overwritten, only added to.

1. Request
2. Decision
3. Obligations
4. Grant
5. Translation
6. Execution
7. Usage
8. **Evidence**

**Reference scenario:** M&A data-room access — outside counsel is granted a 24-hour, read-only, watermark-flagged view of a confidential target report. Every view is logged; nothing is ever downloaded.

*(Reference: `docs/commercial/R006-COMMERCIAL-REFERENCE-DEMO.md`)*

---

## 5. One governance layer. Any provider underneath.

Enterprise never holds a credential. Only grant status and usage cross the boundary.

- **AOC PROTOCOL** — identity · consent · capability tokens · audit envelopes
- **AOC ENTERPRISE** — Decision · Obligation · Grant · Revocation · Usage · Evidence — cannot hold a credential or SDK type
- **PROVIDER ADAPTER** — reads only resource · status · expiry — writes only usage events
- Providers: **Pinata** (LIVE), S3 (ROADMAP), Azure Blob (ROADMAP), Google Drive (ROADMAP), SharePoint (ROADMAP)

---

## 6. What changes when access is governed

One model. Three audiences. The same evidence record answers all three.

**Business**
- Provable, revocable access
- Gaps surface before a grant — not after an incident

**Engineering**
- One contract, not per-provider glue
- A new provider is an adapter, not a rewrite

**Commercial**
- Evidence, not just logs, for security review
- A faster path through enterprise deal cycles

---

## 7. Assurance: prove your governance posture, continuously

The engagement model we run with you — and the evidence engine underneath it.

1. **Assessment**
2. Recommendations
3. Implementation
4. Validation
5. Continuous Assurance

**What's running underneath:** 4 control domains · 10 controls · 3 eligibility tiers

*AOC SAF v1.0.0 — implemented, API-backed, evidence-driven. Not a certification authority.*

---

## 8. The build-it-yourself alternative, priced honestly

Six ways Governed Access changes what your team spends time and risk on.

- **Engineering focus** — Ship product, not per-provider glue code
- **Lower implementation cost** — Adopt a reviewed model, not a blank page
- **Lower ownership cost** — Provider logic lives in a swappable adapter
- **Faster enterprise sales** — Answer 'prove it' with a record, not a promise
- **Better auditability** — Read a chain — don't reconstruct logs
- **Reduced architectural risk** — A provider migration touches one adapter

---

## 9. Where the governance gap is most expensive

Six segments where 'prove what happened to this document' is routine, not rare.

- **Legal Platforms** — Tight, changing access windows across diligence and discovery
- **Healthcare** — Conditions must be enforced, not just promised
- **Enterprise SaaS** — Every customer storage integration becomes bespoke access logic
- **Document Platforms** — Access governance is the core product, not a bolt-on
- **AI Platforms** — Agents request access at machine speed and volume
- **Financial Services** — Access must be provable years after the fact

---

## 10. How we work together

Start small and specific. Scale only if it fits.

1. **Technical Assessment** — Gap analysis
2. Design Partner — Working integration
3. Implementation — Validated end-to-end
4. Enterprise Platform — Production deployment
5. Continuous Assurance — Ongoing evidence

*Most engagements start with a single Technical Assessment call.*

---

## 11. What's real today

No maturity claim here goes further than the architecture behind it.

**Available today**
- Enterprise core (v1.0.0)
- 27-endpoint API surface
- Agent Governance
- Evidence & Audit API
- Assurance Runtime (SAF v1.0.0)

**Design Partner stage**
- Governed Access lifecycle — architecture frozen
- Pinata Provider Adapter — conformance-tested
- Not yet a persisted, callable API

**Roadmap**
- Additional Provider Adapters (S3, Azure, Google Drive, SharePoint)
- Governed Access production wiring
- Continuous Assurance signal automation

---

## 12. CTA

**Request a Technical Assessment**

A scoped review of your environment. No commitment beyond the assessment itself.

Request a Live Demo · Request an Architecture Review
