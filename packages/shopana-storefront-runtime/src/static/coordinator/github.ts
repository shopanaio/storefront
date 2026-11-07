/**
 * GitHub for the coordinator: the GitHub App `shopana-static-dispatch` (one permission,
 * `Actions: Read and write`, on the theme's repository) starts `static-site.yml` with
 * `workflow_dispatch`, and the OIDC tokens of its runs are the only credential of the lease
 * API. No shared secret: the coordinator checks the token's signature against GitHub's keys and
 * its claims against the repository, the workflow and the environment it serves.
 */
import {
  createPrivateKey,
  createPublicKey,
  sign,
  verify,
  type JsonWebKey,
  type KeyObject,
} from 'node:crypto';

type FetchLike = (input: string | URL, init?: RequestInit) => Promise<Response>;

const base64url = (value: Buffer | string) =>
  Buffer.from(value).toString('base64url');

const GITHUB_API = 'https://api.github.com';

const GITHUB_HEADERS = {
  Accept: 'application/vnd.github+json',
  'X-GitHub-Api-Version': '2022-11-28',
  'User-Agent': 'shopana-static-coordinator',
};

/** Installation tokens of a GitHub App, renewed every 50 minutes. */
export function githubAppTokens({
  appId,
  installationId,
  privateKey,
  fetch: fetchImpl = fetch,
  now = Date.now,
  apiUrl = GITHUB_API,
}: {
  appId: string;
  installationId: string;
  /** The PEM of the App's private key. */
  privateKey: string;
  fetch?: FetchLike;
  now?: () => number;
  apiUrl?: string;
}): () => Promise<string> {
  const key = createPrivateKey(privateKey);
  let cached: { token: string; at: number } | null = null;
  let pending: Promise<string> | null = null;

  /** The App's own JWT: 10 minutes at most, issued a minute back for clock drift. */
  const appJwt = () => {
    const seconds = Math.floor(now() / 1000);
    const header = base64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
    const payload = base64url(
      JSON.stringify({ iat: seconds - 60, exp: seconds + 9 * 60, iss: appId })
    );
    const signature = sign(
      'RSA-SHA256',
      Buffer.from(`${header}.${payload}`),
      key
    );
    return `${header}.${payload}.${base64url(signature)}`;
  };

  const renew = async () => {
    const response = await fetchImpl(
      `${apiUrl}/app/installations/${encodeURIComponent(installationId)}/access_tokens`,
      {
        method: 'POST',
        headers: { ...GITHUB_HEADERS, Authorization: `Bearer ${appJwt()}` },
      }
    );
    const payload = (await response.json().catch(() => null)) as {
      token?: string;
    } | null;
    if (!response.ok || !payload?.token) {
      throw new Error(`GitHub gave no installation token: ${response.status}`);
    }
    cached = { token: payload.token, at: now() };
    return payload.token;
  };

  return () => {
    if (cached && now() - cached.at < 50 * 60_000)
      return Promise.resolve(cached.token);
    pending ??= renew().finally(() => {
      pending = null;
    });
    return pending;
  };
}

export interface WorkflowDispatch {
  /** `owner/name` of the theme's repository. */
  repository: string;
  workflow: string;
  ref: string;
  inputs: Record<string, string>;
}

