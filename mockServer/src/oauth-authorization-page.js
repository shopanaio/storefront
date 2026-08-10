export const oauthAuthorizationPage = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Sign in · Shopana IAM mock</title>
  <style>
    :root { color-scheme: light; font-family: Inter, ui-sans-serif, system-ui, sans-serif; }
    * { box-sizing: border-box; }
    body { margin: 0; min-height: 100vh; display: grid; place-items: center; padding: 24px; background: #f3f4f6; color: #111827; }
    main { width: min(100%, 420px); padding: 28px; border: 1px solid #e5e7eb; border-radius: 16px; background: white; box-shadow: 0 18px 50px rgb(15 23 42 / 10%); }
    h1 { margin: 0 0 8px; font-size: 24px; }
    p { margin: 0 0 22px; color: #6b7280; line-height: 1.5; }
    .tabs, .actions { display: flex; gap: 8px; }
    .tabs { margin-bottom: 20px; padding: 4px; border-radius: 10px; background: #f3f4f6; }
    button { min-height: 42px; border: 0; border-radius: 8px; padding: 0 14px; font: inherit; cursor: pointer; }
    .tabs button { flex: 1; background: transparent; color: #4b5563; }
    .tabs button.active { background: white; color: #111827; box-shadow: 0 1px 4px rgb(15 23 42 / 12%); }
    label { display: grid; gap: 6px; margin: 14px 0; font-size: 14px; font-weight: 600; }
    input { width: 100%; min-height: 44px; border: 1px solid #d1d5db; border-radius: 8px; padding: 0 12px; font: inherit; }
    input:focus { border-color: #2563eb; outline: 3px solid #dbeafe; }
    .actions { margin-top: 20px; }
    .submit { flex: 1; background: #111827; color: white; }
    .cancel { background: #e5e7eb; color: #374151; }
    .error { min-height: 20px; margin: 12px 0 0; color: #b91c1c; font-size: 14px; }
    .hint { margin-top: 20px; padding-top: 16px; border-top: 1px solid #e5e7eb; font-size: 13px; }
    [hidden] { display: none; }
  </style>
</head>
<body>
  <main>
    <h1>Shopana IAM mock</h1>
    <p>Authenticate to continue to the storefront.</p>
    <div class="tabs">
      <button id="signInTab" class="active" type="button">Sign in</button>
      <button id="signUpTab" type="button">Create account</button>
    </div>
    <form id="authForm">
      <label id="nameField" hidden>Name
        <input id="name" autocomplete="name" value="Mock User">
      </label>
      <label>Email
        <input id="email" type="email" autocomplete="email" value="alex.morgan@example.com" required>
      </label>
      <label>Password
        <input id="password" type="password" autocomplete="current-password" value="password123" required>
      </label>
      <div id="error" class="error" role="alert"></div>
      <div class="actions">
        <button class="submit" type="submit">Continue</button>
        <button id="cancel" class="cancel" type="button">Cancel</button>
      </div>
    </form>
    <p class="hint">Fixture account: alex.morgan@example.com / password123</p>
  </main>
  <script>
    const suffix = '/oauth2/authorize';
    const base = location.pathname.slice(0, -suffix.length);
    const error = document.getElementById('error');
    const nameField = document.getElementById('nameField');
    const password = document.getElementById('password');
    const signInTab = document.getElementById('signInTab');
    const signUpTab = document.getElementById('signUpTab');
    let mode = 'sign-in';

    function setMode(nextMode) {
      mode = nextMode;
      const signUp = mode === 'sign-up';
      nameField.hidden = !signUp;
      password.autocomplete = signUp ? 'new-password' : 'current-password';
      signInTab.classList.toggle('active', !signUp);
      signUpTab.classList.toggle('active', signUp);
      error.textContent = '';
    }

    signInTab.addEventListener('click', () => setMode('sign-in'));
    signUpTab.addEventListener('click', () => setMode('sign-up'));

    document.getElementById('authForm').addEventListener('submit', async (event) => {
      event.preventDefault();
      error.textContent = '';
      const input = {
        email: document.getElementById('email').value,
        password: password.value,
        rememberMe: true,
      };
      if (mode === 'sign-up') input.name = document.getElementById('name').value;
      try {
        const response = await fetch(base + '/' + mode + '/email', {
          method: 'POST',
          credentials: 'same-origin',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(input),
        });
        const body = await response.json();
        if (!response.ok) {
          error.textContent = body.error_description || body.error || 'Authentication failed';
          return;
        }
        location.reload();
      } catch (requestError) {
        error.textContent = String(requestError);
      }
    });

    document.getElementById('cancel').addEventListener('click', () => {
      const query = new URLSearchParams(location.search);
      const redirect = new URL(query.get('redirect_uri'));
      redirect.searchParams.set('error', 'access_denied');
      if (query.has('state')) redirect.searchParams.set('state', query.get('state'));
      location.assign(redirect);
    });
  </script>
</body>
</html>`;
