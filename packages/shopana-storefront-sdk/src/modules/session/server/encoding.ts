/** Base64url and PKCE helpers shared by the `/auth/*` handlers (Web Crypto, Node and edge). */

export function bytesToBase64Url(bytes: Uint8Array): string {
  let value = '';
  bytes.forEach((byte) => {
    value += String.fromCharCode(byte);
  });
  return btoa(value).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function randomBase64Url(byteLength: number): string {
  return bytesToBase64Url(crypto.getRandomValues(new Uint8Array(byteLength)));
}

/** PKCE `S256` code challenge of a verifier. */
export async function sha256Base64Url(value: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(value)
  );
  return bytesToBase64Url(new Uint8Array(digest));
}
