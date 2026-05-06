import { useEffect, useMemo, useState } from 'react';

type TrustState = 'verified' | 'attested' | 'degraded' | 'contained';

type RuntimeNode = {
  id: string;
  label: string;
  kind: 'user' | 'relationship' | 'capability' | 'organization' | 'agent' | 'policy' | 'audit' | 'audience';
  x: number;
  y: number;
  trust: TrustState;
  health: number;
  scope: string;
};

type TelemetryEvent = { id: string; time: string; message: string; level: TrustState };

type ScenarioFrame = {
  id: string;
  title: string;
  what: string;
  why: string;
  enforcement: string;
  outcome: string;
  nodes: RuntimeNode[];
  events: TelemetryEvent[];
  trustDelta: string;
  capabilityDelta: string;
  policyIntervention: string;
  businessValue: string[];
};

type Scenario = {
  id: string;
  name: string;
  narrative: string;
  intro: string;
  finalOutcome: string;
  frames: ScenarioFrame[];
};

const trustClass: Record<TrustState, string> = {
  verified: 'text-emerald-300 border-emerald-400/40 bg-emerald-400/10',
  attested: 'text-cyan-300 border-cyan-400/40 bg-cyan-400/10',
  degraded: 'text-amber-300 border-amber-400/40 bg-amber-400/10',
  contained: 'text-violet-300 border-violet-400/40 bg-violet-400/10',
};

const baseNodes: RuntimeNode[] = [
  { id: 'u1', label: 'User Identity', kind: 'user', x: 12, y: 42, trust: 'verified', health: 96, scope: 'identity.zpd' },
  { id: 'r1', label: 'Relationship Contract', kind: 'relationship', x: 31, y: 25, trust: 'attested', health: 94, scope: 'consent.v2' },
  { id: 'c1', label: 'Capability Runtime', kind: 'capability', x: 48, y: 48, trust: 'attested', health: 92, scope: 'min-scope' },
  { id: 'o1', label: 'Enterprise Org', kind: 'organization', x: 70, y: 28, trust: 'verified', health: 95, scope: 'operations' },
  { id: 'a1', label: 'AI Agent', kind: 'agent', x: 72, y: 66, trust: 'attested', health: 89, scope: 'bounded.exec' },
  { id: 'p1', label: 'Policy Runtime', kind: 'policy', x: 88, y: 46, trust: 'verified', health: 96, scope: 'policy.guard' },
  { id: 'au1', label: 'Audit Layer', kind: 'audit', x: 50, y: 81, trust: 'verified', health: 99, scope: 'append.only' },
  { id: 'ad1', label: 'Reusable Audience', kind: 'audience', x: 22, y: 74, trust: 'attested', health: 90, scope: 'audience.reuse' },
];

const links: Array<[string, string]> = [['u1', 'r1'], ['r1', 'c1'], ['c1', 'o1'], ['c1', 'a1'], ['a1', 'p1'], ['p1', 'au1'], ['r1', 'au1'], ['r1', 'ad1']];

const n = (overrides: Partial<RuntimeNode> & { id: string }) => ({ ...baseNodes.find((node) => node.id === overrides.id)!, ...overrides });

