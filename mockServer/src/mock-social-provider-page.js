/**
 * Page of the mock social provider (Google, Facebook, Apple) opened by the headless social
 * sign-in and account connection launch URLs. The tester continues as a provider account,
 * cancels, or (on sign-in) simulates a provider account IAM refuses to link.
 */

export const PROVIDER_NAMES = {
  google: 'Google',
  facebook: 'Facebook',
  apple: 'Apple',
};

const escapeHtml = (value) =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const styles = `
    :root {
      color-scheme: light;
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      color: #171717;
      background: #f3f4f6;
    }
    * { box-sizing: border-box; }
    body { min-width: 320px; min-height: 100vh; margin: 0; display: flex; align-items: center; justify-content: center; padding: 32px 16px; }
    button, input { font: inherit; }
    button { cursor: pointer; }
    .card {
      width: min(100%, 440px);
      padding: 32px;
      border: 1px solid #e2e2df;
      border-radius: 20px;
      background: #fff;
    }
    .badge {
      display: inline-block;
      margin: 0 0 14px;
      padding: 3px 9px;
      border-radius: 999px;
      color: #92400e;
      background: #fef3c7;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }
    h1 { margin: 0 0 8px; font-size: 20px; font-weight: 750; line-height: 1.25; }
    p { margin: 0 0 22px; color: #555; font-size: 14px; line-height: 1.5; }
    label { display: grid; gap: 7px; margin: 0 0 14px; font-size: 13px; font-weight: 650; }
    input {
      width: 100%;
      height: 44px;
      padding: 0 12px;
      border: 1px solid #8a8a8a;
      border-radius: 10px;
      outline: none;
    }
    input:focus { border-color: #1c49c2; box-shadow: 0 0 0 3px rgb(28 73 194 / 16%); }
    .actions { display: grid; gap: 10px; margin-top: 22px; }
    .actions button {
      min-height: 44px;
      border-radius: 10px;
      font-size: 13px;
      font-weight: 700;
    }
    .primary { border: 1px solid #2554e8; color: #fff; background: #2554e8; }
    .secondary { border: 1px solid #9b9b9b; color: #373737; background: #fff; }
    .danger { border: 1px solid #c8102e; color: #c8102e; background: #fff; }
`;

const htmlDocument = (title, body) => `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <style>${styles}</style>
</head>
<body>
  <main class="card">
    <span class="badge">Mock provider</span>
${body}
  </main>
</body>
</html>`;

/**
 * Provider consent page. The form sends `ref` and the chosen `decision` (`continue`, `cancel`,
 * `not_linked`) with the account `email` and `name` to `action` by GET, as a provider
 * redirect would.
 */
export const mockSocialProviderPage = ({
  action,
  provider,
  ref,
  purpose,
  email,
}) => {
  const name = PROVIDER_NAMES[provider] ?? provider;
  const linking = purpose === 'link';
  return htmlDocument(
    `${name} · Mock provider`,
    `    <h1>${linking ? 'Connect' : 'Continue with'} ${escapeHtml(name)}</h1>
    <p>${
      linking
        ? 'Choose the provider account to connect to the signed-in storefront account.'
        : 'Choose the provider account to sign in to the storefront with. A new email creates an account; an existing email signs in to it.'
    }</p>
    <form method="get" action="${escapeHtml(action)}">
      <input type="hidden" name="ref" value="${escapeHtml(ref)}">
      <label>Account email
        <input type="email" name="email" value="${escapeHtml(email)}" required>
      </label>
      <label>Name
        <input type="text" name="name" value="${escapeHtml(`${name} User`)}">
      </label>
      <div class="actions">
        <button class="primary" type="submit" name="decision" value="continue">Continue as this account</button>
        ${
          linking
            ? ''
            : '<button class="danger" type="submit" name="decision" value="not_linked" formnovalidate>Simulate account_not_linked</button>'
        }
        <button class="secondary" type="submit" name="decision" value="cancel" formnovalidate>Cancel</button>
      </div>
    </form>`
  );
};

/** HTML error page of a browser route (spent ticket, unknown ref). */
export const mockAuthErrorPage = (message) =>
  htmlDocument(
    'Sign-in link is invalid',
    `    <h1>This link cannot be used</h1>
    <p>${escapeHtml(message)}</p>`
  );

/** Hosted outcome page of an email verification link opened without `verify_uri`. */
export const mockEmailVerifiedPage = (verified) =>
  htmlDocument(
    verified ? 'Email verified' : 'Verification link is invalid',
    `    <h1>${verified ? 'Email verified' : 'This link cannot be used'}</h1>
    <p>${
      verified
        ? 'The email is confirmed. Return to the store and sign in.'
        : 'The verification link is invalid, expired or already used.'
    }</p>`
  );
