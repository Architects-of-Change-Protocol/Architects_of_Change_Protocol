import { enforceSignatureValid } from '../signature';
import { encode, generateKeypair, signBytes } from '../../identity';

describe('enforceSignatureValid', () => {
  it('allows missing signature fields for backward compatibility', () => {
    const decision = enforceSignatureValid({ bytes: new Uint8Array(Buffer.from('hello')) });
    expect(decision).toEqual({ decision: 'ALLOW', reason_codes: [] });
  });

  it('denies when one signature field is missing', () => {
    const decision = enforceSignatureValid({ bytes: new Uint8Array(Buffer.from('hello')), publicKey: 'abc' });
    expect(decision.decision).toBe('DENY');
    expect(decision.reason_codes).toContain('SIGNATURE_MISSING');
  });

  it('allows valid signatures and denies invalid signatures', () => {
    const bytes = new Uint8Array(Buffer.from('hello'));
    const { privateKey, publicKey } = generateKeypair();
    const signature = signBytes(privateKey, bytes);

    const valid = enforceSignatureValid({
      bytes,
      publicKey: encode(publicKey),
      signature: encode(signature)
    });

    const invalid = enforceSignatureValid({
      bytes,
      publicKey: encode(publicKey),
      signature: encode(new Uint8Array(Buffer.from('not-a-valid-signature')))
    });

    expect(valid.decision).toBe('ALLOW');
    expect(invalid.decision).toBe('DENY');
    expect(invalid.reason_codes).toContain('SIGNATURE_INVALID');
  });
});
