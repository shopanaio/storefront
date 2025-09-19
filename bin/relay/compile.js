#!/usr/bin/env node
import "dotenv/config";
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
//import { rimrafSync } from "rimraf";

const cms = (process.env.CMS || "").toLowerCase();

if (!cms) {
  console.error("CMS env variable is not set.");
  process.exit(1);
}

const rootDir = process.cwd();
const configPath = path.resolve(rootDir, `relay.${cms}.json`);

if (!fs.existsSync(configPath)) {
  console.error(`Relay config file not found for CMS=${cms} at ${configPath}`);
  process.exit(1);
}

try {
  // Clean previous Relay artifacts
  //rimrafSync("src/**/__generated__", { glob: { cwd: rootDir } });
  // relay-compiler <configPath>
  execSync(`relay-compiler ${configPath}`, { stdio: "inherit" });
} catch (err) {
  if (err && typeof err === "object" && "status" in err && err.status != null) {
    process.exit(err.status);
  }
  console.error(err);
  process.exit(1);
}
