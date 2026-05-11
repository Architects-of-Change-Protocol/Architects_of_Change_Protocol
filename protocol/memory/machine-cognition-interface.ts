import { createHash } from 'crypto';
import type { CognitiveRuntimeSignal, CognitiveRuntimeSignalType } from './cognitive-runtime';

/**
 * Sovereign Machine Cognition Interface Layer
 * ------------------------------------------
 * This layer creates bounded, policy-scoped context envelopes for future
 * machine cognition. It is intentionally deterministic and read-only.
 *
 * Architectural boundaries:
 * - Agents never receive raw vault access; only policy-scoped envelopes.
 * - Redaction is deterministic and lineage-preserving.
 * - Human-approval gates are explicit in the envelope boundary.
 * - Audit trace packets preserve why context was exposed and under what policy.
 * - Machine action boundaries forbid direct mutation/deletion/promotion.
 */
export const MACHINE_COGNITION_INTERFACE_TYPES = [
  'CONTEXT_ENVELOPE',
  'AGENT_TASK_BRIEF',
  'GOVERNANCE_REVIEW_PACKET',
  'HUMAN_ESCALATION_PACKET',
  'AUDIT_TRACE_PACKET',
  'POLICY_SCOPED_CONTEXT',
  'REDACTED_CONTEXT_VIEW',
  'MACHINE_ACTION_BOUNDARY'
] as const;

export const AGENT_TASK_TYPES = [
  'SUMMARIZE_GOVERNED_CONTEXT',
  'ANALYZE_RISK_CONVERGENCE',
  'REVIEW_CONTRADICTION',
  'SUGGEST_NEXT_ACTION',
  'GENERATE_EXECUTIVE_BRIEF',
  'DETECT_PATTERN_DRIFT',
  'PREPARE_HUMAN_REVIEW',
  'VALIDATE_GOVERNANCE_CANDIDATE'
] as const;

export type MachineCognitionInterfaceType = (typeof MACHINE_COGNITION_INTERFACE_TYPES)[number];
export type AgentTaskType = (typeof AGENT_TASK_TYPES)[number];

export type MachineActionBoundary = {
  mayReadContext: boolean;
  mayGenerateSummary: boolean;
  maySuggestActions: boolean;
  mayRequestMoreContext: boolean;
  mayModifyMemory: boolean;
  mayDeleteMemory: boolean;
  mayPromoteGovernanceMemory: boolean;
  requiresHumanApprovalForOutput: boolean;
  requiresAuditLog: boolean;
};

export type MachineCognitionEnvelope = {
  envelopeId: string;
  interfaceType: MachineCognitionInterfaceType;
  taskType: AgentTaskType;
  sourceSignalIds: string[];
  sourceSynthesisIds: string[];
  sourceNutrientIds: string[];
  sourceMemoryIds: string[];
  createdAt: string;
  expiresAt: string;
  confidenceFloor: number;
  allowedOperations: string[];
  deniedOperations: string[];
  redactedMemoryIds: string[];
  visibleMemoryIds: string[];
  contextSummary: string;
  governanceReason: string;
  auditRequired: boolean;
  humanReviewRequired: boolean;
  lineagePreserved: boolean;
  policyScope: string;
  machineActionBoundary: MachineActionBoundary;
};

export type MachineCognitionPolicy = {
  defaultTtlMinutes: number;
  minimumSignalConfidence: number;
  allowAuditRequiredContext: boolean;
  allowHumanReviewContext: boolean;
  allowMachineSuggestedActions: boolean;
  allowMachineContextExpansion: boolean;
  requireHumanApprovalForAuditRequired: boolean;
  maxVisibleMemoryIds: number;
  redactionMode: 'none' | 'hide_audit_required' | 'hide_human_review' | 'minimal_lineage';
  allowedTaskTypes: AgentTaskType[];
  deniedTaskTypes: AgentTaskType[];
};

