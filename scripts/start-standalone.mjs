import { spawn } from "node:child_process";
import { stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const serverPath = path.join(projectRoot, ".next", "standalone", "server.js");

try {
  await stat(serverPath);
} catch (error) {
  if (error?.code === "ENOENT") {
    console.error('Missing standalone server. Run "npm run build" first.');
    process.exit(1);
  }

  throw error;
}

const env = {
  ...process.env,
  NODE_ENV: process.env.NODE_ENV || "production",
  PORT: process.env.PORT || "3000",
};

const child = spawn(process.execPath, [serverPath], {
  cwd: projectRoot,
  env,
  stdio: "inherit",
});

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => {
    child.kill(signal);
  });
}

child.on("exit", (code) => {
  process.exit(code ?? 0);
});
