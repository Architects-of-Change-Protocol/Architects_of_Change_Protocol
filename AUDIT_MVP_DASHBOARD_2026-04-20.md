# AOC Dashboard MVP Audit (Control Plane)

**Date:** 2026-04-20  
**Scope audited:** current repository state for MVP control-plane dashboard readiness

## 1) Executive Summary
- Repo has strong protocol and hosted-runtime primitives for consent/capability/access/audit, but **no actual dashboard application** yet (only marketing/landing pages).
- Frontend routing is currently path-conditional (`/enterprise` vs fallback landing) with no router/auth/session layer, so the 3-surface dashboard model is not implemented.
- Runtime has useful API endpoints (`/data/access`, `/trust/consent/grant`, `/audit/events`, `/usage/summary`) and in-memory services that can back an MVP prototype.
- Current auth is machine/API-key based (`x-api-key`) and in-memory; there is no user login, role identity, or tenant/session model.
- Consent/Capability/Audit protocol-level meta structures exist and are reasonably mature; they can anchor AOC control-plane objects without imposing business schemas.
- Persistence is missing across runtime services (in-memory maps only), which is the biggest blocker for a real multi-actor dashboard MVP.
- There is notable duplication/legacy surface in frontend (`frontend/landing/*` and `frontend/app/src/landing/*`) and at least one broken enterprise-page JSX composition that should be corrected before building on it.
- Overall: **Go for incremental build only if P0 foundations are done first** (auth/roles, persistent storage, proper app routing + dashboard shells).

## 2) What Already Exists

### Routing / app entry
- Vite React app bootstraps through `main.tsx` and renders a single `App` component.
- `App` does simple pathname switching: `/enterprise` -> enterprise landing, all other paths -> marketing landing.

### Existing frontend surfaces
- Marketing landing page for neutral protocol messaging exists.
- Enterprise marketing page exists (not a console dashboard).
- Links point to `/app`, but there is no distinct app-console route implementation.

### Runtime API + service layer (control-plane adjacent)
- Hosted runtime HTTP server exists with endpoint routing, API-key auth, rate limiting, decision logging, and capability enforcement hook points.
- Endpoints include: enforcement, execution authorization, capability mint, trust credential/verify/consent grant, data access, audit events, usage summary.
- SDK client supports hosted calls for trust/access/audit/usage endpoints.

### Protocol/domain model primitives
- Protocol consent meta-structure includes subject/grantee/scope/permissions/expiry/marketMakerId.
- Protocol capability meta-structure includes parent consent, scope/permissions, expiry/not-before, optional marketMakerId.
- Protocol audit event meta-structure exists with event type, subject/requester, reason codes, consent/capability refs, metadata.

### Consent / permission / access logic
- In-memory trust service supports credential registration, consent grant, identity verification, and consent-required checks.
- Data access service creates allow/deny decisions and generates short-lived access tokens.

### Audit/event logic
- Runtime audit service aggregates trust/payout/access audit events and filters by subject/consumer/event/time.
- Separate in-memory protocol audit service records protocol audit events with query filtering.

### Wallet-related integration relevant to AOC flows
- Trust credential records include optional `wallet_address`, and trust audit emits `WALLET_LINKED` when present.
- HRKey integration adapter exists around the in-memory vault, including consent/capability/access mediation.

### Tests
- Extensive test coverage exists across protocol/runtime/vault/integration modules, including hosted runtime flows for trust, data access, audit queries, and SDK capability flow.

## 3) What Exists But Is Incomplete

### App routing and entry model
- Current frontend has no router, no protected routes, no `/app` dashboard entry shell, and no role-based branching despite links implying app launch.
- Legacy `frontend/landing/README.md` explicitly says router/app pages are not in place.

### Auth/session/role detection
- Runtime auth is API-key only; no end-user auth session or role detection for user vs market-maker dashboards.
- No frontend auth hooks/providers/guards are present.

### Dashboard surfaces
- Existing pages are marketing/education pages, not control dashboards.
- No neutral entry dashboard after auth, no user dashboard, no market-maker dashboard components/shells.

### Protocol objects vs requested MVP object set
- Core meta objects largely exist (consent/capability/audit), but naming/shape for explicit `AccessRequest` and `ConsentDecision` dashboard-domain DTOs are not exposed as a first-class app-domain module.
- Current data-access request/decision is runtime-specific and in-memory; not persisted as dashboard-state entities.

### Runtime docs drift
- `runtime/README.md` states only 3 endpoints and “dashboards not included,” but code now implements additional endpoints (`/data/access`, trust/payout/audit/usage), indicating documentation drift.

### Enterprise page quality
- Enterprise page contains malformed JSX structure in integration section (nested section content appears inside heading block), which is risky to build on directly.

## 4) What Is Missing Entirely

### P0 for requested MVP product
- No authenticated neutral AOC entry dashboard that detects role and routes accordingly.
- No user dashboard with: Active Accesses, Requests Inbox (approve/deny), Activity feed, Revoke access, summary metrics.
- No market-maker dashboard with: Active Access Inventory, Requests Sent, Expiring Soon, audit/access events, summary metrics.