const scenarios: Scenario[] = [
  {
    id: 'drift', name: 'AI Drift Containment', narrative: 'AOC prevents unsafe AI relationship execution in real time.',
    intro: 'Model behavior drift emerges mid-execution and trust begins to degrade.', finalOutcome: 'Unsafe execution is contained while relationship continuity remains intact.',
    frames: [
      { id: 'd1', title: 'Drift Detected', what: 'Runtime telemetry detects anomalous agent behavior.', why: 'Prevents silent model risk from cascading.', enforcement: 'Drift score crosses policy threshold.', outcome: 'Containment workflow starts.',
        nodes: [n({ id: 'a1', trust: 'degraded', health: 69 })], events: [{ id: '1', time: '00:14', message: 'Agent intent mismatch detected (risk 0.81).', level: 'degraded' }], trustDelta: 'Agent trust attested → degraded', capabilityDelta: 'No scope change yet', policyIntervention: 'Policy observer engaged', businessValue: ['AI governance', 'Risk reduction'] },
      { id: 'd2', title: 'Scope Minimization', what: 'Capability scope is reduced to read-only.', why: 'Preserves service while shrinking blast radius.', enforcement: 'Auto policy intervention applies least privilege.', outcome: 'Execution bounded to safe scope.',
        nodes: [n({ id: 'c1', scope: 'read.audit-only', trust: 'contained', health: 84 }), n({ id: 'a1', trust: 'contained', health: 72 })], events: [{ id: '2', time: '00:23', message: 'Capability scope minimized by policy runtime.', level: 'contained' }], trustDelta: 'Containment path verified', capabilityDelta: 'write scopes revoked', policyIntervention: 'Least-privilege patch', businessValue: ['Bounded access', 'Operational trust'] },
      { id: 'd3', title: 'Autonomous Revocation Prepared', what: 'Revocation packet is pre-signed while continuity lane stays active.', why: 'Enables instant cutoff without destroying relationship asset.', enforcement: 'Dual-path policy: continuity + kill switch.', outcome: 'Safe continuity with revocation readiness.',
        nodes: [n({ id: 'r1', trust: 'attested', health: 92 }), n({ id: 'au1', health: 100 })], events: [{ id: '3', time: '00:35', message: 'Revocation packet staged; audit trail sealed.', level: 'verified' }], trustDelta: 'Relationship trust preserved', capabilityDelta: 'Revocation-ready state', policyIntervention: 'Autonomous fallback armed', businessValue: ['Auditability', 'Relationship continuity'] },
    ],
  },
  {
    id: 'delegated', name: 'Delegated Enterprise Access', narrative: 'Relationships become programmable operational agreements.',
    intro: 'Enterprise requests temporary bounded access to relationship context.', finalOutcome: 'Access expires automatically with full attestation evidence.',
    frames: [{ id: 'e1', title: 'Bounded Access Issued', what: 'Capability issued with explicit scope and expiry.', why: 'Prevents overbroad standing access.', enforcement: 'Time-boxed delegation policy.', outcome: 'Enterprise task executes safely.', nodes: [n({ id: 'c1', scope: 'hr.onboarding:read', health: 95 })], events: [{ id: 'e', time: '00:11', message: 'Delegated capability issued (TTL 15m).', level: 'attested' }], trustDelta: 'Trust verified end-to-end', capabilityDelta: 'Issued -> executed -> expired', policyIntervention: 'Auto-expiration enforced', businessValue: ['Bounded access', 'Auditability', 'Operational trust'] }],
  },
  {
    id: 'revoke', name: 'Relationship Revocation Cascade', narrative: 'Consent becomes enforceable operational infrastructure.',
    intro: 'User revokes relationship consent from the runtime console.', finalOutcome: 'Delegations collapse instantly and downstream execution halts.',
    frames: [{ id: 'r1f', title: 'Cascade Revocation', what: 'Revocation propagates graph-wide in milliseconds.', why: 'Makes user intent operational, not symbolic.', enforcement: 'Capability invalidation + execution halt.', outcome: 'Containment completed with evidence.', nodes: [n({ id: 'r1', trust: 'contained', health: 65 }), n({ id: 'c1', trust: 'contained', health: 60 }), n({ id: 'a1', trust: 'contained', health: 55 })], events: [{ id: 'r', time: '00:09', message: 'Revocation cascade applied across dependent capabilities.', level: 'contained' }], trustDelta: 'Delegated trust terminated', capabilityDelta: 'All descendants revoked', policyIntervention: 'Stop-execution directive', businessValue: ['Consent enforcement', 'Risk reduction', 'AI governance'] }],
  },
  {
    id: 'audience', name: 'Reusable Audience Continuity', narrative: 'Relationships become reusable assets.',
    intro: 'Campaign B reuses trusted audience from Campaign A without reacquisition.', finalOutcome: 'CAC is avoided while consent scope and trust continuity remain enforced.',
    frames: [{ id: 'a1f', title: 'Zero-Party Continuity Activated', what: 'Reusable audience activates under existing relationship contract.', why: 'Cuts CAC and preserves trust-rich personalization.', enforcement: 'Consent scope checked before activation.', outcome: 'Campaign launches with bounded personalization.', nodes: [n({ id: 'ad1', trust: 'verified', health: 96 }), n({ id: 'r1', health: 97 })], events: [{ id: 'a', time: '00:17', message: 'Reusable audience activated from prior consented relationship.', level: 'verified' }], trustDelta: 'Continuity trust increased', capabilityDelta: 'Audience capability reused', policyIntervention: 'Scope lint passed', businessValue: ['Lower CAC', 'Reusable relationships', 'Consent continuity'] }],
  },
  {
    id: 'bounded', name: 'AI Agent Bounded Execution', narrative: 'AI agents operate inside programmable trust boundaries.',
    intro: 'Agent receives delegated capability for a bounded workflow.', finalOutcome: 'Restricted operations are blocked while trust remains verified.',
    frames: [{ id: 'b1', title: 'Restricted Operation Blocked', what: 'Agent attempts disallowed write action outside delegated scope.', why: 'Prevents privilege creep in autonomous systems.', enforcement: 'Runtime policy denies operation and logs proof.', outcome: 'Workflow continues in approved boundary.', nodes: [n({ id: 'a1', health: 86 }), n({ id: 'p1', health: 98 })], events: [{ id: 'b', time: '00:21', message: 'Out-of-scope operation blocked by policy runtime.', level: 'attested' }], trustDelta: 'Trust unchanged and verified', capabilityDelta: 'Only approved operations executed', policyIntervention: 'Deny + attest', businessValue: ['AI governance', 'Operational trust', 'Bounded access'] }],
  },
  { id: 'recovery', name: 'Runtime Trust Recovery', narrative: 'Trust can recover through attested remediation.', intro: 'A degraded component undergoes remediation workflow.', finalOutcome: 'Service recovers with auditable trust restoration.', frames: [{ id: 't1', title: 'Attested Recovery', what: 'Remediation succeeds and trust returns to verified.', why: 'Maintains continuity while proving operational resilience.', enforcement: 'Recovery policy requires attestation proofs.', outcome: 'Relationship graph restored.', nodes: [n({ id: 'a1', trust: 'verified', health: 93 }), n({ id: 'c1', trust: 'verified', health: 94 })], events: [{ id: 't', time: '00:28', message: 'Recovery attestation accepted; trust restored.', level: 'verified' }], trustDelta: 'Degraded -> verified', capabilityDelta: 'Capabilities re-enabled with checks', policyIntervention: 'Recovery gate passed', businessValue: ['Operational trust', 'Continuity', 'Auditability'] }] },
];

