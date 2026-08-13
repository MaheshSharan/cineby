import { spawn } from "node:child_process";

import { runAuthChecks } from "./smoke-auth";

const PORT = 3001;
const BASE_URL = `http://localhost:${PORT}`;

async function waitForServer(url: string, timeoutMs: number): Promise<void> {
  const deadline = Date.now() + timeoutMs;

  while (true) {
    try {
      await fetch(url);
      return;
    } catch {
      if (Date.now() > deadline) {
        throw new Error(`Server did not become ready within ${timeoutMs}ms`);
      }

      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }
}

async function main() {
  const server = spawn("bun", ["run", "start", "--", "-p", String(PORT)], {
    cwd: process.cwd(),
    stdio: "inherit",
  });

  let exitCode = 0;

  try {
    await waitForServer(`${BASE_URL}/api/auth/me`, 30_000);
    console.log(`\nServer ready at ${BASE_URL}\n`);
    await runAuthChecks(BASE_URL);

    if (process.exitCode === 1) {
      exitCode = 1;
    }
  } catch (error) {
    console.error(error);
    exitCode = 1;
  } finally {
    server.kill();
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  process.exit(exitCode);
}

main();