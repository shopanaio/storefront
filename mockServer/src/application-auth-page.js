export const applicationAuthPage = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Shopana application auth mock</title>
  <style>
    :root { color-scheme: light dark; font-family: ui-sans-serif, system-ui, sans-serif; }
    body { margin: 0; background: #111827; color: #e5e7eb; }
    main { width: min(960px, calc(100% - 32px)); margin: 40px auto; }
    h1 { margin-bottom: 8px; } p { color: #9ca3af; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px; }
    section { background: #1f2937; border: 1px solid #374151; border-radius: 14px; padding: 18px; }
    label { display: grid; gap: 6px; margin: 12px 0; font-size: 14px; }
    input { box-sizing: border-box; width: 100%; border: 1px solid #4b5563; border-radius: 8px; padding: 10px; background: #111827; color: inherit; }
    button { border: 0; border-radius: 8px; padding: 10px 14px; background: #2563eb; color: white; cursor: pointer; }
    button.secondary { background: #4b5563; } button.danger { background: #b91c1c; }
    .actions { display: flex; flex-wrap: wrap; gap: 8px; }
    pre { min-height: 120px; overflow: auto; padding: 14px; border-radius: 10px; background: #030712; color: #a7f3d0; }
    .session { padding: 12px; margin-top: 10px; border: 1px solid #4b5563; border-radius: 10px; word-break: break-all; }
    .session button { margin-top: 8px; }
  </style>
</head>
<body>
<main>
  <h1>Application auth mock</h1>
  <p>Email/password authentication and in-memory session management. Data resets when the server restarts.</p>
  <section>
    <label>Application ID
      <input id="applicationId" value="00000000-0000-4000-8000-000000000001">
    </label>
  </section>
  <div class="grid">
    <section>
      <h2>Account</h2>
      <label>Name <input id="name" value="Mock User"></label>
      <label>Email <input id="email" type="email" value="user@example.com"></label>
      <label>Password <input id="password" type="password" value="password123"></label>
      <label><span><input id="rememberMe" type="checkbox" checked style="width:auto"> Remember me</span></label>
      <div class="actions">
        <button id="signup">Sign up</button>
        <button id="signin" class="secondary">Sign in</button>
        <button id="logout" class="danger">Log out</button>
      </div>
    </section>
    <section>
      <h2>Sessions</h2>
      <button id="sessions">Refresh sessions</button>
      <div id="sessionList"></div>
    </section>
  </div>
  <h2>Last response</h2>
  <pre id="result">Ready.</pre>
</main>
<script>
  const byId = (id) => document.getElementById(id);
  const result = byId('result');
  const base = () => '/auth/applications/' + encodeURIComponent(byId('applicationId').value.trim());
  const account = () => ({
    email: byId('email').value,
    password: byId('password').value,
    rememberMe: byId('rememberMe').checked,
  });

  async function request(path, options = {}) {
    try {
      const response = await fetch(base() + path, {
        credentials: 'same-origin',
        headers: { 'content-type': 'application/json' },
        ...options,
      });
      const body = await response.json();
      result.textContent = response.status + ' ' + response.statusText + '\\n' + JSON.stringify(body, null, 2);
      return { response, body };
    } catch (error) {
      result.textContent = String(error);
      return null;
    }
  }

  async function refreshSessions() {
    const value = await request('/list-sessions');
    const list = byId('sessionList');
    list.replaceChildren();
    if (!value?.response.ok || !Array.isArray(value.body)) return;
    for (const session of value.body) {
      const item = document.createElement('div');
      item.className = 'session';
      const details = document.createElement('div');
      details.textContent = session.id + ' · ' + (session.userAgent || 'unknown client') + ' · expires ' + session.expiresAt;
      const revoke = document.createElement('button');
      revoke.className = 'danger';
      revoke.textContent = 'Revoke';
      revoke.addEventListener('click', async () => {
        await request('/revoke-session', { method: 'POST', body: JSON.stringify({ token: session.token }) });
        await refreshSessions();
      });
      item.append(details, revoke);
      list.append(item);
    }
  }

  byId('signup').addEventListener('click', () => request('/sign-up/email', {
    method: 'POST', body: JSON.stringify({ ...account(), name: byId('name').value }),
  }));
  byId('signin').addEventListener('click', () => request('/sign-in/email', {
    method: 'POST', body: JSON.stringify(account()),
  }));
  byId('logout').addEventListener('click', async () => {
    await request('/sign-out', { method: 'POST', body: '{}' });
    byId('sessionList').replaceChildren();
  });
  byId('sessions').addEventListener('click', refreshSessions);
</script>
</body>
</html>`;