export function AocRuntimeOS() {
  const [scenarioId, setScenarioId] = useState(scenarios[0].id);
  const [frameIndex, setFrameIndex] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);
  const [paused, setPaused] = useState(false);

  const scenario = useMemo(() => scenarios.find((s) => s.id === scenarioId) ?? scenarios[0], [scenarioId]);
  const frame = scenario.frames[Math.min(frameIndex, scenario.frames.length - 1)];
  const nodes = useMemo(() => {
    const overlay = new Map(frame.nodes.map((node) => [node.id, node]));
    return baseNodes.map((node) => overlay.get(node.id) ?? node);
  }, [frame.nodes]);

  useEffect(() => {
    if (!autoPlay || paused) return;
    const t = window.setInterval(() => {
      setFrameIndex((current) => (current + 1 >= scenario.frames.length ? 0 : current + 1));
    }, 3600);
    return () => window.clearInterval(t);
  }, [autoPlay, paused, scenario.frames.length]);

  return <section className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 md:p-8">
    <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
      <div><p className="text-cyan-300 text-xs uppercase tracking-[0.2em]">Phase 2.6 — AOC Scenario Engine</p><h3 className="text-2xl md:text-3xl font-semibold">Guided Runtime Storytelling Layer</h3></div>
      <div className="flex gap-2 text-sm">
        <button onClick={() => setAutoPlay((v) => !v)} className="px-3 py-2 rounded-xl border border-white/20">{autoPlay ? 'Auto-play on' : 'Auto-play off'}</button>
        <button onClick={() => setPaused((v) => !v)} className="px-3 py-2 rounded-xl border border-white/20">{paused ? 'Resume' : 'Pause'}</button>
      </div>
    </div>
    <div className="grid lg:grid-cols-[1.4fr_2fr_1.2fr] gap-5">
      <aside className="space-y-2">{scenarios.map((s) => <button key={s.id} onClick={() => { setScenarioId(s.id); setFrameIndex(0); }} className={`w-full text-left rounded-xl border p-3 ${s.id === scenario.id ? 'border-cyan-300/60 bg-cyan-300/10' : 'border-white/10 bg-white/[0.01]'}`}><p className="font-medium">{s.name}</p><p className="text-xs text-white/60 mt-1">{s.narrative}</p></button>)}</aside>
      <div className="rounded-2xl border border-white/10 h-[460px] bg-[#090d14] relative overflow-hidden">{links.map(([f, t]) => { const a = nodes.find((i) => i.id === f)!; const b = nodes.find((i) => i.id === t)!; return <svg key={`${f}-${t}`} className="absolute inset-0 w-full h-full"><line x1={`${a.x}%`} y1={`${a.y}%`} x2={`${b.x}%`} y2={`${b.y}%`} stroke="rgba(130,173,255,0.26)" strokeWidth="1.5" /></svg>; })}
      {nodes.map((node) => <div key={node.id} className={`absolute -translate-x-1/2 -translate-y-1/2 px-3 py-2 rounded-xl border ${trustClass[node.trust]}`} style={{ left: `${node.x}%`, top: `${node.y}%` }}><p className="text-[10px] uppercase tracking-[0.16em]">{node.kind}</p><p className="text-sm">{node.label}</p><p className="text-xs opacity-80">{node.scope} · {node.health}%</p></div>)}</div>
      <div className="space-y-3">
        <article className="rounded-2xl border border-white/10 bg-white/[0.02] p-4"><p className="text-xs uppercase tracking-[0.16em] text-white/60">Live narration</p><h4 className="font-semibold mt-2">{frame.title}</h4><p className="text-sm text-white/70 mt-2">{frame.what}</p><p className="text-sm text-white/60 mt-2">Why it matters: {frame.why}</p><p className="text-sm text-cyan-200 mt-2">AOC enforcement: {frame.enforcement}</p></article>
        <article className="rounded-2xl border border-white/10 bg-white/[0.02] p-4"><p className="text-xs uppercase tracking-[0.16em] text-white/60">Replay + telemetry</p><input type="range" min={0} max={scenario.frames.length - 1} value={frameIndex} onChange={(e) => setFrameIndex(Number(e.target.value))} className="w-full mt-3" />
          <div className="mt-2 text-xs text-white/60">Snapshot {frameIndex + 1}/{scenario.frames.length} · {frame.outcome}</div>
          <ul className="mt-3 space-y-2">{frame.events.map((event) => <li key={event.id} className={`rounded-lg border px-3 py-2 text-sm ${trustClass[event.level]}`}>{event.time} · {event.message}</li>)}</ul></article>
        <article className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 text-sm"><p className="text-xs uppercase tracking-[0.16em] text-white/60 mb-2">Business value</p><p className="text-white/70">{frame.trustDelta}</p><p className="text-white/70">{frame.capabilityDelta}</p><p className="text-white/70">{frame.policyIntervention}</p><div className="mt-2 flex flex-wrap gap-2">{frame.businessValue.map((v) => <span key={v} className="text-xs px-2 py-1 rounded-full border border-cyan-300/35 bg-cyan-300/10">{v}</span>)}</div></article>
      </div>
    </div>
  </section>;
}
