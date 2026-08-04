# W007A — AOC Assurance Commercial UX Audit

| Field | Value |
|---|---|
| Document ID | W007A |
| Scope | `frontend/app/src/landing/AssurancePage.tsx` (+ `assurance.css`) evaluated against the AOC Commercial Design System (W005/W006) and the Protocol → Enterprise → Governed Access → Assurance commercial journey |
| Mode | Audit only — see Implementation Decision |
| Reference inputs | `AssurancePage.tsx`, `assurance.css`, `enterprise/AssuranceSection.tsx`, `EnterprisePage.tsx`, `enterprise/primitives.tsx`, `enterprise/Nav.tsx`, `enterprise/content.ts`, `landing/routes.ts`, `governed-access/*.tsx`, `docs/commercial/SK005-AOC-ENTERPRISE-PITCH-DECK.html`, `docs/commercial/SK006-AOC-ENTERPRISE-ONE-PAGER.html`, `docs/w004-protocol-digital-assets-sovereignty-refactor.md`, `docs/w005-enterprise-pitch-deck-design-system.md`, `docs/w006-governed-access-product-landing.md`, `docs/audits/SAF-002-Assessment-Methodology-v1.0.md`, `src/data/constitutional-index.ts` |

---

## Executive summary

The instinct going into this audit was that the preferred outcome — "no significant changes required" — would likely hold, since Assurance already exists, already talks about Governance/Accountability/Sovereignty, and already has a working commercial funnel (Stripe checkout, pricing, FAQ).

That is not what the evidence shows. `AssurancePage.tsx` is not a stylistic outlier of an otherwise-consistent narrative — it describes **a different product** than the one the rest of the commercial system (W005 pitch deck, W006 one-pager, `AssuranceSection.tsx` on the Enterprise homepage, and the SAF-001/SAF-002 methodology docs) has already committed to calling "Assurance."

Two products currently share the name "Assurance":

1. **Canonical Assurance** (SK005 pitch deck slide 7, SK006 one-pager, `AssuranceSection.tsx`, and the formal `SAF-002-Assessment-Methodology-v1.0.md`): *"Prove your governance posture, continuously."* A 5-step engagement (Assessment → Recommendations → Implementation → Validation → Continuous Assurance) built on a real, documented control catalog (SAF-001) and audit methodology (SAF-002) — 4 control domains, 10 controls, 3 eligibility tiers, "AOC SAF v1.0.0 — implemented, API-backed, evidence-driven." It is the natural service that follows *after* an organization adopts Governed Access: we validate that what you built stays compliant with your own policy as you evolve.

2. **`AssurancePage.tsx`'s actual product**: *"How much of your company's intelligence would survive tomorrow?"* An Institutional Intelligence Risk / Knowledge Loss / Key Person Dependency / Decision Amnesia assessment, benchmarked against a public "Constitutional Index" that scores *other companies'* AI governance posture, sold as three tiered, self-serve Stripe-checkout products ($99.99 report delivered in 72 hours / $499.99 assessment / "Contact Sales"), with a founder essay and LinkedIn link. It never mentions Governed Access, SAF, control domains, or a control catalog anywhere in its ~1,150 lines.

This is the finding that should drive the decision, more than any visual inconsistency (though those are real too, see below): **a visitor who reads "Assurance: prove your governance posture, continuously" on the Enterprise homepage and clicks "Explore the full Assurance service" lands on a page that sells a completely unrelated knowledge-management-risk product.** That is a broken commercial promise, not a design nit.

The visual design system divergence is also real and severe (full-page dark/emerald theme vs. the light-primary/indigo system every other 2026 page follows, a bespoke 2,158-line CSS file duplicating — not reusing — `primitives.tsx`), but it is secondary to the narrative fork. Fixing the visuals without resolving which "Assurance" the company is actually selling would just make the wrong product look more official.

