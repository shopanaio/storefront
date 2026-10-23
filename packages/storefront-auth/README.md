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

| Import                                   | Contents                                                               |
| ---------------------------------------- | ---------------------------------------------------------------------- |
| `@shopana/storefront-auth/react`         | `useAuth`, `useAuthConfiguration`, `useAuthAction`, session re-exports |
| `@shopana/storefront-auth/ui`            | sign-in screens, `AuthFlow`, `AuthDialog`, `AuthInline`, theme         |
| `@shopana/storefront-auth/ui/primitives` | the parts the screens are built of, for screens of a host              |
| `@shopana/storefront-auth/testing`       | `createMockAuth()` and fixtures for stories and tests                  |
| `@shopana/storefront-auth`               | `HeadlessAuthClient` (no React), types, `AuthError`                    |
| `@shopana/storefront-auth/server`        | `createHeadlessAuthRouteHandlers()`                                    |

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

Actions never throw: they resolve to the next step, or to the `AuthError` it failed with
(`isAuthError(outcome)`), which is also `auth.error` until the next action. One step runs at a
time: an action called while another is pending (a double submit) resolves to the outcome of the
pending one. `emailOtp.send()` without an argument sends to the email of the last password
sign-in, sign-up or reset, as a `verificationRequired` step with `method: 'otp'` needs. The result
of `useAuth()` is stable while nothing in it changes. `auth.reloadConfiguration()` reads the
methods again after `status` was `unavailable`.

### Steps (`auth.step.type`)

| Step                   | What the form shows                                                                |
| ---------------------- | ---------------------------------------------------------------------------------- |
| `idle`                 | Method forms                                                                       |
| `otpSent`              | Code field; `destination`, `resendIn` (counts down to `resendAt`), `expiresAt`     |
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
`linkingFailed`. `error.occurredAt` is when the step failed: a rate limit is over at
`occurredAt + retryAfter * 1000`. `useSecondsUntil(deadline)` counts any deadline down against the
clock.

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
clearEmailVerificationLink(); // a reload does not show the outcome again
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
never both; after a sign-in on the IAM pages it is null. `useLoginIdentifier()` of
`@shopana/storefront-auth/ui` gives it with its value: `{ method, value, display }`, the phone
formatted for `display`, or null.

## Connected accounts

`useAccountConnections()` lists the social providers of the signed-in buyer and connects or
disconnects them, like the IAM hosted connections page; `reload()` shows the list loading again. Connecting leaves for the provider and
returns to `returnTo` (the current page); the hook reads the outcome from the address bar into
`result`. Changing connections needs a sign-in within the last 10 minutes
(`connections.reauthenticationRequired`, error `reauthenticationRequired`); the last way to
sign in cannot be disconnected (`lastLoginMethod`).

## Actions that need a sign-in

An action of a signed-in buyer (open the account, save a product, answer a question) does not
run together with opening the sign-in: it waits for the sign-in and runs after it.

```tsx
<AuthActionProvider requestSignIn={({ screen }) => openSignIn(screen)}>
  …
</AuthActionProvider>;

const saveProduct = useAuthAction<{ productId: string }>(
  `wishlist:${product.id}`,
  ({ productId }) => wishlist.add(productId),
  { guest: false, screen: 'identify' }
);
saveProduct({ productId: product.id });
```

With a session the handler runs at once. Without one the action is kept in `sessionStorage`
(its `key`, a JSON payload, the page and the time) and `requestSignIn` opens the sign-in on
`screen`; once the session is there, the component that registered `key` on that page runs the
handler with the payload, also after a provider sign-in that left the page. `guest: true` runs
it at once without a session, for what the store's settings let a guest do. While the session
loads the call does nothing. A key names what the action is done to and is unique on the page,
except for handlers that do the same with the payload. The action is dropped after 15 minutes,
on another page, and when the buyer closes `AuthDialog`; a sign-in of its own calls
`discardPendingAuthAction()`. The payload should carry the wanted state (`wishlisted: true`)
rather than a toggle, so that running it after the sign-in keeps what the account already has.

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

| Component               | Where                                                                   |
| ----------------------- | ----------------------------------------------------------------------- |
| `AuthDialog`            | over the page: `presentation` `dialog` (antd `Modal` 440px) or `drawer` |
| `AuthInline`            | in the page, `checkoutRequired` by default                              |
| `AuthFlow`              | the screens and their navigation, without a container                   |
| `AuthCard`              | a store card on a page of its own (logo, optional `onBack`)             |
| `ResetPasswordPage`     | `/account/reset-password`: new password, a spent link offers a new one  |
| `EmailVerificationPage` | `/account/verify-email`: confirmed email, or a new verification email   |
| `AccountConnections`    | social accounts of the profile (`useAccountConnections`)                |

On a phone (narrower than 768px for the dialog, 1024px for the drawer) both are bottom sheets.
`presentation` picks the container: the drawer is the one of the checkout, its header carrying
the title of the screen and, on a side panel, the close button. `context` (`store`,
`checkoutGuest`, `checkoutRequired`) changes texts and what is offered only: the title, the
guest-checkout hint of the `unavailable` alerts, the text of `disabled`.

```tsx
<AuthDialog
  presentation="drawer"
  context="checkoutGuest"
  open={open}
  onClose={() => setOpen(false)}
  defaultIdentifier={{ email: contact.email, phone: contact.phone }}
  beforeSocial={saveTypedInput}
/>
```

