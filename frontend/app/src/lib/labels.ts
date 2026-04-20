export const REQUESTER_LABELS: Record<string, string> = {
  'requester-1': 'HRKey',
};

export const DATASET_LABELS: Record<string, string> = {
  'dataset-1': 'Employment History',
};

const PURPOSE_LABELS: Record<string, string> = {
  employment_verification: 'Employment verification',
  background_check: 'Background check',
  underwriting: 'Eligibility assessment',
  payroll_onboarding: 'Payroll onboarding',
};

const SCOPE_FIELD_LABELS: Record<string, string> = {
  company: 'Company',
  role: 'Role',
  start_date: 'Start date',
  end_date: 'End date',
  employment_type: 'Employment type',
  manager: 'Manager',
  compensation: 'Compensation',
  location: 'Location',
  references: 'References',
};

export function getRequesterLabel(requesterId: string): string {
  return REQUESTER_LABELS[requesterId] ?? 'Unknown requester';
}

export function getDatasetLabel(datasetId: string): string {
  return DATASET_LABELS[datasetId] ?? 'Unknown dataset';
}

export function getPurposeLabel(purpose: string): string {
  return PURPOSE_LABELS[purpose] ?? 'Data access request';
}

export function getScopeLabel(scope: string[]): string {
  if (!Array.isArray(scope) || scope.length === 0) {
    return 'No data fields requested';
  }

  const humanLabels = scope
    .map((field) => SCOPE_FIELD_LABELS[field])
    .filter((label): label is string => Boolean(label));

  if (humanLabels.length === 0) {
    return 'Requested profile fields';
  }

  return humanLabels.join(', ');
}
