import crypto from 'crypto';
export function sha256Hex(data) {
    return crypto.createHash('sha256').update(data).digest('hex');
}