export type MachineCognitionInput = {
  signals: ReadonlyArray<CognitiveRuntimeSignal>;
  now: string;
  policy: MachineCognitionPolicy;
};

export type RedactedContextView = {
  visibleMemoryIds: string[];
  redactedMemoryIds: string[];
  redactionReason: string;
  lineagePreserved: boolean;
};

export type AuditTracePacket = {
  packetId: string;
  envelopeId: string;
  sourceSignalIds: string[];
  policyScope: string;
  createdAt: string;
  auditRequired: boolean;
  humanReviewRequired: boolean;
  lineagePreserved: boolean;
  decisionTrace: string;
};

export type MachineCognitionResult = {
  envelopes: MachineCognitionEnvelope[];
  redactedViews: RedactedContextView[];
  auditTracePackets: AuditTracePacket[];
};

const uniqueSorted = (v: ReadonlyArray<string>): string[] => [...new Set(v)].sort();
const round2 = (v: number): number => Math.round(v * 100) / 100;
const buildId = (prefix: string, material: string): string => `${prefix}-${createHash('sha256').update(material).digest('hex').slice(0, 16)}`;

export const classifyMachineCognitionInterfaceType = (signalType: CognitiveRuntimeSignalType): MachineCognitionInterfaceType => {
  if (signalType === 'HUMAN_REVIEW_REQUIRED') return 'HUMAN_ESCALATION_PACKET';
  if (signalType === 'GOVERNANCE_CONTRADICTION') return 'GOVERNANCE_REVIEW_PACKET';
  return 'CONTEXT_ENVELOPE';
};

export const inferAgentTaskType = (signalType: CognitiveRuntimeSignalType): AgentTaskType => {
  if (signalType === 'GOVERNANCE_CONTRADICTION') return 'REVIEW_CONTRADICTION';
  if (signalType === 'STRATEGIC_RISK_CONVERGENCE') return 'ANALYZE_RISK_CONVERGENCE';
  if (signalType === 'GOVERNANCE_MEMORY_CANDIDATE') return 'VALIDATE_GOVERNANCE_CANDIDATE';
  if (signalType === 'HUMAN_REVIEW_REQUIRED') return 'PREPARE_HUMAN_REVIEW';
  if (signalType === 'OPERATIONAL_TRUTH_DRIFT') return 'DETECT_PATTERN_DRIFT';
  return 'SUMMARIZE_GOVERNED_CONTEXT';
};

export const shouldAllowSignalForMachineContext = (signal: CognitiveRuntimeSignal, policy: MachineCognitionPolicy): boolean => {
  if (signal.confidenceScore < policy.minimumSignalConfidence) return false;
  if (signal.auditRequired && !policy.allowAuditRequiredContext) return false;
  if (signal.humanReviewRequired && !policy.allowHumanReviewContext) return false;
  if (signal.signalType === 'AI_CONTEXT_READY') return true;
  return signal.signalType === 'HUMAN_REVIEW_REQUIRED' || signal.signalType === 'GOVERNANCE_CONTRADICTION';
};

export const calculateEnvelopeExpiration = (createdAt: string, ttlMinutes: number): string => new Date(new Date(createdAt).getTime() + ttlMinutes * 60_000).toISOString();