### Backend/API for dashboard workflow completeness
- No explicit endpoints for request inbox lifecycle (create request, list pending-by-user, approve, deny, revoke, list active grants by actor, list expiring grants).
- No persistent query model for dashboard cards and lists.

### Storage / DB / Supabase
- No Supabase integration, no DB schema/migrations, no ORM models, no durable persistence layer.

### Product-facing authn/authz
- No identity provider integration, no session cookies/JWT flow, no RBAC claims, no tenant/market-maker membership model.

### Operational auditability for product
- No durable immutable event store (runtime audit is in-memory).
- No correlation IDs exposed end-to-end for dashboard-level event tracing between UI actions and protocol events.

## 5) Technical Risks / Debt
- **Routing debt:** path-conditional rendering in `App.tsx` will not scale for multi-surface dashboard navigation.
- **Auth mismatch:** API-key auth is service-level, not human-user auth; cannot support role-based dashboards safely.
- **State durability risk:** core runtime/trust/access/audit services keep state in memory maps; restart wipes control-plane truth.
- **Duplicate frontend stacks:** `frontend/landing/*` and `frontend/app/src/landing/*` create maintenance ambiguity and risk building on the wrong path.
- **Stale audit artifact risk:** repository includes older audit report with now-stale claims (e.g., vault truncation), reducing trust in docs unless curated.
- **UI correctness risk:** malformed enterprise JSX section suggests page integrity issues even before dashboard work.

## 6) Recommended MVP Build Plan

### P0 (must do first)
1. **Introduce real app routing + surface shells**
   - Add route map for neutral entry, user dashboard, market-maker dashboard.
   - Keep existing marketing pages, but separate from authenticated app shell.
2. **Implement auth/session + role detection**
   - Add auth provider + session bootstrap + role claims (`user`, `market_maker`, optional admin).
   - Route guard by role and tenant membership.
3. **Add persistence layer for control-plane objects**
   - Persist AccessRequest, ConsentDecision, GrantedAccess, AuditEvent as durable tables.
   - Add indexes for inbox, active grants, expiring soon, and event feeds.
4. **Expose dashboard APIs for lifecycle actions**
   - Requests inbox list/approve/deny; active access list/revoke; expiring soon list; audit feed.

### P1 (MVP quality)
1. **Map runtime protocol events to dashboard-domain read models** (denormalized projections for cards/feeds).
2. **Unify/clean duplicate landing codepaths** and fix enterprise JSX validity.
3. **Add role-specific dashboard metrics endpoints** with tested filters/pagination.
4. **Harden docs** so runtime README reflects actual endpoints and intended dashboard integration.

### P2 (post-MVP)
1. Canonical vault object mapping layer and market-maker schema mapping adapters.
2. Richer analytics/insights and alerting.
3. Tenant admin and policy-management UX enhancements.

## 7) Proposed File / Module Changes (aligned with current repo)

### Frontend (extend existing React app in `frontend/app/src`)
- `frontend/app/src/router/` (new): centralized route definitions + guarded routes.
- `frontend/app/src/features/entry/` (new): neutral role-detection landing after auth.
- `frontend/app/src/features/user-dashboard/` (new): Active Accesses, Inbox, Activity, Revoke.
- `frontend/app/src/features/market-maker-dashboard/` (new): Inventory, Requests Sent, Expiring Soon, Audit.
- `frontend/app/src/features/shared/` (new): audit feed table, metric cards, status pills.
- `frontend/app/src/auth/` (new): session context/hooks/role utilities.

### Runtime/API (extend existing `runtime/api` and service modules)
- `runtime/api/routes.ts`: add explicit dashboard lifecycle endpoints.
- `runtime/access/` + new `runtime/consent/` + `runtime/grants/` modules: clear application-domain services for AccessRequest/Decision/GrantedAccess.
- `runtime/audit/`: add durable backend adapter interface (in-memory + DB implementation).

### Persistence layer
- Add `db/` (new) for schema + migrations + repositories used by runtime services.
- Keep protocol core decoupled; persistence belongs to runtime/app layer.

### Cleanup / de-dup
- Keep one canonical landing implementation path (prefer `frontend/app/src/landing`).
- Archive or remove stale duplicate scaffold once not needed.

## 8) Testing Gaps
- Missing frontend tests for role-based routing and protected dashboard access.
- Missing end-to-end tests for full request lifecycle: request -> inbox approve/deny -> grant active -> revoke -> audit trail consistency.
- Missing persistence tests (restart durability, idempotency, race conditions on approve/deny/revoke).
- Missing contract tests for dashboard endpoints (pagination/filter/date-window correctness).
- Missing authorization tests proving market maker A cannot view market maker B data and users cannot cross-access.

## 9) Final Go/No-Go Assessment
- **Assessment:** **Conditional GO**.
- This repo can support MVP incrementally **if** P0 foundations are implemented first (real routing, auth+roles, durable storage, dashboard lifecycle endpoints).
- Without those P0 items, shipping a dashboard MVP would be a facade over non-durable runtime state and no true role/session model, which is a **No-Go** for production-like use.
