import { cp, mkdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const standaloneDir = path.join(projectRoot, ".next", "standalone");

async function exists(filePath) {
  try {
    await stat(filePath);
    return true;
  } catch (error) {
    if (error?.code === "ENOENT") {
      return false;
    }

    throw error;
  }
}

if (!(await exists(standaloneDir))) {
  throw new Error(
    'Missing .next/standalone. Run "next build" with output: "standalone" first.'
  );
}

const assets = [
  {
    from: path.join(projectRoot, ".next", "static"),
    to: path.join(standaloneDir, ".next", "static"),
    required: true,
  },
  {
    from: path.join(projectRoot, "public"),
    to: path.join(standaloneDir, "public"),
    required: false,
  },
];

const nativePackages = [
  {
    from: path.join(projectRoot, "node_modules", "@img"),
    to: path.join(standaloneDir, "node_modules", "@img"),
    required: false,
  },
];

for (const asset of [...assets, ...nativePackages]) {
  if (!(await exists(asset.from))) {
    if (asset.required) {
      throw new Error(`Missing required build asset: ${asset.from}`);
    }

    continue;
  }

  await mkdir(path.dirname(asset.to), { recursive: true });
  await cp(asset.from, asset.to, { recursive: true, force: true });
  console.log(
    `Copied ${path.relative(projectRoot, asset.from)} -> ${path.relative(
      projectRoot,
      asset.to
    )}`
  );
}
