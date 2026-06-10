import {
  AMENDMENT_CATALOG_FILE,
  amendmentRecordsFromText,
  currentConstitutionVersion,
  governanceViolation,
  readText,
  requireFile,
  versionFromText,
} from './constitutional-governance-lib.mjs';
import { authorityNames, markdownTable } from './capability-governance-lib.mjs';

export const ECONOMICS_CONSTITUTION_FILE = 'docs/constitution/ECONOMICS-CONSTITUTION.md';
export const ECONOMICS_AUTHORITY_FILE = 'docs/constitution/ECONOMICS-AUTHORITIES.md';
export const ECONOMIC_RIGHTS_FILE = 'docs/constitution/ECONOMIC-RIGHTS-POLICY.md';
export const ECONOMIC_OBLIGATIONS_FILE = 'docs/constitution/ECONOMIC-OBLIGATIONS-POLICY.md';
export const ECONOMIC_ASSET_FILE = 'docs/constitution/ECONOMIC-ASSET-POLICY.md';
export const ECONOMIC_CONSUMPTION_FILE = 'docs/constitution/ECONOMIC-CONSUMPTION-POLICY.md';
export const ECONOMIC_SETTLEMENT_FILE = 'docs/constitution/ECONOMIC-SETTLEMENT-POLICY.md';
export const ECONOMIC_TREASURY_FILE = 'docs/constitution/ECONOMIC-TREASURY-POLICY.md';
export const ECONOMIC_VALUATION_FILE = 'docs/constitution/ECONOMIC-VALUATION-POLICY.md';
export const ECONOMIC_LIFECYCLE_FILE = 'docs/constitution/ECONOMIC-LIFECYCLE.md';
export const ECONOMIC_CHALLENGE_FILE = 'docs/constitution/ECONOMIC-CHALLENGE-POLICY.md';
export const ECONOMIC_REVOCATION_FILE = 'docs/constitution/ECONOMIC-REVOCATION-POLICY.md';
export const ECONOMIC_VIOLATION_FILE = 'docs/constitution/ECONOMIC-VIOLATION-CATALOG.md';
export const ECONOMICS_GOVERNANCE_FILES = Object.freeze([
  ECONOMICS_CONSTITUTION_FILE, ECONOMICS_AUTHORITY_FILE, ECONOMIC_RIGHTS_FILE,
  ECONOMIC_OBLIGATIONS_FILE, ECONOMIC_ASSET_FILE, ECONOMIC_CONSUMPTION_FILE,
  ECONOMIC_SETTLEMENT_FILE, ECONOMIC_TREASURY_FILE, ECONOMIC_VALUATION_FILE,
  ECONOMIC_LIFECYCLE_FILE, ECONOMIC_CHALLENGE_FILE, ECONOMIC_REVOCATION_FILE,
  ECONOMIC_VIOLATION_FILE,
]);
export const VALID_ECONOMICS_CLASSES = Object.freeze(['Constitutional', 'Governance', 'Runtime', 'Operational']);
export const VALID_ECONOMICS_STATUSES = Object.freeze(['Canonical', 'Deprecated', 'Retired']);
export const VALID_REVOCATION_CAUSES = Object.freeze(['Fraud', 'Invalid Right', 'Invalid Obligation', 'Invalid Settlement', 'Treasury Violation', 'Constitutional Override', 'Governance Decision']);
export const VALID_CHALLENGE_GROUNDS = Object.freeze(['Invalid Right', 'Invalid Obligation', 'Invalid Asset', 'Invalid Consumption', 'Invalid Settlement', 'Invalid Treasury Action', 'Invalid Valuation', 'Economic Fraud', 'Evidence Failure']);
export const VALID_LIFECYCLE_STATES = Object.freeze(['Created', 'Allocated', 'Available', 'Reserved', 'Consumed', 'Settled', 'Disputed', 'Resolved', 'Revoked', 'Retired']);
export const ECONOMICS_TRANSITIONS = new Map([
  ['Created', new Set(['Allocated'])],
  ['Allocated', new Set(['Available'])],
  ['Available', new Set(['Reserved'])],
  ['Reserved', new Set(['Consumed', 'Available'])],
  ['Consumed', new Set(['Settled', 'Disputed'])],
  ['Settled', new Set(['Retired'])],
  ['Disputed', new Set(['Resolved', 'Revoked'])],
  ['Resolved', new Set(['Retired'])],
  ['Revoked', new Set(['Retired'])],
  ['Retired', new Set()],
]);

export const economicsRecords = (root) => markdownTable(readText(root, ECONOMICS_AUTHORITY_FILE), 'Economic authority catalog');
export const economicsRightsRecords = (root) => markdownTable(readText(root, ECONOMIC_RIGHTS_FILE), 'Rights policy catalog');
export const economicsObligationsRecords = (root) => markdownTable(readText(root, ECONOMIC_OBLIGATIONS_FILE), 'Obligations policy catalog');
export const economicsAssetRecords = (root) => markdownTable(readText(root, ECONOMIC_ASSET_FILE), 'Asset class catalog');
export const economicsConsumptionRecords = (root) => markdownTable(readText(root, ECONOMIC_CONSUMPTION_FILE), 'Consumption policy catalog');
export const economicsSettlementRecords = (root) => markdownTable(readText(root, ECONOMIC_SETTLEMENT_FILE), 'Settlement policy catalog');
export const economicsTreasuryRecords = (root) => markdownTable(readText(root, ECONOMIC_TREASURY_FILE), 'Treasury policy catalog');
export const economicsValuationRecords = (root) => markdownTable(readText(root, ECONOMIC_VALUATION_FILE), 'Valuation model catalog');
export const economicsLifecycleRecords = (root) => markdownTable(readText(root, ECONOMIC_LIFECYCLE_FILE), 'Lifecycle transition ledger');
export const economicsChallengeRecords = (root) => markdownTable(readText(root, ECONOMIC_CHALLENGE_FILE), 'Challenge registry');
export const economicsRevocationRecords = (root) => markdownTable(readText(root, ECONOMIC_REVOCATION_FILE), 'Revocation authority registry');