export const applyMachineContextRedaction = (
  sourceMemoryIds: ReadonlyArray<string>,
  signal: CognitiveRuntimeSignal,
  policy: MachineCognitionPolicy
): RedactedContextView => {
  const allMemoryIds = uniqueSorted(sourceMemoryIds);
  let visibleMemoryIds = [...allMemoryIds];
  let redactedMemoryIds: string[] = [];
  let redactionReason = 'none';

  if ((policy.redactionMode === 'hide_audit_required' || policy.redactionMode === 'minimal_lineage') && signal.auditRequired) {
    visibleMemoryIds = [];
    redactedMemoryIds = allMemoryIds;
    redactionReason = 'audit_required_hidden';
  }
  if ((policy.redactionMode === 'hide_human_review' || policy.redactionMode === 'minimal_lineage') && signal.humanReviewRequired) {
    visibleMemoryIds = [];
    redactedMemoryIds = allMemoryIds;
    redactionReason = 'human_review_hidden';
  }

  if (visibleMemoryIds.length > policy.maxVisibleMemoryIds) {
    const preserve = [...visibleMemoryIds].sort((a, b) => a.localeCompare(b)).slice(0, policy.maxVisibleMemoryIds);
    const overflow = visibleMemoryIds.filter((id) => !preserve.includes(id));
    visibleMemoryIds = preserve;
    redactedMemoryIds = uniqueSorted([...redactedMemoryIds, ...overflow]);
    redactionReason = redactionReason === 'none' ? 'max_visible_limit' : `${redactionReason}+max_visible_limit`;
  }

  return { visibleMemoryIds, redactedMemoryIds, redactionReason, lineagePreserved: true };
};

export const buildMachineActionBoundary = (signal: CognitiveRuntimeSignal, policy: MachineCognitionPolicy, taskType: AgentTaskType): MachineActionBoundary => ({
  mayReadContext: true,
  mayGenerateSummary: true,
  maySuggestActions: policy.allowMachineSuggestedActions,
  mayRequestMoreContext: policy.allowMachineContextExpansion,
  mayModifyMemory: false,
  mayDeleteMemory: false,
  mayPromoteGovernanceMemory: false,
  requiresHumanApprovalForOutput: signal.auditRequired ? policy.requireHumanApprovalForAuditRequired : signal.humanReviewRequired,
  requiresAuditLog: signal.auditRequired || signal.humanReviewRequired || taskType === 'VALIDATE_GOVERNANCE_CANDIDATE'
});

export const buildRedactedContextView = (envelope: MachineCognitionEnvelope): RedactedContextView => ({
  visibleMemoryIds: [...envelope.visibleMemoryIds],
  redactedMemoryIds: [...envelope.redactedMemoryIds],
  redactionReason: envelope.redactedMemoryIds.length > 0 ? 'policy_scoped_redaction' : 'none',
  lineagePreserved: envelope.lineagePreserved
});

export const buildAuditTracePacket = (envelope: MachineCognitionEnvelope): AuditTracePacket => ({
  packetId: buildId('auditpkt', `${envelope.envelopeId}::${envelope.sourceSignalIds.join('|')}`),
  envelopeId: envelope.envelopeId,
  sourceSignalIds: [...envelope.sourceSignalIds],
  policyScope: envelope.policyScope,
  createdAt: envelope.createdAt,
  auditRequired: envelope.auditRequired,
  humanReviewRequired: envelope.humanReviewRequired,
  lineagePreserved: envelope.lineagePreserved,
  decisionTrace: `Interface=${envelope.interfaceType}; task=${envelope.taskType}; approval=${envelope.machineActionBoundary.requiresHumanApprovalForOutput}`
});

