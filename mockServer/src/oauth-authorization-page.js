export const oauthAuthorizationPage = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Sign in · Кусь та Хрусь</title>
  <style>
    :root {
      color-scheme: light;
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      color: #171717;
      background: #edf6ff;
    }
    * { box-sizing: border-box; }
    body { min-width: 320px; min-height: 100vh; margin: 0; }
    button, input { font: inherit; }
    button { cursor: pointer; }
    .page {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      background: #edf6ff;
    }
    .content {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 32px 20px 48px;
    }
    .brand {
      display: block;
      width: 230px;
      height: auto;
      margin: 0 0 26px;
    }
    .card {
      width: min(100%, 520px);
      padding: 37px 39px 38px;
      border: 1px solid #e2e2df;
      border-radius: 26px;
      background: #fff;
      box-shadow: 0 1px 2px rgb(15 23 42 / 3%);
    }
    h1 {
      margin: 0 0 24px;
      font-size: 20px;
      font-weight: 750;
      line-height: 1.25;
      letter-spacing: -0.01em;
    }
    .field {
      display: grid;
      gap: 7px;
      margin: 0 0 19px;
    }
    .field-label {
      font-size: 13px;
      font-weight: 650;
      line-height: 1.25;
    }
    .required { color: #c8102e; }
    input {
      width: 100%;
      height: 46px;
      padding: 0 13px;
      border: 1px solid #8a8a8a;
      border-radius: 10px;
      color: #171717;
      background: #fff;
      outline: none;
      transition: border-color 120ms ease, box-shadow 120ms ease;
    }
    input:hover { border-color: #4a4a4a; }
    input:focus {
      border-color: #1c49c2;
      box-shadow: 0 0 0 3px rgb(28 73 194 / 16%);
    }
    input[aria-invalid="true"] {
      border: 2px solid #c8102e;
      box-shadow: none;
    }
    .error {
      display: flex;
      align-items: flex-start;
      gap: 7px;
      min-height: 18px;
      margin: -11px 0 18px;
      color: #c8102e;
      font-size: 12px;
      font-weight: 650;
      line-height: 1.4;
    }
    .error:empty { min-height: 0; margin: 0; }
    .error:not(:empty)::before {
      content: "!";
      flex: 0 0 14px;
      width: 14px;
      height: 14px;
      margin-top: 1px;
      border-radius: 50%;
      color: #fff;
      background: #c8102e;
      font-size: 10px;
      font-weight: 800;
      line-height: 14px;
      text-align: center;
    }
    .primary, .provider {
      width: 100%;
      min-height: 45px;
      border-radius: 10px;
      font-size: 13px;
      font-weight: 700;
    }
    .primary {
      border: 1px solid #2554e8;
      color: #fff;
      background: linear-gradient(110deg, #2556f0 0%, #294ac1 100%);
      transition: filter 120ms ease, border-color 120ms ease;
    }
    .primary:hover { border-color: #123ba8; filter: brightness(0.92); }
    .primary:focus-visible, .provider:focus-visible, .text-button:focus-visible {
      outline: 3px solid rgb(28 73 194 / 24%);
      outline-offset: 2px;
    }
    .divider {
      display: grid;
      grid-template-columns: 1fr auto 1fr;
      align-items: center;
      gap: 10px;
      margin: 25px 0 21px;
      color: #4b4b4b;
      font-size: 14px;
    }
    .divider::before, .divider::after {
      content: "";
      height: 1px;
      background: #bcbcbc;
    }
    .providers { display: grid; gap: 18px; }
    .provider {
      display: grid;
      grid-template-columns: 22px auto 22px;
      align-items: center;
      padding: 0 16px;
      border: 1px solid #9b9b9b;
      color: #373737;
      background: #fff;
      transition: border-color 120ms ease, background 120ms ease;
    }
    .provider:hover { border-color: #444; background: #fafafa; }
    .provider img { width: 19px; height: 19px; object-fit: contain; }
    .provider span { grid-column: 2; }
    .text-button {
      border: 0;
      padding: 2px;
      color: #1c49c2;
      background: transparent;
      font-size: 13px;
      font-weight: 700;
      text-decoration: underline;
      text-underline-offset: 2px;
    }
    .mode-row {
      margin: 18px 0 0;
      padding: 0;
      color: #555;
      font-size: 13px;
      line-height: 1.5;
      text-align: center;
    }
    .footer {
      min-height: 100px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 28px;
      padding: 24px max(28px, calc((100vw - 1210px) / 2));
      color: #767676;
      background: #fff;
      font-size: 12px;
      line-height: 1.5;
    }
    .footer strong { color: #4b4b4b; }
    .footer-meta { text-align: right; }
    [hidden] { display: none !important; }
    @media (max-width: 640px) {
      .content { justify-content: flex-start; padding: 24px 14px 32px; }
      .brand { width: 190px; margin-bottom: 22px; }
      .card { padding: 29px 24px 30px; border-radius: 20px; }
      .footer { min-height: 112px; flex-direction: column; justify-content: center; gap: 8px; padding: 22px 20px; text-align: center; }
      .footer-meta { text-align: center; }
    }
  </style>
</head>
<body>
  <div class="page">
    <div class="content">
      <img class="brand" src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjMyIiBoZWlnaHQ9IjEyNyIgdmlld0JveD0iMCAwIDYzMiAxMjciIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik0yNjAuNjg0IDQwLjI1NDRDMjU1LjU0MiA0MC4yNTQ0IDI1MS4xNjggMzYuNjY2OSAyNTEuMTY4IDMxLjQ5MzVDMjUxLjE2OCAyNS45ODIxIDI1NS4zMzggMjIuOTkyNSAyNjIuODg0IDIyLjUyNDVMMjY5LjA3NCAyMi4xMzQ2VjIwLjczMDdDMjY5LjA3NCAxOC44MDY5IDI2Ny42NDEgMTcuNzY3MSAyNjUuNjcyIDE3Ljc2NzFDMjY0LjAzNSAxNy43NjcxIDI2My4yMTYgMTguMjA5IDI2MS40IDE5Ljg5ODhDMjYwLjE3MiAyMS4wNDI3IDI1OC44NDIgMjEuNjE0NiAyNTcuMjgyIDIxLjYxNDZDMjU0LjggMjEuNjE0NiAyNTMuMDM1IDIwLjA1NDggMjUzLjAzNSAxNy44NDVDMjUzLjAzNSAxNy4xOTUxIDI1My4wODYgMTYuNzc5MiAyNTMuMjQgMTYuMjU5MkMyNTQuMzE0IDEyLjU5MzcgMjU5LjIgMTAuNDA5OSAyNjYuMjM1IDEwLjQwOTlDMjc0LjA2MiAxMC40MDk5IDI3OS4zMDYgMTQuMzg3NSAyNzkuMzA2IDIwLjIxMDhWMzUuMTMzQzI3OS4zMDYgMzguODI0NiAyNzcuMTMyIDQwLjQ4ODQgMjc0LjExMyA0MC40ODg0QzI3MS4zNTEgNDAuNDg4NCAyNjkuNDA2IDM5LjExMDYgMjY5LjA3NCAzNS45OTA5SDI2OC44NjlDMjY3LjM4NiAzOC43OTg2IDI2My45NTggNDAuMjU0NCAyNjAuNjg0IDQwLjI1NDRaTTI2NC41OTcgMzMuMTMxM0MyNjYuOTI1IDMzLjEzMTMgMjY5LjA3NCAzMS44MDU0IDI2OS4wNzQgMjkuNjk5N1YyNy44Mjc5TDI2NC42MjMgMjguMTM5OUMyNjIuNjI4IDI4LjI5NTggMjYxLjUwMiAyOS4yNTc3IDI2MS41MDIgMzAuNjYxNkMyNjEuNTAyIDMyLjIyMTQgMjYyLjc1NiAzMy4xMzEzIDI2NC41OTcgMzMuMTMxM1oiIGZpbGw9IiMxQzQ5QzIiLz4KPHBhdGggZD0iTTI0NS4wMzcgMzYuOTUyNEMyNDEuNzIyIDM3LjQxNDQgMjM5LjUzNiAzNS43MTc0IDIzOS4wNTYgMzIuMjc0OUwyMzYuODU2IDE2LjQ5MDNMMjMyLjMxNyAxNy4xMjI5QzIzMC4zNTQgMTcuMzk2NiAyMjguNDMxIDE2LjI4NjcgMjI4LjA5IDEzLjgzODdDMjI3Ljc1MiAxMS40MTYyIDIyOS4yOTUgOS43OTc1MiAyMzEuMjU4IDkuNTIzODhMMjUwLjc5MSA2LjgwMTY1QzI1Mi43NTUgNi41MjgwMSAyNTQuNjgxIDcuNjYzMzUgMjU1LjAxOCAxMC4wODU5QzI1NS4zNTkgMTIuNTMzOSAyNTMuODE0IDE0LjEyNyAyNTEuODUgMTQuNDAwN0wyNDcuMzExIDE1LjAzMzNMMjQ5LjUxMSAzMC44MTc4QzI0OS45OTEgMzQuMjYwNCAyNDguMzUyIDM2LjQ5MDQgMjQ1LjAzNyAzNi45NTI0WiIgZmlsbD0iIzFDNDlDMiIvPgo8cGF0aCBkPSJNMjE1LjM0OSAxMDMuNTA0QzIwNy40NjYgMTAzLjUwNCAyMDIuOTY5IDk4LjgzMiAyMDIuOTY5IDkwLjUzOTlWNDkuOTU1NEMyMDIuOTY5IDQyLjA3MjEgMjA3LjM0OSAzNy41NzU3IDIxNC45NCAzNy41NzU3QzIyMi41MzIgMzcuNTc1NyAyMjYuOTExIDQyLjEzMDUgMjI2LjkxMSA1MC4wMTM4TDIyNi44MzYgNTkuNjAyNUMyMjYuODM2IDU5LjYwMjUgMjMxLjgxOSA1Ni42MTI3IDIzOS44NzUgNTUuODUzM0MyNTUuNTI1IDU1Ljg1MzMgMjY1LjUxIDY1LjEzODEgMjY1LjUxIDc5LjY3ODRDMjY1LjUxIDk0LjIxODggMjU1LjUyNSAxMDMuNTA0IDIzOS44NzUgMTAzLjUwNEgyMTUuMzQ5Wk0yMjYuODk3IDg0LjQwNzhDMjI2LjkwNSA4NS41MDY5IDIyNy43OTggODYuMzkzOCAyMjguODk3IDg2LjM5MzhIMjM0LjM4NkMyMzguODgyIDg2LjM5MzggMjQxLjc0MyA4My41MzI1IDI0MS43NDMgNzkuNTAzMkMyNDEuNzQzIDc1LjUzMjQgMjM4Ljg4MiA3Mi42NzEgMjM0LjM4NiA3Mi42NzFDMjI5Ljg4OSA3Mi42NzEgMjI2LjgzNiA3NS41NDgyIDIyNi44MzYgNzUuNTQ4MkwyMjYuODk3IDg0LjQwNzhaIiBmaWxsPSIjMUM0OUMyIi8+CjxwYXRoIGQ9Ik0xNzkuNzIgNzguODg2MkMxNTkuNTI3IDg0LjI5NjkgMTQzLjk1MSA3NS4zNTE4IDEzOC40NSA1NC44MjAzQzEzMy4wMDkgMzQuNTE0NSAxNDIuMDUyIDE4Ljg1MTggMTYyLjA3NiAxMy40ODY1QzE3NS4yNzUgOS45NDk4NiAxODcuMjg4IDEyLjU5NDkgMTk0LjAwOCAyMC41Mjc1QzE5NS41MTEgMjIuMzAxMSAxOTUuOTU2IDIzLjE3NjMgMTk2LjQzOSAyNC45ODEyQzE5Ny4zMjYgMjguMjkyNSAxOTQuNjUyIDMzLjU1NjggMTg5LjQ2MyAzNC45NDczQzE4NS4wNjMgMzYuMTI2MiAxODEuODMxIDM1LjExODIgMTc4LjgyMiAzMi4yMzY3QzE3NC43MzIgMjguMjU0MyAxNzAuODE4IDI3Ljk1NTEgMTY3LjAzOSAyOC45Njc3QzE2MC41NTMgMzAuNzA1NyAxNTcuMzI3IDM4LjY5MDUgMTYwLjA2MyA0OC44OTk4QzE2Mi44MTQgNTkuMTY1NSAxNjkuNTMxIDYxLjgyOTUgMTc1LjAxMiA2MC4zNjA4QzE3OC41IDU5LjQyNjEgMTgxLjQ5IDU2LjM3NDQgMTgzLjQ4MyA1My4zODQ1QzE4Ni40NzMgNDguODk5OCAxODcuNDIyIDQ1LjgwOTIgMTkyLjI3MyA0NC41MDk0QzE5Ny4zNDkgNDMuMTQ5MiAyMDIuNzM4IDQ1LjIxMTYgMjA0LjI1IDUwLjg1MjFDMjA0LjczMyA1Mi42NTcxIDIwNC43OTYgNTQuNjk1OCAyMDQuMTkgNTcuMzk3M0MyMDIuMDEyIDY2Ljg2NzcgMTkyLjE4NiA3NS41NDYxIDE3OS43MiA3OC44ODYyWiIgZmlsbD0iIzFDNDlDMiIvPgo8cGF0aCBkPSJNOTEuODc1MyAxMjAuNDI1QzgxLjg4OTggMTIwLjQyNSA3Ni41MTc0IDExNi41NzEgNzYuNTE3NCAxMDkuNTA1Qzc2LjUxNzQgMTA0LjgzNCA3OS43ODc1IDEwMi4wMzEgODQuOTg0NyAxMDIuMDMxQzg1LjgwMjIgMTAyLjAzMSA4Ni42NzgxIDEwMi4wODkgODcuNDk1NyAxMDIuMDg5Qzg5LjUzOTUgMTAyLjA4OSA5Mi4zNDI0IDEwMS44NTYgOTQuMDM1OSAxMDAuNDU0TDk0LjMyNzkgMTAwLjIyMUw3NS4zNDk1IDQ5LjM1ODdDNzQuNDE1MiA0Ni45MDYxIDczLjg4OTYgNDQuMTAzMiA3My44ODk2IDQyLjAwMUM3My44ODk2IDM1LjYzNTkgNzkuMzIwNCAzMC44NDc1IDg2LjQ0NDYgMzAuODQ3NUM5Mi45ODQ4IDMwLjg0NzUgOTYuMTM4MSAzMy41OTIxIDk4LjA2NTEgNDAuODMzMUwxMDguNDU5IDc5LjYwNzNIMTA4LjkyN0wxMTkuMzIxIDQwLjU5OTVDMTIxLjEzMSAzMy44ODQxIDEyNC43NTIgMzAuODQ3NSAxMzEgMzAuODQ3NUMxMzcuODMyIDMwLjg0NzUgMTQyLjYyIDM1LjI4NTUgMTQyLjYyIDQxLjUzMzhDMTQyLjYyIDQzLjU3NzYgMTQyLjAzNyA0Ni42MTQyIDE0MS4yMTkgNDguODkxNkwxMjUuMjE5IDk0LjY3MzJDMTE4Ljc5NSAxMTMuMDY4IDEwOS4yNzcgMTIwLjQyNSA5MS44NzUzIDEyMC40MjVaIiBmaWxsPSIjMUM0OUMyIi8+CjxwYXRoIGQ9Ik0yNy40Mzg4IDk3LjEzODRDMTkuNjc1MiA5OC41MDczIDE0LjQzNTkgOTQuNjg3NCAxMi45OTYgODYuNTIxM0wyLjM1ODk2IDI2LjE5NTdDMC45MTkwNTIgMTguMDI5NiA0LjUzNTk0IDEyLjY0ODIgMTIuMjk5NSAxMS4yNzkzQzIwLjA2MyA5LjkxMDMzIDI1LjMwMjMgMTMuNzMwMiAyNi43NDIyIDIxLjg5NjNMMjkuOTU5NSA0MC4xNDJDMzAuMTE3NCA0MS4wMzc5IDMxLjI5MjYgNDEuMjc0NiAzMS43ODUxIDQwLjUwOTdMNTEuNDMzMSA5Ljk5MjIzQzU1LjIyOTMgNC4yODI3MSA1Ny43NzYxIDIuNjI5OCA2MS4zOTkxIDEuOTkwOTdDNjcuMTQ5OSAwLjk3Njk0OSA3Mi44Mzc2IDQuODc0MDMgNzMuNzQwMSA5Ljk5MjIzQzc0LjMxODEgMTMuMjcwMiA3My42ODg2IDE1Ljc1MyA3MS40MTQ5IDE5LjAwMDFMNTIuNjc0OSA0My43MDY1QzUxLjk5NDYgNDQuNjAzNSA1Mi4xODgzIDQ1Ljg4NSA1My4xMDM0IDQ2LjU0MDhMODEuMzMxMyA2Ni43NzA4Qzg0LjcwNjggNjkuNDM2OCA4NS4zMjA4IDcxLjYzMzkgODUuODc4NSA3NC43OTY4Qzg3LjA4NTIgODEuNjQwMiA4My4yNzg4IDg3LjI5MjIgNzYuNjA3OSA4OC40Njg1QzcyLjE3OTggODkuMjQ5MyA2OS4zODM2IDg4Ljk1OTIgNjMuODkwNiA4NC43MDk3TDM1LjY4MzkgNjIuNTU5QzM0Ljk2MjIgNjEuOTkyMyAzMy45MjIxIDYyLjYxNTUgMzQuMDgxNSA2My41MTkxTDM3LjM3OTMgODIuMjIxOUMzOC44MTkyIDkwLjM4OCAzNS4yMDIzIDk1Ljc2OTQgMjcuNDM4OCA5Ny4xMzg0WiIgZmlsbD0iIzFDNDlDMiIvPgo8cGF0aCBkPSJNNDU1Ljc3NSAxMjdDNDQ1Ljc4OSAxMjcgNDQwLjQxNyAxMjMuMTQ2IDQ0MC40MTcgMTE2LjA4QzQ0MC40MTcgMTExLjQwOSA0NDMuNjg3IDEwOC42MDYgNDQ4Ljg4NCAxMDguNjA2QzQ0OS43MDIgMTA4LjYwNiA0NTAuNTc4IDEwOC42NjQgNDUxLjM5NSAxMDguNjY0QzQ1My40MzkgMTA4LjY2NCA0NTYuMjQyIDEwOC40MzEgNDU3LjkzNSAxMDcuMDI5TDQ1OC4yMjcgMTA2Ljc5Nkw0MzkuMjQ5IDU1LjkzMzZDNDM4LjMxNSA1My40ODEgNDM3Ljc4OSA1MC42NzggNDM3Ljc4OSA0OC41NzU4QzQzNy43ODkgNDIuMjEwNyA0NDMuMjIgMzcuNDIyNCA0NTAuMzQ0IDM3LjQyMjRDNDU2Ljg4NCAzNy40MjI0IDQ2MC4wMzggNDAuMTY2OSA0NjEuOTY1IDQ3LjQwNzlMNDcyLjM1OSA4Ni4xODIxSDQ3Mi44MjZMNDgzLjIyIDQ3LjE3NDNDNDg1LjAzMSA0MC40NTg5IDQ4OC42NTEgMzcuNDIyNCA0OTQuODk5IDM3LjQyMjRDNTAxLjczMiAzNy40MjI0IDUwNi41MiA0MS44NjA0IDUwNi41MiA0OC4xMDg2QzUwNi41MiA1MC4xNTI1IDUwNS45MzYgNTMuMTg5IDUwNS4xMTggNTUuNDY2NEw0ODkuMTE4IDEwMS4yNDhDNDgyLjY5NSAxMTkuNjQyIDQ3My4xNzYgMTI3IDQ1NS43NzUgMTI3WiIgZmlsbD0iIzFDNDlDMiIvPgo8cGF0aCBkPSJNMzg3Ljc2NiAxMjAuMzIzQzM4MC43NjQgMTIwLjYwMiAzNzUuNjQ5IDExNi44OSAzNzUuMzEyIDEwOC40MjlMMzcyLjc0NiA0NC4wNzFDMzcyLjQwOSAzNS42MTA0IDM3Ny4yMTMgMzEuNTAzNCAzODQuMjE1IDMxLjIyNDNDMzkxLjIxNyAzMC45NDUyIDM5Ni4zOTEgMzQuNjU0NiAzOTYuNzMgNDMuMTczNUwzOTYuNzU2IDQzLjgxNTNMMzk3LjE2NCA0My43OTlDMzk5Ljk0MyAzNS43OTg3IDQwNi41ODMgMzAuODU4OCA0MTUuODYxIDMwLjQ4OUM0MzIuMDgyIDI5Ljg0MjUgNDQxLjUzOSA0MS4zMjkxIDQ0Mi4zODggNjIuNjI2M0M0NDMuMjM1IDgzLjg2NTIgNDM0Ljc4MiA5Ni4xMjQyIDQxOC43OTQgOTYuNzYxNEM0MDkuMjg0IDk3LjE0MDQgNDAyLjEgOTIuODY4MyAzOTguODI1IDg1LjQ2TDM5OC4zNTggODUuNDc4NkwzOTkuMjM0IDEwNy40NzZDMzk5LjU3MiAxMTUuOTM3IDM5NC43NjggMTIwLjA0NCAzODcuNzY2IDEyMC4zMjNaTTQwOC4yNTcgNzguNzEzOUM0MTQuNTU5IDc4LjQ2MjcgNDE4LjI0IDcyLjU4ODggNDE3Ljg4MiA2My42MDMxQzQxNy41MjYgNTQuNjc1OCA0MTMuMzI4IDQ5LjA1NzQgNDA3LjA4NSA0OS4zMDYyQzQwMC44NDIgNDkuNTU1IDM5Ny4xMDQgNTUuNDg5NyAzOTcuNDA0IDY0LjQ3NzdDMzk3LjgyMyA3My41MTk0IDQwMS45NTUgNzguOTY1MSA0MDguMjU3IDc4LjcxMzlaIiBmaWxsPSIjMUM0OUMyIi8+CjxwYXRoIGQ9Ik0zMTYuMTk1IDEwMi45NzZDMzA5Ljc1NCAxMDQuMTEyIDMwMy45ODcgMTAwLjMyNiAzMDIuOTMyIDk0LjM0NUMzMDIuMzg1IDkxLjIzOTYgMzAyLjgzOCA4OC40MzIgMzA0LjgwOCA4NC40Njc3TDMxOC4zOTkgNjAuODUwOUMzMTkuMzc4IDU5LjE0OTEgMzE4Ljk3OCA1Ni45ODggMzE3LjQ1MyA1NS43NTA0TDI5Ny43NTQgMzkuNzU3M0MyOTQuMTUyIDM2LjQ3ODkgMjkyLjc0NSAzMy44ODA4IDI5Mi4xNTcgMzAuNTQ1M0MyOTAuOTcxIDIzLjgxNjkgMjk1LjI0NyAxOC4xNDEzIDMwMi4zNzggMTYuODgzOUMzMDYuOTIxIDE2LjA4MjggMzEwLjgxNSAxNy42NDk2IDMxNC40MDMgMjEuNTIzM0wzMzAuNDIzIDM5LjExMTdDMzMxLjQxMyA0MC4xOTg2IDMzMy4xOTggMzkuODgxOSAzMzMuNzUzIDM4LjUyMDhMMzQzLjEyIDE1LjU3MDNDMzQ1LjAwOCAxMS4xNDYgMzQ3LjExOSA4Ljk5NDg1IDM1MS44MzUgOC4xNjMzNUMzNTguMTYxIDcuMDQ3OTMgMzY0LjQ4MyAxMC42MTc2IDM2NS41MDcgMTYuNDI1OUMzNjYuMDk1IDE5Ljc2MTMgMzY1LjY0MSAyMi41Njg5IDM2My43MTYgMjYuMTEwNEwzNDkuMzIyIDQ5LjQ2ODZDMzQ4LjI3OSA1MS4xNjA5IDM0OC42MzcgNTMuMzYyMiAzNTAuMTYyIDU0LjYzNjdMMzcxLjMzMSA3Mi4zMjI5QzM3NC40MjkgNzUuMDk3MSAzNzUuODkzIDc3LjY4NTEgMzc2LjQ5MiA4MS4wNzgxQzM3Ny42MjcgODcuNTE5IDM3My43NiA5Mi44MjU5IDM2Ny4wMzIgOTQuMDEyM0MzNjIuNjA0IDk0Ljc5MzEgMzU5LjI5OSA5My41Mzc3IDM1NS4zODUgODkuODM5OEwzMzguNjQ2IDczLjk3MjNDMzM3LjY2MyA3My4wNDEzIDMzNi4wNTkgNzMuMzM0MiAzMzUuNDcgNzQuNTUyMkwzMjUuMzYgOTUuNDMwNkMzMjMuMjE0IDEwMC4wNzggMzIwLjc5NSAxMDIuMTY1IDMxNi4xOTUgMTAyLjk3NloiIGZpbGw9IiMxQzQ5QzIiLz4KPHBhdGggZD0iTTU4MS4xNTEgMTAzLjc5MkM1NzMuMjY3IDEwMy43OTIgNTY4Ljc3MSA5OS4xMjAzIDU2OC43NzEgOTAuODI4MlY1MC4yNDM3QzU2OC43NzEgNDIuMzYwNCA1NzMuMTUxIDM3Ljg2NCA1ODAuNzQyIDM3Ljg2NEM1ODguMzMzIDM3Ljg2NCA1OTIuNzEzIDQyLjQxODggNTkyLjcxMyA1MC4zMDIxTDU5Mi42MzcgNTkuODkwOEM1OTIuNjM3IDU5Ljg5MDggNTk3LjYyIDU2LjkwMSA2MDUuNjc3IDU2LjE0MTZDNjIxLjMyNiA1Ni4xNDE2IDYzMS4zMTIgNjUuNDI2NCA2MzEuMzEyIDc5Ljk2NjhDNjMxLjMxMiA5NC41MDcxIDYyMS4zMjYgMTAzLjc5MiA2MDUuNjc3IDEwMy43OTJINTgxLjE1MVpNNTkyLjY5OSA4NC42OTYxQzU5Mi43MDcgODUuNzk1MiA1OTMuNiA4Ni42ODIyIDU5NC42OTkgODYuNjgyMkg2MDAuMTg3QzYwNC42ODQgODYuNjgyMiA2MDcuNTQ1IDgzLjgyMDggNjA3LjU0NSA3OS43OTE2QzYwNy41NDUgNzUuODIwNyA2MDQuNjg0IDcyLjk1OTQgNjAwLjE4NyA3Mi45NTk0QzU5NS42OTEgNzIuOTU5NCA1OTIuNjM3IDc1LjgzNjUgNTkyLjYzNyA3NS44MzY1TDU5Mi42OTkgODQuNjk2MVoiIGZpbGw9IiMxQzQ5QzIiLz4KPHBhdGggZD0iTTU0NS41MjMgODUuNDk0NkM1MjUuMzMgOTAuOTA1MyA1MDkuNzU0IDgxLjk2MDIgNTA0LjI1MiA2MS40Mjg3QzQ5OC44MTEgNDEuMTIyOSA1MDcuODU0IDI1LjQ2MDIgNTI3Ljg3OCAyMC4wOTQ5QzU0MS4wNzcgMTYuNTU4MyA1NTMuMDkxIDE5LjIwMzMgNTU5LjgxMSAyNy4xMzU5QzU2MS4zMTQgMjguOTA5NSA1NjEuNzU4IDI5Ljc4NDcgNTYyLjI0MSAzMS41ODk2QzU2My4xMjkgMzQuOTAwOSA1NjAuNDU0IDQwLjE2NTIgNTU1LjI2NSA0MS41NTU3QzU1MC44NjYgNDIuNzM0NiA1NDcuNjMzIDQxLjcyNjYgNTQ0LjYyNCAzOC44NDUxQzU0MC41MzQgMzQuODYyNyA1MzYuNjIxIDM0LjU2MzUgNTMyLjg0MiAzNS41NzYxQzUyNi4zNTUgMzcuMzE0MSA1MjMuMTMgNDUuMjk4OSA1MjUuODY1IDU1LjUwODJDNTI4LjYxNiA2NS43NzM5IDUzNS4zMzMgNjguNDM3OSA1NDAuODE0IDY2Ljk2OTJDNTQ0LjMwMyA2Ni4wMzQ1IDU0Ny4yOTIgNjIuOTgyOCA1NDkuMjg2IDU5Ljk5MjlDNTUyLjI3NSA1NS41MDgyIDU1My4yMjQgNTIuNDE3NiA1NTguMDc1IDUxLjExNzhDNTYzLjE1MiA0OS43NTc2IDU2OC41NDEgNTEuODIgNTcwLjA1MiA1Ny40NjA1QzU3MC41MzYgNTkuMjY1NSA1NzAuNTk4IDYxLjMwNDIgNTY5Ljk5MiA2NC4wMDU3QzU2Ny44MTQgNzMuNDc2MSA1NTcuOTg4IDgyLjE1NDUgNTQ1LjUyMyA4NS40OTQ2WiIgZmlsbD0iIzFDNDlDMiIvPgo8L3N2Zz4K" alt="Кусь та Хрусь">
      <main class="card">
        <section>
          <h1 id="authTitle">Sign in</h1>
          <form id="authForm" novalidate>
            <label class="field" for="email">
              <span class="field-label">Email Address <span class="required" aria-hidden="true">*</span></span>
              <input id="email" type="email" autocomplete="email" required>
            </label>
            <div id="emailError" class="error" role="alert"></div>
            <label class="field" for="password">
              <span class="field-label">Password <span class="required" aria-hidden="true">*</span></span>
              <input id="password" type="password" autocomplete="current-password" required>
            </label>
            <div id="authError" class="error" role="alert"></div>
            <button id="authSubmit" class="primary" type="submit">Continue</button>
          </form>
          <div class="divider">or</div>
          <div class="providers">
            <button class="provider" data-provider="Google" type="button">
              <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTgiIGhlaWdodD0iMTgiIHZpZXdCb3g9IjAgMCAxOCAxOCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBmaWxsPSIjNDI4NUY0IiBkPSJNMTcuNjQgOS4yMDU1YzAtLjYzODItLjA1NzMtMS4yNTE4LS4xNjM2LTEuODQwOUg5djMuNDgxOGg0Ljg0MzZjLS4yMDg2IDEuMTI1LS44NDI3IDIuMDc4Mi0xLjc5NjMgMi43MTYzdjIuMjU4MmgyLjkwODJjMS43MDI3LTEuNTY3MyAyLjY4NDUtMy44NzQxIDIuNjg0NS02LjYxNTRaIi8+PHBhdGggZmlsbD0iIzM0QTg1MyIgZD0iTTkgMThjMi40MyAwIDQuNDY3My0uODA1OSA1Ljk1NTUtMi4xNzkxbC0yLjkwODItMi4yNTgyYy0uODA1OS41NC0xLjgzNjguODU5MS0zLjA0NzMuODU5MS0yLjM0NDEgMC00LjMyODYtMS41ODQ1LTUuMDM3My0zLjcxMDRILjk1NTV2Mi4zMzI3QzIuNDM1NSAxNS45ODMyIDUuNDc2NCAxOCA5IDE4WiIvPjxwYXRoIGZpbGw9IiNGQkJDMDUiIGQ9Ik0zLjk2MjcgMTAuNzExNEE1LjQwOSA1LjQwOSAwIDAgMSAzLjY4MTggOWMwLS41OTMyLjEwMTgtMS4xNjk1LjI4MDktMS43MTE0VjQuOTU2OEguOTU1NUE5LjAwMDYgOS4wMDA2IDAgMCAwIDAgOWMwIDEuNDUyMy4zNDc3IDIuODI2OC45NTU1IDQuMDQzMmwzLjAwNzItMi4zMzE4WiIvPjxwYXRoIGZpbGw9IiNFQTQzMzUiIGQ9Ik05IDMuNTc4MmMxLjMyMTQgMCAyLjUwNzcuNDU0MSAzLjQ0MTggMS4zNDU5bDIuNTgxNC0yLjU4MTRDMTMuNDYzNi44OTE4IDExLjQyNjQgMCA5IDAgNS40NzY0IDAgMi40MzU1IDIuMDE2OC45NTU1IDQuOTU2OGwzLjAwNzMgMi4zMzI3QzQuNjcxNCA1LjE2MjcgNi42NTU5IDMuNTc4MiA5IDMuNTc4MloiLz48L3N2Zz4=" alt="" aria-hidden="true">
              <span>Continue With Google</span>
            </button>
            <button class="provider" data-provider="Facebook" type="button">
              <img src="data:image/svg+xml;base64,PHN2ZyByb2xlPSJpbWciIHZpZXdCb3g9IjAgMCAyNCAyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8dGl0bGU+RmFjZWJvb2s8L3RpdGxlPgogIDxwYXRoIGZpbGw9IiMwODY2RkYiIGQ9Ik05LjEwMSAyMy42OTF2LTcuOThINi42Mjd2LTMuNjY3aDIuNDc0di0xLjU4YzAtNC4wODUgMS44NDgtNS45NzggNS44NTgtNS45NzguNDAxIDAgLjk1NS4wNDIgMS40NjguMTAzYTguNjggOC42OCAwIDAgMSAxLjE0MS4xOTV2My4zMjVhOC42MjMgOC42MjMgMCAwIDAtLjY1My0uMDM2IDI2LjgwNSAyNi44MDUgMCAwIDAtLjczMy0uMDA5Yy0uNzA3IDAtMS4yNTkuMDk2LTEuNjc1LjMwOWExLjY4NiAxLjY4NiAwIDAgMC0uNjc5LjYyMmMtLjI1OC40Mi0uMzc0Ljk5NS0uMzc0IDEuNzUydjEuMjk3aDMuOTE5bC0uMzg2IDIuMTAzLS4yODcgMS41NjRoLTMuMjQ2djguMjQ1QzE5LjM5NiAyMy4yMzggMjQgMTguMTc5IDI0IDEyLjA0NGMwLTYuNjI3LTUuMzczLTEyLTEyLTEycy0xMiA1LjM3My0xMiAxMmMwIDUuNjI4IDMuODc0IDEwLjM1IDkuMTAxIDExLjY0N1oiLz4KPC9zdmc+Cg==" alt="" aria-hidden="true">
              <span>Continue With Facebook</span>
            </button>
          </div>
        </section>
      </main>
      <p class="mode-row">
        <span id="modePrompt">Don't have an account?</span>
        <button id="toggleMode" class="text-button" type="button">Sign up</button>
      </p>
    </div>
    <footer class="footer">
      <div><strong>Questions?</strong> We're here to help.</div>
      <div class="footer-meta">© 2026, Кусь та Хрусь &nbsp;·&nbsp; Terms of Use &nbsp;·&nbsp; Privacy Policy</div>
    </footer>
  </div>
  <script>
    const suffix = '/oauth2/authorize';
    const base = location.pathname.slice(0, -suffix.length);
    const email = document.getElementById('email');
    const emailError = document.getElementById('emailError');
    const authError = document.getElementById('authError');
    const password = document.getElementById('password');
    const authTitle = document.getElementById('authTitle');
    const modePrompt = document.getElementById('modePrompt');
    const toggleMode = document.getElementById('toggleMode');
    let mode = 'sign-in';

    function setError(input, output, message) {
      output.textContent = message;
      input.setAttribute('aria-invalid', message ? 'true' : 'false');
    }

    function validateEmail() {
      const value = email.value.trim();
      if (!value) {
        setError(email, emailError, 'Email address is required.');
        email.focus();
        return false;
      }
      if (!email.validity.valid) {
        setError(email, emailError, 'Enter a valid email address.');
        email.focus();
        return false;
      }
      setError(email, emailError, '');
      return true;
    }

    function setMode(nextMode) {
      mode = nextMode;
      const signUp = mode === 'sign-up';
      password.autocomplete = signUp ? 'new-password' : 'current-password';
      authTitle.textContent = signUp ? 'Create account' : 'Sign in';
      modePrompt.textContent = signUp ? 'Already have an account?' : "Don't have an account?";
      toggleMode.textContent = signUp ? 'Sign in' : 'Sign up';
      setError(password, authError, '');
      email.focus();
    }

    toggleMode.addEventListener('click', () => {
      setMode(mode === 'sign-in' ? 'sign-up' : 'sign-in');
    });

    document.querySelectorAll('[data-provider]').forEach((button) => {
      button.addEventListener('click', () => {
        authError.textContent = button.dataset.provider + ' sign-in is not available in the mock server.';
      });
    });

    document.getElementById('authForm').addEventListener('submit', async (event) => {
      event.preventDefault();
      if (!validateEmail()) return;
      const passwordValue = password.value;
      if (!passwordValue) {
        setError(password, authError, 'Password is required.');
        password.focus();
        return;
      }
      if (mode === 'sign-up' && passwordValue.length < 10) {
        setError(password, authError, 'Password must contain at least 10 characters.');
        password.focus();
        return;
      }
      setError(password, authError, '');
      const input = {
        email: email.value.trim(),
        password: passwordValue,
        rememberMe: true,
      };
      if (mode === 'sign-up') input.name = email.value.trim().split('@')[0] || 'Customer';
      try {
        const response = await fetch(base + '/' + mode + '/email', {
          method: 'POST',
          credentials: 'same-origin',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(input),
        });
        const body = await response.json();
        if (!response.ok) {
          setError(password, authError, body.error_description || body.error || 'Authentication failed');
          return;
        }
        location.reload();
      } catch (requestError) {
        setError(password, authError, String(requestError));
      }
    });

    email.addEventListener('input', () => setError(email, emailError, ''));
    password.addEventListener('input', () => setError(password, authError, ''));

    function cancelAuthorization() {
      const query = new URLSearchParams(location.search);
      const redirectUri = query.get('redirect_uri');
      if (!redirectUri) return;
      const redirect = new URL(redirectUri);
      redirect.searchParams.set('error', 'access_denied');
      if (query.has('state')) redirect.searchParams.set('state', query.get('state'));
      location.assign(redirect);
    }

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') cancelAuthorization();
    });
  </script>
</body>
</html>`;