export function economicsViolation(path, message, id = 'ECO-V-013') { return governanceViolation(path, `${id} ${message}`); }
export function duplicated(values) { const seen=new Set(), duplicates=new Set(); for(const value of values.filter(Boolean)){if(seen.has(value))duplicates.add(value);seen.add(value);} return [...duplicates]; }
export function economicsAmendments(root) { return amendmentRecordsFromText(readText(root, AMENDMENT_CATALOG_FILE) ?? '').filter((record) => record.status === 'Ratified' && /Economics|ECO-/i.test(`${record.affectedAuthorities} ${record.body}`) && /\*\*Type:\*\*\s*Type [BC]/.test(record.body)); }
export function requireEconomicsFiles(root, violations) { for(const file of ECONOMICS_GOVERNANCE_FILES) requireFile(root, file, violations, 'required economics governance artifact is missing'); }
export function validateEconomicsVersionParity(root, violations) { const version=currentConstitutionVersion(root); for(const file of ECONOMICS_GOVERNANCE_FILES){const text=readText(root,file); if(text!==null&&version&&versionFromText(text)!==version)violations.push(economicsViolation(file,`declares ${versionFromText(text)??'no Constitution version'} instead of ${version}`));} }
export function validateEconomicsCatalog(root, violations) {
  const records=economicsRecords(root), amendments=new Set(economicsAmendments(root).map((r)=>r.id)), owners=authorityNames(root);
  if(!records.length) violations.push(economicsViolation(ECONOMICS_AUTHORITY_FILE,'economic authority catalog contains no records','ECO-V-001'));
  for(const duplicate of duplicated(records.map((r)=>r['Economic Authority ID']))) violations.push(economicsViolation(ECONOMICS_AUTHORITY_FILE,`duplicate economic authority ID '${duplicate}'`,'ECO-V-001'));
  for(const duplicate of duplicated(records.map((r)=>r['Economic Authority Name']))) violations.push(economicsViolation(ECONOMICS_AUTHORITY_FILE,`duplicate economic authority name '${duplicate}'`,'ECO-V-001'));
  for(const r of records){const id=r['Economic Authority ID'];
    if(!/^ECO-\d{4}$/.test(id)) violations.push(economicsViolation(ECONOMICS_AUTHORITY_FILE,`invalid economic authority ID '${id}'`,'ECO-V-001'));
    if(!r['Economic Authority Name']) violations.push(economicsViolation(ECONOMICS_AUTHORITY_FILE,`${id} is missing an economic authority name`,'ECO-V-013'));
    if(!VALID_ECONOMICS_CLASSES.includes(r['Authority Class'])) violations.push(economicsViolation(ECONOMICS_AUTHORITY_FILE,`${id} has invalid authority class '${r['Authority Class']}'`,'ECO-V-013'));
    if(!owners.has(r.Owner)) violations.push(economicsViolation(ECONOMICS_AUTHORITY_FILE,`${id} has invalid owner '${r.Owner}'`,'ECO-V-013'));
    if(!/^ERP-\d{4}$/.test(r['Rights Policy'])) violations.push(economicsViolation(ECONOMICS_AUTHORITY_FILE,`${id} has invalid rights policy '${r['Rights Policy']}'`,'ECO-V-001'));
    if(!/^EOP-\d{4}$/.test(r['Obligations Policy'])) violations.push(economicsViolation(ECONOMICS_AUTHORITY_FILE,`${id} has invalid obligations policy '${r['Obligations Policy']}'`,'ECO-V-002'));
    if(!['Yes','No'].includes(r.Revocable)) violations.push(economicsViolation(ECONOMICS_AUTHORITY_FILE,`${id} has invalid Revocable value '${r.Revocable}'`,'ECO-V-013'));
    if(!['Yes','No'].includes(r.Challengeable)) violations.push(economicsViolation(ECONOMICS_AUTHORITY_FILE,`${id} has invalid Challengeable value '${r.Challengeable}'`,'ECO-V-013'));
    if(!amendments.has(r['Creation Amendment'])) violations.push(economicsViolation(ECONOMICS_AUTHORITY_FILE,`${id} creation amendment '${r['Creation Amendment']}' is not a ratified economics amendment`,'ECO-V-011'));
    if(r['Retirement Amendment']!=='Not scheduled'&&!amendments.has(r['Retirement Amendment'])) violations.push(economicsViolation(ECONOMICS_AUTHORITY_FILE,`${id} retirement amendment '${r['Retirement Amendment']}' is invalid`,'ECO-V-011'));
    if(!VALID_ECONOMICS_STATUSES.includes(r.Status)) violations.push(economicsViolation(ECONOMICS_AUTHORITY_FILE,`${id} has invalid status '${r.Status}'`,'ECO-V-013'));
  }
}