**This is not a "no changes required" audit.** It is also not something this audit will implement unilaterally: the fix requires a product decision (which Assurance narrative is the real one going forward, and what happens to the other), and the page in question has live Stripe checkout links processing real payments. See **Implementation Decision** at the end.

---

## 1. Commercial Audit Report

**Does Assurance already fit inside the commercial narrative?**

Structurally, yes — Assurance sits correctly in the information architecture (`ROUTES.enterprise.services.assurance`, nav: Enterprise → Services → Assurance, breadcrumb Protocol → Enterprise → Services → Assurance). It is not competing for a top-level nav slot with Enterprise or Governed Access.

Substantively, no. The **content** behind that nav slot does not deliver what the rest of the funnel promises about it:

- Enterprise homepage (`AssuranceSection.tsx`, deck slide 7) promises: continuous governance-posture validation of a system you've already built with AOC, backed by a real control catalog.
- The page it links to (`AssurancePage.tsx`) delivers: a standalone knowledge-continuity risk consulting funnel with its own pricing, its own research initiative (Constitutional Index of AI industry players), and its own founder narrative — with no reference to Governed Access, the control catalog, or "continuous" anything.

A visitor following Protocol → Enterprise → Governed Access → Assurance does **not** experience a natural next step. They experience a hard product switch: from "we help you build and govern access to your data" to "buy a $99.99 report about whether your company would survive an employee resigning."

**Professional service vs. product/platform/dashboard/report positioning:**

- Canonical Assurance (deck/one-pager/`AssuranceSection.tsx`) reads correctly as a professional service: "our team integrates and continuously validates the system against your policies and audits" (SK006 one-pager). Good — evaluate, discover, recommend, validate, continuously improve.
- `AssurancePage.tsx` reads as a **productized, self-serve report business**: fixed price, fixed SKU, "Delivered within 72 hours," a Stripe `buy.stripe.com` checkout link, no discovery call implied for the two lower tiers. This is closer to "we sell you an audit report" than "we evaluate your organization as a service" — which is explicitly the positioning the brief says to avoid ("NOT an audit report").

---

## 2. Narrative Audit

Test: does Assurance answer exactly one question — *"How do I know if my architecture is truly Enterprise-ready?"*

`AssurancePage.tsx` answers a different question: *"How much of my company's intelligence would disappear if key people left?"* That is a coherent, well-written question — the risk-card copywriting (Key Person Risk, Decision Amnesia, Learning Failure, AI Context Risk, Knowledge Fragmentation, Continuity Risk) is genuinely strong, concrete, and non-generic. But it is not the architecture-readiness question the rest of the commercial system asks, and it never bridges to it. The "Governance / Accountability / Sovereignty" framework cards (`FRAMEWORK_CARDS`) reuse the same three words as the rest of the design system, but reapply them to organizational-knowledge continuity rather than to a system's access-control/evidence posture — the words are shared, the referents are not.

