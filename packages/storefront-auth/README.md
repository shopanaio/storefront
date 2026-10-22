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
| `@shopana/storefront-auth/ui`     | sign-in screens, `AuthDialog`, `AuthInline`, theme    |
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
          onForgotPassword={
            auth.methods.password.reset ? auth.password.forgot : undefined
          }
        />
      )}
      {auth.methods?.emailOtp.signIn && (
        <EmailForm onSubmit={(email) => auth.emailOtp.send(email)} />
      )}
      {auth.methods?.social.map(({ provider }) => (
        <button key={provider} onClick={() => auth.social.start(provider)}>
          {provider}
        </button>
      ))}
      {auth.error && (
        <FormError code={auth.error.code} retryAfter={auth.error.retryAfter} />
      )}
    </>
  );
}
```

Actions never throw: they resolve to the step, or to `null` with `auth.error` set. One step
runs at a time: an action called while another is pending (a double submit) resolves to the
outcome of the pending one.

### Steps (`auth.step.type`)

| Step                   | What the form shows                                                                |
| ---------------------- | ---------------------------------------------------------------------------------- |
| `idle`                 | Method forms                                                                       |
| `otpSent`              | Code field; `destination`, `resendIn` (counts down), `expiresAt`                   |
| `verificationRequired` | `method: 'otp'` — `emailOtp.send()` then `verify(code)`; `link` — check your email |
| `signInRequired`       | Account created; sign in with the same credentials                                 |
| `resetLinkSent`        | `password.forgot()` sent a reset link to `email`, if it has an account             |
| `passwordReset`        | `password.reset()` set the new password; sign in with it                           |
| `verificationSent`     | `emailVerification.resend()` sent the verification email to `email` again          |
| `completed`            | Signed in; `useUser()` already has the user, the account cart is being attached    |

### Errors (`auth.error.code`)

`invalidCredentials` (never says whether the account exists), `userExists`, `signUpDisabled`,
`methodDisabled`, `invalidInput`, `expired` (the sign-in timed out, failed too often or was
spent by a parallel step; the flow returns to `idle`), `rateLimited`
(`retryAfter` seconds), `deliveryUnavailable`, `unavailable`, `disabled`. Account actions add
`signInRequired`, `reauthenticationRequired`, `lastLoginMethod`, `accountConflict` and
`linkingFailed`.

## Password reset

`auth.password.forgot(email, { resetPath })` emails a link to `resetPath` of this storefront
(`/account/reset-password` by default). The link passes through IAM, which adds the reset token
or, for a spent or expired link, an error. The page reads it and sets the new password:

```tsx
const link = readPasswordResetLink(); // { token } | { error: 'expired' } | null
clearPasswordResetLink(); // keeps the token out of the history and the Referer
if (link && 'token' in link) {
  await auth.password.reset({ token: link.token, password });
}
```

The reset ends every session of the buyer, who then signs in with the new password.

## Email verification

A password sign-in or sign-up of an unverified email, and `auth.emailVerification.resend()`,
email a verification link to `verifyPath` of this storefront (`/account/verify-email` by
default): `auth.password.signIn({ email, password, verifyPath })`,
`auth.emailVerification.resend(email, { verifyPath })`. The link passes through IAM, which
verifies the email and adds the outcome. The page reads it:

```tsx
const link = readEmailVerificationLink(); // { verified: true } | { error: 'expired' } | null
```

A verified buyer then signs in. An expired link offers `emailVerification.resend()`.

## Provider sign-in that did not complete

Back from a social provider without a session, the page gets the reason from
`useAuthResult()`: `cancelled` (declined at the provider), `accountNotLinked` (the email belongs
to an account with another way to sign in; sign in with it and connect the provider) or `failed`.
Show it once and call `clear()`; a new session clears it too.

## Buyer

`useUser()` has `phone` (E.164) when the account has a confirmed phone. A buyer who signed in
only by phone has an empty `email`.

`useLoginMethod()` is the identifier the buyer signed in with: `email` (password, email code or a
social provider) or `phone` (SMS code). It lasts for the whole session, refreshes included, so a
form can keep it read-only. A storefront signs in either with these forms or on the IAM pages,
never both; after a sign-in on the IAM pages it is null.

## Connected accounts

`useAccountConnections()` lists the social providers of the signed-in buyer and connects or
disconnects them, like the IAM hosted connections page. Connecting leaves for the provider and
returns to `returnTo` (the current page); the hook reads the outcome from the address bar into
`result`. Changing connections needs a sign-in within the last 10 minutes
(`connections.reauthenticationRequired`, error `reauthenticationRequired`); the last way to
sign in cannot be disconnected (`lastLoginMethod`).

## Local development

The mock server implements the headless API: password and email-code sign-in and password
reset are enabled, the email code is always `000000`, and the reset link is printed to its
console.

## Tests

```bash
yarn workspace @shopana/storefront-auth test
```

The tests import the built SDK (`@shopana/storefront-sdk/dist`).

## Sign-in screens (`@shopana/storefront-auth/ui`)

Ready screens of the headless sign-in, on antd and `@shopana/storefront-ui`. They have no sign-in
logic of their own: everything comes from the hooks above. A storefront renders them either
here or not at all — a storefront signs in either headless or on the IAM pages, never both.

| Component               | Where                                                                    |
| ----------------------- | ------------------------------------------------------------------------ |
| `AuthDialog`            | `store`: antd `Modal` 440px; `checkoutGuest`: the right drawer (vaul)     |
| `AuthInline`            | in the page, `checkoutRequired` by default                               |
| `AuthFlow`              | the screens and their navigation, without a container                    |
| `ResetPasswordPage`     | `/account/reset-password`: new password, a spent link offers a new one   |
| `EmailVerificationPage` | `/account/verify-email`: confirmed email, or a new verification email    |
| `AccountConnections`    | social accounts of the profile (`useAccountConnections`)                 |

On a phone (narrower than 768px) the dialog and the drawer are bottom sheets. `context`
(`store`, `checkoutGuest`, `checkoutRequired`) changes texts and what is offered only: the title,
the guest-checkout hint of `unavailable` and `disabled`, the password sign-up link (store only).

```tsx
<AuthDialog
  context="checkoutGuest"
  open={open}
  onClose={() => setOpen(false)}
  defaultIdentifier={{ email: contact.email, phone: contact.phone }}
  beforeSocial={saveTypedInput}