export const buildMachineCognitionEnvelope = (signal: CognitiveRuntimeSignal, input: MachineCognitionInput): MachineCognitionEnvelope | null => {
  if (!shouldAllowSignalForMachineContext(signal, input.policy)) return null;
  const interfaceType = classifyMachineCognitionInterfaceType(signal.signalType);
  const taskType = inferAgentTaskType(signal.signalType);
  if (!input.policy.allowedTaskTypes.includes(taskType) || input.policy.deniedTaskTypes.includes(taskType)) return null;

  const redaction = applyMachineContextRedaction(signal.sourceMemoryIds, signal, input.policy);
  const machineActionBoundary = buildMachineActionBoundary(signal, input.policy, taskType);
  const createdAt = input.now;

  const contextSummary = [
    `signal=${signal.signalType}`,
    `confidence=${round2(signal.confidenceScore)}`,
    `severity=${round2(signal.severity)}`,
    `sourceSyntheses=${signal.sourceSynthesisIds.length}`,
    `sourceNutrients=${signal.sourceNutrientIds.length}`,
    `visibleMemories=${redaction.visibleMemoryIds.length}`,
    `redactedMemories=${redaction.redactedMemoryIds.length}`,
    `recommendedAction=${signal.recommendedAction}`
  ].join('; ');

  return {
    envelopeId: buildId('mcenv', `${signal.signalId}::${interfaceType}::${taskType}::${createdAt}`),
    interfaceType,
    taskType,
    sourceSignalIds: [signal.signalId],
    sourceSynthesisIds: uniqueSorted(signal.sourceSynthesisIds),
    sourceNutrientIds: uniqueSorted(signal.sourceNutrientIds),
    sourceMemoryIds: uniqueSorted(signal.sourceMemoryIds),
    createdAt,
    expiresAt: calculateEnvelopeExpiration(createdAt, input.policy.defaultTtlMinutes),
    confidenceFloor: input.policy.minimumSignalConfidence,
    allowedOperations: ['READ_CONTEXT', 'GENERATE_SUMMARY', ...(input.policy.allowMachineSuggestedActions ? ['SUGGEST_ACTIONS'] : []), ...(input.policy.allowMachineContextExpansion ? ['REQUEST_MORE_CONTEXT'] : [])],
    deniedOperations: ['MODIFY_MEMORY', 'DELETE_MEMORY', 'PROMOTE_GOVERNANCE_MEMORY'],
    redactedMemoryIds: redaction.redactedMemoryIds,
    visibleMemoryIds: redaction.visibleMemoryIds,
    contextSummary,
    governanceReason: signal.explanation,
    auditRequired: signal.auditRequired,
    humanReviewRequired: signal.humanReviewRequired,
    lineagePreserved: true,
    policyScope: `machine-cognition:${interfaceType}:${taskType}`,
    machineActionBoundary
  };
};

export const consolidateDuplicateEnvelopes = (envelopes: ReadonlyArray<MachineCognitionEnvelope>): MachineCognitionEnvelope[] => {
  const map = new Map<string, MachineCognitionEnvelope>();
  for (const envelope of envelopes) {
    const key = `${envelope.interfaceType}::${envelope.taskType}::${envelope.sourceSignalIds.join('|')}`;
    const prev = map.get(key);
    if (!prev) { map.set(key, envelope); continue; }
    map.set(key, {
      ...prev,
      sourceSynthesisIds: uniqueSorted([...prev.sourceSynthesisIds, ...envelope.sourceSynthesisIds]),
      sourceNutrientIds: uniqueSorted([...prev.sourceNutrientIds, ...envelope.sourceNutrientIds]),
      sourceMemoryIds: uniqueSorted([...prev.sourceMemoryIds, ...envelope.sourceMemoryIds]),
      visibleMemoryIds: uniqueSorted([...prev.visibleMemoryIds, ...envelope.visibleMemoryIds]),
      redactedMemoryIds: uniqueSorted([...prev.redactedMemoryIds, ...envelope.redactedMemoryIds]),
      auditRequired: prev.auditRequired || envelope.auditRequired,
      humanReviewRequired: prev.humanReviewRequired || envelope.humanReviewRequired,
      lineagePreserved: prev.lineagePreserved && envelope.lineagePreserved
    });
  }
  return [...map.values()];
};

export const buildMachineCognitionInterfaces = (input: MachineCognitionInput): MachineCognitionResult => {
  const envelopes = consolidateDuplicateEnvelopes(input.signals.map((signal) => buildMachineCognitionEnvelope(signal, input)).filter((v): v is MachineCognitionEnvelope => v !== null));
  return {
    envelopes,
    redactedViews: envelopes.map(buildRedactedContextView),
    auditTracePackets: envelopes.filter((e) => e.machineActionBoundary.requiresAuditLog || e.auditRequired).map(buildAuditTracePacket)
  };
};
