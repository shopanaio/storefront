import { spawn } from "node:child_process";

const mockHost = process.env.MOCK_SERVER_HOST ?? "127.0.0.1";
const mockPort = process.env.MOCK_SERVER_PORT ?? "4100";
const mockGraphqlUrl = `http://${mockHost}:${mockPort}/graphql`;

const developmentEnv = {
  ...process.env,
  CMS: "shopana",
  SHOPANA_GRAPHQL_URL: mockGraphqlUrl,
  SHOPANA_API_KEY: process.env.MOCK_SERVER_API_KEY ?? "mock",
};

const processes = [
  spawn(process.execPath, ["--watch", "mockServer/src/server.js"], {
    env: {
      ...developmentEnv,
      HOST: mockHost,
      PORT: mockPort,
    },
    stdio: "inherit",
  }),
  spawn("yarn", ["dev:next"], {
    env: developmentEnv,
    stdio: "inherit",
  }),
];

let shuttingDown = false;

function shutdown(signal, exitCode = 0) {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;
  for (const child of processes) {
    if (!child.killed) {
      child.kill(signal);
    }
  }

  process.exitCode = exitCode;
}

for (const child of processes) {
  child.on("error", (error) => {
    console.error(error);
    shutdown("SIGTERM", 1);
  });

  child.on("exit", (code, signal) => {
    if (!shuttingDown) {
      shutdown("SIGTERM", code ?? (signal ? 1 : 0));
    }
  });
}

process.once("SIGINT", () => shutdown("SIGINT"));
process.once("SIGTERM", () => shutdown("SIGTERM"));

console.log(`Local GraphQL endpoint: ${mockGraphqlUrl}`);
