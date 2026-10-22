# @shopana/storefront-auth

Headless customer sign-in for storefronts: the storefront renders its own sign-in and sign-up
forms, and this package does the rest — the IAM headless API (`/headless/v1/*`, IAM contract
`k4hd`), PKCE, transaction rotation, the code exchange and the session cookies.

```
browser form ── useAuth() ──▶ /auth/headless/[action]  (BFF, client secret)
                                   │
                                   ├─▶ IAM /headless/v1/transactions, …/password/sign-in, …
                                   └─▶ IAM /oauth2/token → session cookies of @shopana/storefront-sdk
```

The session after sign-in is the SDK session: `/auth/token`, `/auth/refresh`, `/auth/logout`,
`SessionProvider`, `useUser()` and the Apollo bearer work unchanged.

## Entry points

| Import                            | Contents                                              |
| --------------------------------- | ----------------------------------------------------- |
| `@shopana/storefront-auth/react`  | `useAuth`, `useAuthConfiguration`, session re-exports |
| `@shopana/storefront-auth`        | `HeadlessAuthClient` (no React), types, `AuthError`   |
| `@shopana/storefront-auth/server` | `createHeadlessAuthRouteHandlers()`                   |

The storefront runtime mounts the handlers at `/auth/headless/[action]`; they read the same
server environment as the SDK session handlers (`IAM_OAUTH_CLIENT_ID`,
`IAM_OAUTH_CLIENT_SECRET`, `IAM_OAUTH_RESOURCE`, `IAM_OAUTH_REDIRECT_URI`,
`STOREFRONT_SESSION_SECRET`, `NEXT_PUBLIC_IAM_URL`, `NEXT_PUBLIC_IAM_APPLICATION_ID`,
`STOREFRONT_TRUSTED_PROXY_HOPS`). IAM requires the buyer address: the storefront proxy must add
it to `X-Forwarded-For`. The address is the entry `STOREFRONT_TRUSTED_PROXY_HOPS` (1 by default)
from the right, so entries the buyer sends themselves are ignored.

## Forms

The hooks need the SDK `SessionProvider` above them.

```tsx
'use client';
import { useAuth } from '@shopana/storefront-auth/react';

export function SignIn() {
  const auth = useAuth();

  if (auth.status === 'loading') return <Spinner />;
  if (auth.step.type === 'completed') return null;

  if (auth.step.type === 'otpSent') {
    return (
      <CodeForm
        length={auth.methods!.emailOtp.codeLength}
        sentTo={auth.step.destination}
        resendIn={auth.step.resendIn}
        onSubmit={(code) => auth.emailOtp.verify(code)}
        onResend={auth.emailOtp.resend}
        onBack={auth.reset}
      />
    );
  }

  return (
    <>
      {auth.methods?.password.signIn && (
        <PasswordForm
          minLength={auth.methods.password.minLength}
          onSubmit={auth.password.signIn}
          forgotPasswordHref={auth.passwordResetUrl}
        />
      )}
      {auth.methods?.emailOtp.signIn && <EmailForm onSubmit={(email) => auth.emailOtp.send(email)} />}
      {auth.methods?.social.map(({ provider }) => (
        <button key={provider} onClick={() => auth.social.start(provider)}>
          {provider}
        </button>
      ))}
      {auth.error && <FormError code={auth.error.code} retryAfter={auth.error.retryAfter} />}
    </>
  );
}
```

Actions never throw: they resolve to the step, or to `null` with `auth.error` set. One step
runs at a time: an action called while another is pending (a double submit) resolves to the
outcome of the pending one.

### Steps (`auth.step.type`)

| Step                   | What the form shows                                                                 |
| ---------------------- | ----------------------------------------------------------------------------------- |
| `idle`                 | Method forms                                                                        |
| `otpSent`              | Code field; `destination`, `resendIn` (counts down), `expiresAt`                    |
| `verificationRequired` | `method: 'otp'` — `emailOtp.send()` then `verify(code)`; `link` — check your email |
| `signInRequired`       | Account created; sign in with the same credentials                                  |
| `completed`            | Signed in; `useUser()` already has the user, the account cart is being attached     |

### Errors (`auth.error.code`)

`invalidCredentials` (never says whether the account exists), `userExists`, `signUpDisabled`,
`methodDisabled`, `invalidInput`, `expired` (the sign-in timed out, failed too often or was
spent by a parallel step; the flow returns to `idle`), `rateLimited`
(`retryAfter` seconds), `deliveryUnavailable`, `unavailable`, `disabled`.

## Not covered by the IAM headless API

Password reset, resending the verification email and changing the password are IAM hosted
pages only. `auth.passwordResetUrl` points to the hosted password reset page.

## Local development

The mock server implements the headless API: password and email-code sign-in are enabled,
the email code is always `000000`.

## Tests

```bash
yarn workspace @shopana/storefront-auth test
```

The tests import the built SDK (`@shopana/storefront-sdk/dist`).
