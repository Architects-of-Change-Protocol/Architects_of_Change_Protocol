import { useEffect, useMemo, useState } from 'react';

type TrustState = 'verified' | 'attested' | 'degraded' | 'unverified';

type RuntimeNode = {
  id: string;
  label: string;
  kind: 'user' | 'relationship' | 'capability' | 'organization' | 'agent' | 'policy' | 'audit';
  x: number;
  y: number;
  trust: TrustState;
  health: number;
  scope: string;
};

type RuntimeEvent = {
  id: number;
  at: string;
  message: string;
  trust: TrustState;
};

const trustClass: Record<TrustState, string> = {
  verified: 'text-emerald-300 border-emerald-400/40 bg-emerald-400/10',
  attested: 'text-cyan-300 border-cyan-400/40 bg-cyan-400/10',
  degraded: 'text-amber-300 border-amber-400/40 bg-amber-400/10',
  unverified: 'text-rose-300 border-rose-400/40 bg-rose-400/10',
};

const seeds: RuntimeNode[] = [
  { id: 'u1', label: 'User Identity', kind: 'user', x: 12, y: 42, trust: 'verified', health: 95, scope: 'personal.profile' },
  { id: 'r1', label: 'Relationship Contract', kind: 'relationship', x: 31, y: 25, trust: 'attested', health: 93, scope: 'relationship.v1' },
  { id: 'c1', label: 'Capability Runtime', kind: 'capability', x: 49, y: 48, trust: 'attested', health: 90, scope: 'cap.read:minimized' },
  { id: 'o1', label: 'Enterprise Org', kind: 'organization', x: 70, y: 28, trust: 'verified', health: 96, scope: 'org.hr.workflow' },
  { id: 'a1', label: 'AI Agent', kind: 'agent', x: 71, y: 66, trust: 'degraded', health: 75, scope: 'agent.exec:bounded' },
  { id: 'p1', label: 'Policy Runtime', kind: 'policy', x: 89, y: 46, trust: 'attested', health: 91, scope: 'policy.guardrails' },
  { id: 'au1', label: 'Audit Layer', kind: 'audit', x: 50, y: 80, trust: 'verified', health: 98, scope: 'audit.append-only' },
];

const links: Array<[string, string]> = [['u1','r1'],['r1','c1'],['c1','o1'],['c1','a1'],['a1','p1'],['p1','au1'],['r1','au1']];

const eventTemplates = [
  'Capability issued with minimized scope',
  'Runtime attestation renewed',
  'Policy drift detected and contained',
  'Autonomous revocation triggered',
  'Access denied by policy gate',
  'Trust chain recovered after attestation',
  'AI agent execution bounded in zone',
  'Relationship contract renewed',
];

export function AocRuntimeOS() {
  const [nodes, setNodes] = useState(seeds);
  const [activeNodeId, setActiveNodeId] = useState('c1');
  const [events, setEvents] = useState<RuntimeEvent[]>([]);
  const [tick, setTick] = useState(0);
  const [replay, setReplay] = useState(false);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setTick((t) => t + 1);
      setNodes((prev) => prev.map((n) => {
        const drift = (Math.random() - 0.5) * 6;
        const health = Math.max(52, Math.min(99, Math.round(n.health + drift)));
        const trust: TrustState = health < 68 ? 'degraded' : health < 80 ? 'attested' : n.trust === 'unverified' ? 'attested' : n.trust;
        return { ...n, health, trust };
      }));

      const template = eventTemplates[Math.floor(Math.random() * eventTemplates.length)];
      const trustPool: TrustState[] = ['verified', 'attested', 'degraded', 'unverified'];
      const trust = trustPool[Math.floor(Math.random() * trustPool.length)];
      setEvents((prev) => [{ id: Date.now(), at: new Date().toLocaleTimeString(), message: template, trust }, ...prev].slice(0, 12));
    }, replay ? 1200 : 1800);

    return () => window.clearInterval(timer);
  }, [replay]);

  const active = useMemo(() => nodes.find((n) => n.id === activeNodeId) ?? nodes[0], [nodes, activeNodeId]);

  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-cyan-300 text-xs tracking-[0.2em] uppercase">AOC Runtime OS</p>
          <h3 className="text-2xl md:text-3xl font-semibold">Live Relationship Runtime Canvas</h3>
        </div>
        <button onClick={() => setReplay((r) => !r)} className="px-4 py-2 rounded-xl border border-white/15 hover:border-white/30 text-sm">
          {replay ? 'Replay: ON' : 'Replay: OFF'}
        </button>
      </div>
      <div className="grid lg:grid-cols-[2fr_1fr] gap-6">
        <div className="relative rounded-2xl border border-white/10 h-[460px] bg-[#090d14] overflow-hidden">
          {links.map(([from, to], idx) => {
            const a = nodes.find((n) => n.id === from)!;
            const b = nodes.find((n) => n.id === to)!;
            return <svg key={`${from}-${to}`} className="absolute inset-0 w-full h-full pointer-events-none"><line x1={`${a.x}%`} y1={`${a.y}%`} x2={`${b.x}%`} y2={`${b.y}%`} stroke="rgba(130,173,255,0.25)" strokeWidth="1.5" strokeDasharray={idx % 2 === 0 ? '4 4' : '0'} /></svg>;
          })}
          {nodes.map((node) => (
            <button key={node.id} onMouseEnter={() => setActiveNodeId(node.id)} onClick={() => setActiveNodeId(node.id)} className={`absolute -translate-x-1/2 -translate-y-1/2 px-3 py-2 rounded-xl border text-left transition-all ${trustClass[node.trust]} ${activeNodeId === node.id ? 'scale-105 shadow-[0_0_24px_rgba(0,240,255,0.22)]' : ''}`} style={{ left: `${node.x}%`, top: `${node.y}%` }}>
              <div className="text-[11px] uppercase tracking-[0.18em] opacity-80">{node.kind}</div>
              <div className="text-sm font-medium">{node.label}</div>
              <div className="text-xs opacity-80">Health {node.health}%</div>
            </button>
          ))}
          <div className="absolute bottom-3 right-3 text-xs text-white/50">Pulse tick: {tick}</div>
        </div>
        <div className="space-y-4">
          <article className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-white/50">Node inspection</p>
            <h4 className="text-lg font-semibold mt-2">{active.label}</h4>
            <p className="text-sm text-white/65">Scope: {active.scope}</p>
            <p className="text-sm text-white/65">Trust: {active.trust}</p>
            <p className="text-sm text-white/65">Relationship health: {active.health}%</p>
          </article>
          <article className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 max-h-[280px] overflow-auto">
            <p className="text-xs uppercase tracking-[0.2em] text-white/50 mb-3">Operational telemetry stream</p>
            <div className="space-y-2">
              {events.map((event) => (
                <div key={event.id} className={`rounded-xl border px-3 py-2 ${trustClass[event.trust]}`}>
                  <p className="text-xs opacity-75">{event.at}</p>
                  <p className="text-sm">{event.message}</p>
                </div>
              ))}
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
