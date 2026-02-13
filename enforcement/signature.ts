import type { SemDecision } from './sem';
import { decode } from '../identity/keys';
import { verifyBytes } from '../identity/sign';

type EnforceSignatureValidInput = {
  bytes: Uint8Array;
  publicKey?: string;
  signature?: string;
};

function allow(): SemDecision {
  return { decision: 'ALLOW', reason_codes: [] };
}

function deny(code: string): SemDecision {
  return { decision: 'DENY', reason_codes: [code] };
}

export function enforceSignatureValid(input: EnforceSignatureValidInput): SemDecision {
  // Backward compatible: if caller provides neither field, allow
  if (!input.signature && !input.publicKey) return allow();

  // If one is missing, deny
  if (!input.signature || !input.publicKey) return deny('SIGNATURE_MISSING');

  try {
    const publicKeyBytes = decode(input.publicKey);
    const signatureBytes = decode(input.signature);
    const valid = verifyBytes(publicKeyBytes, input.bytes, signatureBytes);
    return valid ? allow() : deny('SIGNATURE_INVALID');
  } catch {
    return deny('SIGNATURE_INVALID');
  }
}
