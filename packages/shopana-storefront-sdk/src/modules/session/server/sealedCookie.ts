/**
 * Authenticated encryption of session cookie values (AES-256-GCM, Web Crypto, so it runs in
 * Node and edge runtimes alike). The cookie name is bound as additional data: a value sealed
 * for one cookie does not open as another.
 */

import { bytesToBase64Url } from './encoding';

const VERSION = 'v1';
const IV_BYTES = 12;
const keyCache = new Map<string, Promise<CryptoKey>>();

function deriveKey(secret: string): Promise<CryptoKey> {
  let key = keyCache.get(secret);
  if (!key) {
    key = crypto.subtle
      .digest('SHA-256', new TextEncoder().encode(`shopana-session:${secret}`))
      .then((material) =>
        crypto.subtle.importKey('raw', material, 'AES-GCM', false, [
          'encrypt',
          'decrypt',
        ])
      );
    keyCache.set(secret, key);
  }
  return key;
}

export interface SealedPayload {
  /** Expiry in epoch seconds; an expired value does not open. */
  exp: number;
}

export async function seal<T extends SealedPayload>(
  secret: string,
  cookieName: string,
  payload: T
): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(IV_BYTES));
  const cipher = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv,
      additionalData: new TextEncoder().encode(cookieName),
    },
    await deriveKey(secret),
    new TextEncoder().encode(JSON.stringify(payload))
  );
  return `${VERSION}.${bytesToBase64Url(iv)}.${bytesToBase64Url(new Uint8Array(cipher))}`;
}

export async function unseal<T extends SealedPayload>(
  secret: string,
  cookieName: string,
  value: string | null | undefined
): Promise<T | null> {
  if (!value) return null;
  const [version, iv, cipher] = value.split('.');
  if (version !== VERSION || !iv || !cipher) return null;
  try {
    const plain = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: fromBase64Url(iv),
        additionalData: new TextEncoder().encode(cookieName),
      },
      await deriveKey(secret),
      fromBase64Url(cipher)
    );
    const payload = JSON.parse(new TextDecoder().decode(plain)) as T;
    if (typeof payload.exp !== 'number' || payload.exp * 1000 <= Date.now()) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

function fromBase64Url(value: string): Uint8Array<ArrayBuffer> {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
  const binary = atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, '='));
  const bytes = new Uint8Array(new ArrayBuffer(binary.length));
  for (let index = 0; index < binary.length; index++) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}