/>
```

The screens (`IdentifyScreen`, `PasswordScreen`, `SignUpScreen`, `CodeScreen`, `ForgotScreen`,
`ResultScreen`, `ResetPasswordScreen`, `EmailVerificationScreen`, `AccountConnectionsView`) take
plain props, so a story or a test renders any of their states.

### Theme

Three levels, none of them touches the logic:

1. **Tokens.** Colors, fonts, sizes and radii come from the antd tokens only; a theme sets them
   in its `ConfigProvider` (also restyling the checkout).
2. **`classNames` and `styles`** of `AuthUIProvider`, for all screens at once: `root`, `header`,
   `title`, `alert`, `tabs`, `field`, `submit`, `divider`, `social`, `legal`, `footer`.
3. **`components`** of `AuthUIProvider`, a fixed set tokens cannot draw: `SocialButtons`,
   `Divider`, `Logo`, `Legal`, `MethodTabs`. Fields, the phone and the drawer are shared with
   the checkout and are not replaced.

```tsx
<ConfigProvider theme={brandTheme}>
  <AuthUIProvider
    classNames={{ submit: 'brand-cta' }}
    components={{ SocialButtons, Divider, Logo }}
    legalLinks={{ terms: '/policies/terms', privacy: '/policies/privacy' }}
  >
    {children}
  </AuthUIProvider>
</ConfigProvider>
```

Texts live in the next-intl namespace `Auth` with uk / ru / en defaults; a theme overrides any
of them in its own messages. Social providers are named and drawn from their id (`google`,
`facebook`, `apple`); an unknown provider shows its id and its first letter.

### Storybook

`yarn storybook` from the workspace root: **Storefront Auth / Screens**, every screen with the
`state` values of its design board, without a theme and with the Bite Crunch one.