/** Starts a run of a workflow (`POST …/actions/workflows/:workflow/dispatches`). */
export async function dispatchWorkflow(
  dispatch: WorkflowDispatch,
  token: () => Promise<string>,
  fetchImpl: FetchLike = fetch,
  apiUrl = GITHUB_API
): Promise<void> {
  const response = await fetchImpl(
    `${apiUrl}/repos/${dispatch.repository}/actions/workflows/${encodeURIComponent(dispatch.workflow)}/dispatches`,
    {
      method: 'POST',
      headers: {
        ...GITHUB_HEADERS,
        Authorization: `Bearer ${await token()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ref: dispatch.ref, inputs: dispatch.inputs }),
    }
  );
  if (response.status !== 204 && !response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(
      `GitHub refused the dispatch: ${response.status} ${text}`.trim()
    );
  }
  await response.body?.cancel();
}

/** The issuer of the OIDC tokens of GitHub Actions. */
export const GITHUB_OIDC_ISSUER = 'https://token.actions.githubusercontent.com';

export interface OidcExpectation {
  audience: string;
  /** `owner/name`. */
  repository: string;
  /** `owner/name/.github/workflows/static-site.yml@refs/heads/main`. */
  workflowRef: string;
  /** The GitHub environment of the job (`stage`, `production`); any when unset. */
  environment?: string;
}

export interface OidcClaims {
  iss: string;
  aud: string | string[];
  exp: number;
  nbf?: number;
  iat?: number;
  repository?: string;
  workflow_ref?: string;
  environment?: string;
  run_id?: string;
  [claim: string]: unknown;
}

export class OidcError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'OidcError';
  }
}

/**
 * A verifier of OIDC tokens of GitHub Actions: RS256 by GitHub's keys (JWKS, kept an hour, read
 * again for a key it does not know), issuer, audience, time with a minute of drift, and the
 * claims of the repository, the workflow and the environment.
 */
export function githubOidcVerifier({
  expect,
  fetch: fetchImpl = fetch,
  now = Date.now,
  issuer = GITHUB_OIDC_ISSUER,
}: {
  expect: OidcExpectation;
  fetch?: FetchLike;
  now?: () => number;
  issuer?: string;
}): (token: string) => Promise<OidcClaims> {
  let keys: Map<string, KeyObject> | null = null;
  let keysAt = 0;

  const loadKeys = async () => {
    const response = await fetchImpl(`${issuer}/.well-known/jwks`);
    if (!response.ok)
      throw new OidcError(`The JWKS answered ${response.status}`);
    const { keys: list } = (await response.json()) as {
      keys: Array<JsonWebKey & { kid?: string }>;
    };
    keys = new Map(
      list
        .filter((jwk) => jwk.kid && jwk.kty === 'RSA')
        .map((jwk) => [jwk.kid!, createPublicKey({ key: jwk, format: 'jwk' })])
    );
    keysAt = now();
  };

  const keyOf = async (kid: string) => {
    if (!keys || now() - keysAt > 60 * 60_000) await loadKeys();
    let key = keys!.get(kid);
    if (!key) {
      await loadKeys();
      key = keys!.get(kid);
    }
    if (!key) throw new OidcError(`No key ${kid} in the JWKS`);
    return key;
  };

  return async (token) => {
    const parts = token.split('.');
    if (parts.length !== 3) throw new OidcError('Not a JWT');
    const [rawHeader, rawPayload, rawSignature] = parts;
    let header: { alg?: string; kid?: string };
    let claims: OidcClaims;
    try {
      header = JSON.parse(Buffer.from(rawHeader, 'base64url').toString('utf8'));
      claims = JSON.parse(
        Buffer.from(rawPayload, 'base64url').toString('utf8')
      );
    } catch {
      throw new OidcError('A JWT of no JSON');
    }
    if (header.alg !== 'RS256' || !header.kid)
      throw new OidcError('Not an RS256 token');
    const valid = verify(
      'RSA-SHA256',
      Buffer.from(`${rawHeader}.${rawPayload}`),
      await keyOf(header.kid),
      Buffer.from(rawSignature, 'base64url')
    );
    if (!valid) throw new OidcError('The signature does not hold');
    const seconds = now() / 1000;
    if (claims.iss !== issuer) throw new OidcError(`Issuer ${claims.iss}`);
    const audiences = Array.isArray(claims.aud) ? claims.aud : [claims.aud];
    if (!audiences.includes(expect.audience))
      throw new OidcError('Another audience');
    if (typeof claims.exp !== 'number' || claims.exp < seconds - 60) {
      throw new OidcError('The token expired');
    }
    if (typeof claims.nbf === 'number' && claims.nbf > seconds + 60) {
      throw new OidcError('The token is not valid yet');
    }
    if (claims.repository !== expect.repository) {
      throw new OidcError(`Repository ${claims.repository}`);
    }
    if (claims.workflow_ref !== expect.workflowRef) {
      throw new OidcError(`Workflow ${claims.workflow_ref}`);
    }
    if (expect.environment && claims.environment !== expect.environment) {
      throw new OidcError(`Environment ${claims.environment}`);
    }
    return claims;
  };
}