The page does contain one legitimate bridge section — "Assessment is the first step. Enterprise is how intelligence becomes durable," linking to `/?view=enterprise` — but it flows **backward** into Enterprise, not forward from it. There's no equivalent forward path from Governed Access into this page's actual content (nor should there be, since the content isn't about Governed Access at all).

**Why this happened (not a criticism, a diagnosis):** `docs/w005-enterprise-pitch-deck-design-system.md` states plainly that `AssurancePage.tsx` was *deliberately* left untouched during the W005 Enterprise redesign, "per the W003 migration notes," and that the new `AssuranceSection.tsx` is "the deck's own, much shorter Assurance slide" — a new, narrower concept authored for the redesign, sitting next to a much older, broader page that predates it. The fork is structural, not accidental: the deck's authors wrote a new, tighter Assurance concept without reconciling it against the standalone page already live at that URL.

---

## 3. Design System Audit

Compared against W005 tokens (`enterprise/primitives.tsx`, `docs/w005-enterprise-pitch-deck-design-system.md`):

| Dimension | W005/W006 system | `AssurancePage.tsx` | Consistent? |
|---|---|---|---|
| Background rhythm | Light-primary body (white/`slate-50`), exactly two dark `#0B1220` bookend sections (hero, closing CTA) | Fully dark throughout (`bg-[#070d0b]`) — every section, not just hero/CTA | **No** |
| Accent color | `indigo-600` / `indigo-50` / `indigo-800` | `emerald-400` / `emerald-500` / `emerald-950` | **No** |
| Typography scale | Tailwind defaults via `primitives.tsx` (`SectionHeader`, `Eyebrow`) | Own inline Tailwind classes, mostly compatible sizes but not routed through the shared header/eyebrow components | Partial |
| Cards | `Card` (`rounded-2xl border-slate-200 bg-slate-50 shadow-[...]`) | Own `.aoc-risk-card`, `rounded-2xl border border-white/10 bg-white/[0.02]` — same radius idiom, opposite surface treatment (dark glass vs. light slate) | **No** |
| Buttons/CTA | Indigo-600 pill, "Request Technical Assessment" | Emerald-500 pill, "Assess Intelligence Risk" | **No** |
| Pipeline/stepper | `PipelineRail` from `primitives.tsx` (indigo dot, slate line) | Not used on the full page (the homepage's `AssuranceSection.tsx` does use it, but the assessment tiers on the full page use plain pricing cards instead of any stepper) | N/A on this page |
| CSS approach | Tailwind utility classes + one shared `primitives.tsx` | 2,158-line bespoke `assurance.css` with ~120 hand-rolled classes (`.aoc-risk-card`, `.assurance-learn-more-*`, `.ci-leader-*`, custom keyframes) that duplicate what `Card`/`Chip`/`SectionHeader` already do, in a different visual language | **No** |
| Dark theme | Two intentional dark bookends only | Entire page is dark | **No** |
| "Premium SaaS" feel | Yes (deck-derived) | Also premium, but a *different* premium — closer to the Protocol page's dark/glow aesthetic (`AocLandingPage.tsx`) than to Enterprise's light system | Internally consistent with Protocol, not with Enterprise |

Net: this is not a page with a few stray classes to fix. It is a second, complete, self-consistent design system running in parallel to the one W005 established, applied to the one page in the Enterprise→Services hierarchy that should be using the W005 system.

One nuance worth naming: the page **is** visually polished and internally coherent on its own terms (consistent green/dark palette, real hover states, real modal, respects `prefers-reduced-motion`). This is not "sloppy," it's "correctly executed against the wrong system."

---

## 4. Component Audit

| Component | Should reuse | Currently | Verdict |
|---|---|---|---|
| Section headers/eyebrows | `SectionHeader`, `Eyebrow` (`primitives.tsx`) | Hand-rolled `<p className="text-xs ... text-emerald-400">` + `<h2>` pairs, repeated ~7 times | Should reuse |
| Cards (risk cards, pricing cards, FAQ items, framework cards) | `Card` | Hand-rolled `.aoc-risk-card`, inline `rounded-2xl border-white/10 bg-white/[0.02]`, repeated ad hoc | Should reuse |
| Pill/badge ("Risk Detected", "Most Popular", "Intelligence Gap") | `Chip` | Hand-rolled inline spans per badge type | Should reuse |
| Nav shell | `EnterpriseNav` (used by `EnterprisePage.tsx` and `GovernedAccessPage.tsx`) | Own bespoke `<nav>` block duplicating mobile-menu, sticky, and logo logic already solved once in `EnterpriseNav` | Needs refactoring |
| Footer | `ProtocolFooter` (used everywhere else, incl. Enterprise/Governed Access via `accent="indigo"`) | Own bespoke `AssuranceFooter` function with its own link-group layout | Needs refactoring |
| Breadcrumbs | `Breadcrumbs` | **Already reused correctly** | Reused appropriately |
| Logo | `LogoRotating` | **Already reused correctly** (`inverted` prop) | Reused appropriately |
| Benchmark explorer (`ConstitutionalBenchmarkExplorer`) | N/A — genuinely unique data visualization (governance/sovereignty scatter plot across benchmarked orgs) | Bespoke, appropriately so | Should remain unique |
| Modal (risk detail) | No existing shared modal in `primitives.tsx` | Bespoke `aoc-risk-modal-*`, well-built (focus handling, arrow-key nav, escape) | Should remain unique, but candidate to promote into a shared primitive if other pages need a modal later — not required now |

Two components (`Breadcrumbs`, `LogoRotating`) are reused correctly today, which is worth crediting — the page isn't ignoring the shared library out of neglect, it simply predates the primitives that would let it use more of it.

---

## 5. Illustration Audit

| Illustration | Classification | Why |
|---|---|---|
| 6 risk-card line icons (Key Person, Decision Amnesia, Learning Failure, AI Context, Knowledge Fragmentation, Continuity) | **KEEP** | Purpose-built, each maps 1:1 to a specific risk concept, legible at small size, consistent stroke weight |
| Risk detail modal icon reuse (same icon, larger) | **KEEP** | Correct pattern — icon carries meaning across summary → detail |
| `ConstitutionalBenchmarkExplorer` scatter plot | **KEEP** | Genuinely explains something (governance × sovereignty positioning across benchmarked orgs); not decorative |
| Governance-leader / sovereignty-leader ranked lists (`ci-leader-*`) | **KEEP** | Functional ranking display, not illustrative filler |
| Emerald radial "glow" backgrounds (`assurance-hero-glow`, `assurance-assessments-glow`) | **UPDATE** (if page is realigned to the W005 system) | Purely atmospheric; not wrong in isolation but is the single biggest visual signal that this page is a different product from Enterprise/Governed Access, whose hero/CTA glows (if any) key off `#0B1220`/indigo, not emerald |
| Custom checkmark/badge glyphs (`✓`, "Risk Detected", "Intelligence Gap" badges) | **KEEP** | Small, functional, not decorative |

No illustration here needs outright removal or merging — the illustration layer is actually one of the stronger parts of the page. The classification concern is entirely about palette (emerald→indigo) if/when the narrative question is resolved in favor of visual unification, not about the illustrations' existence or quality.

---

## 6. Animation Audit

| Animation | Teaches something? | Verdict |
|---|---|---|
| Risk card hover sweep (`aoc-risk-card-sweep`) + badge reveal ("Risk Detected" fades in on hover) | Marginal — reveals a classification label, mildly informative, mostly decorative polish | Borderline; not harmful, low priority |
| Icon pulse on hover (`aoc-risk-icon-pulse`) | No — pure decoration | Candidate to simplify, not urgent |
| Modal backdrop/content fade-in (`aoc-modal-backdrop-in`, `aoc-modal-in`) | Yes — standard, expected modal affordance, aids comprehension of state change | Keep |
| Sticky CTA slide-in on scroll | Yes — signals a persistent action is now available | Keep |
| `prefers-reduced-motion` handling | N/A | Correctly implemented (`animation: none` overrides present) — credit where due |

No animation on this page is gratuitously decorative to the point of removal. This is a well-behaved animation layer; it simply speaks the wrong color language.

---

## 7. Commercial Conversion Audit

- **CTO**: Would understand *a* reason to buy, but the reason ("assess intelligence risk / knowledge loss") is not the reason they arrived (evaluating architecture readiness via Enterprise/Governed Access). Conversion intent gets redirected mid-funnel rather than fulfilled.
- **VP Engineering**: The three tiers are legible and well-scoped as knowledge-risk products, but nothing here tells them what they'd receive *if they came from the Enterprise/Governed Access architecture-review context* — because the page was never written for that visitor.
- **Security Lead**: The FAQ correctly and explicitly disclaims being a compliance audit ("No. AOC Assurance is an Institutional Intelligence Risk, Knowledge Loss, Continuity, and Constitutional Resilience assessment... not positioned as a regulatory certification.") — this is honest and well-handled *for the product this page actually sells*.
- **Executive**: The business value (institutional knowledge continuity, key-person risk) is clearly and compellingly stated on its own terms — this is genuinely good copy for the product it's selling. It just isn't the product Enterprise/Governed Access primed them to expect.

**Would this page increase trust / reduce buyer uncertainty for someone arriving from Governed Access?** No — the abrupt narrative and visual switch reads as either two different companies or an acquisition/rebrand artifact, which *increases* uncertainty at exactly the point (bottom of funnel, ready to buy) where it matters most.

**Would it generate qualified leads?** Likely yes, but for a different buyer/intent than the one the Enterprise funnel is qualifying for. The Stripe self-serve tiers may be perfectly good top-of-funnel/lead-gen for the Constitutional Index research angle — that's a legitimate motion, just not "Enterprise Services → Assurance."

---

## 8. CTA Review

Required standard (per brief, and independently confirmed as the actual site-wide convention in `Nav.tsx`, `Hero.tsx`, `CtaSection.tsx`, `governed-access/Assessment.tsx`, `EnterpriseNav`): **"Request Technical Assessment"**, never "Contact Sales" / "Book Demo" / "Learn More" / "Request Pricing."

`AssurancePage.tsx` CTAs:

| Location | Current label | Correct per standard? |
|---|---|---|
| Nav, hero, sticky bars | "Assess Intelligence Risk" | Off-standard (understandable given the different product, but breaks the site-wide single-CTA convention) |
| Tier 1 | "Get Intelligence Risk Snapshot" → Stripe checkout | Self-serve checkout, not an assessment request |
| Tier 2 | "Start Organizational Intelligence Assessment" → Stripe checkout | Self-serve checkout, not an assessment request |
| Tier 3 | "Contact Sales" → Tally intake form | Explicitly the CTA the brief says to reject |
| Enterprise bridge | "Explore AOC Enterprise" | Correctly secondary/soft, no issue |

Three of five CTA instances on this page use exactly the language the brief calls out as incorrect (`Contact Sales`) or functionally equivalent variants (`Get X`, `Start X` self-serve checkout flows rather than a human-reviewed assessment request). This is consistent with the page selling a productized report rather than a professional service — the CTA problem is downstream of the positioning problem, not a separate bug.

---

## 9. Technical Accuracy

This is the one area with no findings. The footer and FAQ are careful and well-lawyered:

- "AOC Assurance does not certify organizations as safe, secure, compliant, trustworthy, or risk-free."
- "Constitutional scores represent analytical assessments and should not be interpreted as guarantees, certifications, or endorsements."
- FAQ explicitly disclaims being a compliance audit, a knowledge-management tool, or a replacement for the Constitutional Index.

No claims of guaranteed compliance, certification, security auditing, legal opinion, SOC2/ISO replacement, or vendor lock-in were found. **No changes needed here.**

---

## Prioritized Recommendations

| # | Recommendation | Classification | Rationale |
|---|---|---|---|
| 1 | Resolve the product-narrative fork: decide whether "Assurance" (Enterprise → Services → Assurance) is (a) the SAF-based continuous governance-posture validation service described in the deck/one-pager/`AssuranceSection.tsx`/SAF-002, (b) the Institutional Intelligence Risk product currently live at `/?view=assurance`, or (c) both, clearly separated under different names/URLs so neither promise is broken | **Critical** | Everything else in this list is downstream of this decision; implementing visual/CTA fixes without it just polishes a broken promise |
| 2 | Once (1) is resolved, replace "Assess Intelligence Risk" / "Contact Sales" CTAs with the single site-wide "Request Technical Assessment" standard (or an equally clear service-request CTA, if the product is kept as a distinct offering with its own honest label) | **Critical** | Direct violation of the explicit CTA standard; affects the highest-intent moment in the funnel |
| 3 | Re-platform the page onto `primitives.tsx` (`Card`, `Chip`, `SectionHeader`, `Eyebrow`, `EnterpriseNav`, `ProtocolFooter`) and the indigo/light design tokens, retiring the bespoke `assurance.css` in favor of the shared system | **Recommended** | Real, demonstrable design-system inconsistency; but should follow, not precede, the narrative decision — no point re-skinning a page whose product identity is still unsettled |
| 4 | Add an explicit, forward-facing bridge from Governed Access into whatever Assurance becomes (today there's only a backward bridge from Assurance into Enterprise) | **Recommended** | Currently the "natural next step" test fails in the forward direction |
| 5 | If the Institutional Intelligence Risk / Constitutional Index product is kept as a distinct offering (option (c) above), give it its own identity in the nav (not nested under Enterprise → Services → Assurance) so it stops overloading the word "Assurance" | **Recommended** | Removes the naming collision at its root rather than patching around it |
| 6 | Swap the emerald accent/dark-glow atmosphere for indigo/light tokens on non-bookend sections, once (1) and (3) are underway | **Cosmetic** (sequenced after 3) | Visual-only once the structural work is done |
| 7 | Simplify the decorative icon-pulse hover animation | **Optional** | Not harmful, negligible impact either way |

---

## Implementation Decision

**MODERATE REFACTOR** — conditional and sequenced, not immediate.

Justification: the findings are not stylistic preference (which the brief correctly says not to act on) — they are (a) a genuine, evidence-backed narrative collision between two products both called "Assurance," corroborated independently by the SAF-001/SAF-002 methodology docs existing for one product and not the other, and (b) a full-page design-system divergence from W005/W006 that is real and severe, not a handful of stray classes. Both clear the bar in the brief for "materially improves commercial clarity, narrative consistency, or design system consistency."

However, per the brief's own rule, **this audit does not perform the implementation now**, for two reasons beyond the standard "moderate/full refactors get flagged, not auto-executed" posture:

1. **Recommendation #1 is a product decision, not an engineering one.** Rewriting `AssurancePage.tsx` to match `AssuranceSection.tsx`'s SAF-based narrative would delete a working, well-written knowledge-risk-consulting product and its research initiative (Constitutional Index) without stakeholder sign-off that this is actually the intended sunset. Rewriting `AssuranceSection.tsx`/the deck instead would contradict the newer, more recently authored, more rigorously backed (SAF-001/SAF-002) commercial direction. Only the user/stakeholders can make this call.
2. **The page has live monetization** (real `buy.stripe.com` checkout links, real prices). Changing CTAs, positioning, or removing pricing tiers on a page that's currently taking payments is a change with real business consequences and should not happen inside a UX audit without explicit confirmation.

Recommendations #3, #4, #6, #7 (the pure design-system/animation items) do not depend on resolving #1 and could be executed independently if desired — but doing so first risks visually legitimizing whichever narrative happens to get styled, prejudging the product decision that should come first.

---

## Acceptance criteria — status

- ✓ Enterprise remains the platform
- ✓ Governed Access remains the product
- ✗ Assurance remains *the* assessment service — currently there are two, under one name, with conflicting content
- ✗ Design System consistency verified — full-page divergence found
- ✗ Commercial journey preserved — the journey breaks at the Enterprise → Assurance handoff
- ✓ Shared components reused appropriately *where currently in use* (`Breadcrumbs`, `LogoRotating`) — but the majority of applicable shared components are not
- ✓ Recommendations prioritized
- ✓ No unnecessary redesign attempted — implementation deliberately withheld pending a product decision
- ✓ One branch
- ✓ No PR opened for page changes (only this audit report)

---

## Final Verdict

**W007A COMPLETE — MODERATE REFACTOR RECOMMENDED**
