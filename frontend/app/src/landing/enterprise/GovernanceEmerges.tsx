import { ExplicitConsentAnimation } from '../components/ExplicitConsentAnimation';
import { ModularPermissionsAnimation } from '../components/ModularPermissionsAnimation';
import { VerifiableInteractionsAnimation } from '../components/VerifiableInteractionsAnimation';
import { FullControlAnimation } from '../components/FullControlAnimation';
import { AocInfrastructureAnimated } from '../components/AocInfrastructureAnimated';
import { FlowRail, SectionHeader } from './primitives';

// The operational-approach cards and the infrastructure diagram below were
// migrated from AOC Protocol's former "Solution", "How It Works", and
// infrastructure sections (W003 governance migration). They describe how an
// organization operationalizes governance over capabilities already
// composed above — the operational half of the flow this section is named
// for, not the definition of the capabilities themselves.
export function GovernanceEmerges() {
  return (
    <section id="governance" className="scroll-mt-16 max-w-7xl mx-auto px-6 py-20 border-t border-white/10">
      <FlowRail current="Governance" />

      <SectionHeader
        eyebrow="Governance Emerges"
        title="Governance is the result of composition, not the starting point."
        description="Once an architecture is composed of the right capabilities, governance follows: policies, delegations, and approvals attach to the capabilities already in place. AOC Enterprise doesn't ask an organization to define governance before it knows its own architecture."
      />

      <div className="grid md:grid-cols-2 gap-5">
        <article className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
          <p className="text-sm text-white/60 mb-4">Explicit consent</p>
          <div className="flex items-center justify-center min-h-[180px]">
            <ExplicitConsentAnimation />
          </div>
        </article>

        <article className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
          <p className="text-sm text-white/60 mb-4">Modular permissions</p>
          <div className="flex items-center justify-center min-h-[180px]">
            <ModularPermissionsAnimation />
          </div>
        </article>

        <article className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
          <p className="text-sm text-white/60 mb-4">Verifiable interactions</p>
          <div className="flex items-center justify-center min-h-[180px]">
            <VerifiableInteractionsAnimation />
          </div>
        </article>

        <article className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
          <p className="text-sm text-white/60 mb-4">Full control remains with the user</p>
          <div className="flex items-center justify-center min-h-[180px]">
            <FullControlAnimation />
          </div>
        </article>
      </div>

      <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.015] p-6 md:p-8">
        <p className="text-[11px] uppercase tracking-[0.22em] text-cyan-300/80 font-mono mb-5">
          Decisions, obligations, grants &amp; evidence
        </p>
        <div className="grid gap-6 md:grid-cols-3">
          <div>
            <h3 className="text-sm font-semibold text-white">1. Define Permissions</h3>
            <p className="mt-1.5 text-sm text-white/55 leading-relaxed">
              Every interaction starts with explicit rules. Who can access what, under which conditions.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">2. Evaluate Request</h3>
            <p className="mt-1.5 text-sm text-white/55 leading-relaxed">
              Each request is checked in real time against permissions, context, and policy.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">3. Grant &amp; Audit Access</h3>
            <p className="mt-1.5 text-sm text-white/55 leading-relaxed">
              Approved actions execute. Every outcome is recorded for transparency and auditability.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-10">
        <AocInfrastructureAnimated />
      </div>
    </section>
  );
}
