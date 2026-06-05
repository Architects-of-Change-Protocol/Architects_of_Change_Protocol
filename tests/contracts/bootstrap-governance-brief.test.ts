import {
  BootstrapGovernanceBriefEngine,
  getProjectBootstrapBrief,
  InMemoryProjectBootstrapBriefRepository,
  ProjectDiscoverySnapshot,
  generateAndStoreProjectBootstrapBrief,
  toGovernanceSnapshotCard
} from "@aoc-runtime/governance-runtime";

const discovery: ProjectDiscoverySnapshot = {
  projectId: "11111111-1111-4111-8111-111111111111",
  workspaceId: "22222222-2222-4222-8222-222222222222",
  discoveryVersion: 3,
  traceabilityCoverage: 82,
  discoveryQuality: 76,
  evidenceSources: [
    { evidenceSourceId: "src-contract", title: "Contract", confidence: 85 },
    { evidenceSourceId: "src-kickoff", title: "Kickoff notes", confidence: 74 },
    { evidenceSourceId: "src-risk", title: "Risk register", confidence: 80 }
  ],
  stakeholders: [
    { id: "stakeholder-customer", label: "Customer approver", external: true, confidence: 72, evidenceSourceRefs: ["src-kickoff"] },
    { id: "stakeholder-pm", label: "Project manager", confidence: 88, evidenceSourceRefs: ["src-kickoff"] }
  ],
  governanceRoles: [
    { id: "role-pm", label: "Project owner", confidence: 80, evidenceSourceRefs: ["src-kickoff"] }
  ],
  deliverables: [
    { id: "deliverable-cutover", label: "Cutover plan", confidence: 77, evidenceSourceRefs: ["src-contract"] }
  ],
  dependencies: [
    { id: "dep-cisco", label: "Cisco licensing", external: true, severity: "critical", confidence: 84, evidenceSourceRefs: ["src-contract"] }
  ],
  risks: [
    { id: "risk-approval", label: "Customer approval delay", severity: "high", confidence: 79, evidenceSourceRefs: ["src-risk"] }
  ],
  unknowns: [
    { id: "unknown-acceptance", label: "Acceptance criteria", confidence: 68, evidenceSourceRefs: ["src-kickoff"] },
    { id: "unknown-support", label: "Support transition", confidence: 63, evidenceSourceRefs: ["src-kickoff"] }
  ]
};

test("generates a traceable versioned bootstrap governance brief", () => {
  const events: string[] = [];
  const engine = new BootstrapGovernanceBriefEngine({ log: (event) => events.push(event.event) });

  const brief = engine.generate(discovery, { latestBriefVersion: 1, now: "2026-06-05T00:00:00.000Z" });

  expect(brief.briefVersion).toBe(2);
  expect(brief.discoveryVersion).toBe(3);
  expect(brief.executionHealth).toBe("Red");
  expect(brief.executionComplexity).toBe("Medium");
  expect(brief.confidenceScore).toBeGreaterThanOrEqual(60);
  expect(brief.dependencyPressureScore).toBeGreaterThan(brief.stakeholderPressureScore);
  expect(brief.criticalFindingsJson[0].discoveryItemRefs).toContain("dep-cisco");
  expect(brief.criticalFindingsJson[0].evidenceSourceRefs).toContain("src-contract");
  expect(brief.concernsJson.some((concern) => concern.title === "Acceptance criteria not detected")).toBe(true);
  expect(brief.recommendedActionsJson.length).toBeGreaterThanOrEqual(3);
  [...brief.criticalFindingsJson, ...brief.concernsJson, ...brief.positiveSignalsJson].forEach((finding) => {
    expect(finding.discoveryItemRefs.length).toBeGreaterThan(0);
    expect(finding.evidenceSourceRefs.length).toBeGreaterThan(0);
  });
  brief.recommendedActionsJson.forEach((action) => {
    expect(action.discoveryItemRefs.length).toBeGreaterThan(0);
    expect(action.evidenceSourceRefs.length).toBeGreaterThan(0);
  });
  expect(brief.governanceSummary.split(/\s+/).length).toBeLessThanOrEqual(250);
  expect(events).toEqual(["Governance Brief Started", "Governance Brief Completed"]);
});

test("serves the latest brief only after project read authorization", async () => {
  const repository = new InMemoryProjectBootstrapBriefRepository();
  const engine = new BootstrapGovernanceBriefEngine();
  await generateAndStoreProjectBootstrapBrief(repository, engine, discovery, { now: "2026-06-05T00:00:00.000Z" });
  const latestBrief = await generateAndStoreProjectBootstrapBrief(repository, engine, { ...discovery, discoveryVersion: 4 }, { now: "2026-06-05T01:00:00.000Z" });
  const snapshot = toGovernanceSnapshotCard(latestBrief);
  expect(snapshot.topConcerns.length).toBeLessThanOrEqual(3);
  expect(snapshot.topActions.length).toBeLessThanOrEqual(3);

  const denied = await getProjectBootstrapBrief(repository, { canReadProject: () => false }, { projectId: discovery.projectId, workspaceId: discovery.workspaceId, actorId: "user-denied" });
  expect(denied.status).toBe(403);

  const allowed = await getProjectBootstrapBrief(repository, { canReadProject: () => true }, { projectId: discovery.projectId, workspaceId: discovery.workspaceId, actorId: "user-allowed" });
  expect(allowed.status).toBe(200);
  expect(allowed.brief?.briefVersion).toBe(2);
  expect((await repository.history(discovery.projectId, discovery.workspaceId)).map((brief) => brief.briefVersion)).toEqual([1, 2]);
});