`renderHeader(navigation)` of `AuthDialog`, `AuthInline` and `AuthFlow` draws the header over the
screen (`CardHeader` — back and the logo — in a dialog by default). `AuthInline` takes a `ref`
with `focus()` (the first field of the screen) and `element` (the panel), e.g. for "Log in"
elsewhere on the page. The pages read the link of their address once, remove it from the
address bar and take `search` from a host router whose client-side navigation does not fire
`popstate`.

### Flow

`AuthFlow` is `useAuthFlow(options)` rendered with a component per screen. The hook gives the
screen shown and the props of its component (`view`: `identify`, `password`, `signUp`, `forgot`,
`code`, `verifyLink`, `social`, `signingIn`), the way back (`navigation`) and the identifier
typed so far (`draft`, shared by the screens). `screens` of `AuthFlow` (and of the containers)
replaces any of them with a component of the same props (`AuthFlowScreenProps`):

```tsx
<AuthDialog open={open} onClose={close} screens={{ signUp: BrandSignUp }} />
```

The navigation is exported for hosts and tests: `flowReducer`, `initialFlow`, `reactToStep`,
`screenOf`, `canGoBack`, `currentScreen` and the `FlowScreen` types. The screens
(`IdentifyScreen`, `PasswordScreen`, `SignUpScreen`, `CodeScreen`, `ForgotScreen`,
`SigningInScreen`, `ResultScreen`, `ResetPasswordScreen`, `EmailVerificationScreen`,
`AccountConnectionsView`) take plain props, so a story or a test renders any of their states;
the identifier fields take `draft` and `onDraftChange`, the screens own the rest of their fields.

`@shopana/storefront-auth/ui/primitives` has the parts they are built of, so a screen of a host
looks like the others: `Screen`, `ScreenTitle`, `Badge`, `Chip`, `Footer`, `Stack`,
`AuthAlert`, `RateLimitAlert`, `useErrorAlert` (the alert of every error code, `unavailable` in
the words of the context), `useRateLimit`, `AuthForm`, `Field`, `EmailField`, `useSubmit`,
`usePasswordRules`, `SubmitButton`, `TextAction`, `InlineAction`, `ResendAction`, `CodeCells`,
and `AuthHeadingSlotContext` for a container whose own header shows the title.

### Theme

Three levels, none of them touches the logic:

1. **Tokens.** Colors, fonts, sizes and radii come from the antd tokens only; a theme sets them
   in its `ConfigProvider` (also restyling the checkout).
2. **`classNames` and `styles`** of `AuthUIProvider`, for all screens at once: `root`, `header`,
   `title`, `subtitle`, `badge`, `chip`, `alert`, `tabs`, `form`, `field`, `codeCells`, `rules`,
   `submit`, `textAction`, `divider`, `social`, `legal`, `footer`.
3. **`components`** of `AuthUIProvider`, a fixed set tokens cannot draw: `SocialButtons`,
   `Divider`, `Logo`, `Legal`, `MethodTabs`, `PasswordRules`. Fields, the phone and the drawer
   are shared with the checkout and are not replaced.

`headingLevel` sets the level of the screen titles (2 by default). Objects written inline are
compared by their entries, so they do not re-render the screens; components should be defined
outside the render.

```tsx
<ConfigProvider theme={brandTheme}>
  <AuthUIProvider
    classNames={{ submit: 'brand-cta' }}
    components={{ SocialButtons, Divider, Logo }}
    legalLinks={{ privacy: '/policies/privacy' }}
  >
    {children}
  </AuthUIProvider>
</ConfigProvider>
```

The legal note under the forms is the consent to the processing of personal data, linked to
`legalLinks.privacy`. `DefaultLegal` takes `renderPrivacyLink(chunks, href)` for a `Legal` of a
host that opens the policy its own way:

```tsx
const Consent = (props: LegalProps) => (
  <DefaultLegal
    {...props}
    renderPrivacyLink={(chunks) => <PolicyButton>{chunks}</PolicyButton>}
  />
);
```

Texts live in the next-intl namespace `Auth` with uk / ru / en defaults; a theme overrides any
of them in its own messages. Social providers are named and drawn from their id (`google`,
`facebook`, `apple`); an unknown provider shows its id and its first letter.

### Testing

`createMockAuth(options)` of `@shopana/storefront-auth/testing` is a `useAuth()` that answers
like IAM, for the mock of the hook in a story or a test: the code is `MOCK_CODE` (`000000`), any
password but `WRONG_PASSWORD` signs in, `onSignedIn(method, destination)` signs the host's
session in. `set()` puts it in any state. The fixtures (`MOCK_METHODS`, `methodsOf`, `errorOf`,
`EMAIL`, `PHONE`) are those of the design boards.

```ts
const auth = createMockAuth({
  latencyMs: 0,
  onSignedIn: (method) => signInStory(method),
});
mocked(useAuth).mockImplementation(auth.useAuth);
```

### Storybook

`yarn storybook` from the workspace root: **Storefront Auth / Screens**, every screen with the
`state` values of its design board, without a theme and with the Bite Crunch one. A theme's
Storybook in this workspace renders the same board definitions from the sources
(`src/ui/stories/definitions`, aliased as `@shopana/storefront-auth/stories`); they are not an
entry of the package.
