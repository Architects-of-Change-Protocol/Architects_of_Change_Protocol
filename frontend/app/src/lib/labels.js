export const REQUESTER_LABELS = {
    'requester-1': 'HRKey',
};
export const DATASET_LABELS = {
    'dataset-1': 'Employment History',
};
const PURPOSE_LABELS = {
    employment_verification: 'Employment verification',
    background_check: 'Background check',
    underwriting: 'Eligibility assessment',
    payroll_onboarding: 'Payroll onboarding',
};
const SCOPE_FIELD_LABELS = {
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
export function getRequesterLabel(requesterId) {
    return REQUESTER_LABELS[requesterId] ?? 'Unknown requester';
}
export function getDatasetLabel(datasetId) {
    return DATASET_LABELS[datasetId] ?? 'Unknown dataset';
}
export function getPurposeLabel(purpose) {
    return PURPOSE_LABELS[purpose] ?? 'Data access request';
}
export function getScopeLabel(scope) {
    if (!Array.isArray(scope) || scope.length === 0) {
        return 'No data fields requested';
    }
    const humanLabels = scope
        .map((field) => SCOPE_FIELD_LABELS[field])
        .filter((label) => Boolean(label));
    if (humanLabels.length === 0) {
        return 'Requested profile fields';
    }
    return humanLabels.join(', ');
}
