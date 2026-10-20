/**
 * SubMe Cryptographic Anti-Cheat & Attention Proof Engine
 * Uses Browser Web Crypto API to generate deterministic SHA-256 hashes
 * containing session nonces, timestamps, and viewer credentials.
 */

export async function generateSha256(message: string): Promise<string> {
  const msgUint8 = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export function generateNonce(length: number = 16): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

export async function generateAttentionProofHash(params: {
  campaignId: string;
  viewerId: string;
  nonce: string;
  timestamp: number;
  watchDurationSec: number;
  answerIndex: number;
}): Promise<string> {
  const payload = `SUBME::V7::${params.campaignId}::${params.viewerId}::${params.nonce}::${params.timestamp}::${params.watchDurationSec}::${params.answerIndex}`;
  return generateSha256(payload);
}

export const computeAttentionHash = generateAttentionProofHash;
