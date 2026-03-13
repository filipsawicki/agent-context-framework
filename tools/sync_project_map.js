#!/usr/bin/env node
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const rootDir = path.resolve(__dirname, '..');

function printHelp() {
  console.log(`Usage:
  node tools/sync_project_map.js [--root /path/to/repo] [--out context/project_map.generated.md]

Generates a fresh project-map draft without overwriting the manually maintained context/project_map.md file.
Use the generated file as a review aid when the repository structure changes.
`);
}

function parseArgs(argv) {
  const options = {
    root: rootDir,
    out: path.join(rootDir, 'context', 'project_map.generated.md'),
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--root') {
      options.root = path.resolve(argv[index + 1]);
      index += 1;
    } else if (arg === '--out') {
      options.out = path.resolve(argv[index + 1]);
      index += 1;
    } else if (arg === '--help' || arg === '-h') {
      printHelp();
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return options;
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  const tempFile = path.join(os.tmpdir(), `acf-project-map-${Date.now()}.md`);
  const generator = path.join(rootDir, 'tools', 'generate_project_map.js');
  const generateResult = spawnSync(process.execPath, [generator, '--root', options.root, '--out', tempFile], {
    cwd: rootDir,
    encoding: 'utf8',
  });

  if (generateResult.status !== 0) {
    if (generateResult.stdout) {
      process.stdout.write(generateResult.stdout);
    }
    if (generateResult.stderr) {
      process.stderr.write(generateResult.stderr);
    }
    process.exit(generateResult.status ?? 1);
  }

  const generated = fs.readFileSync(tempFile, 'utf8');
  fs.mkdirSync(path.dirname(options.out), { recursive: true });
  fs.writeFileSync(options.out, generated, 'utf8');
  fs.unlinkSync(tempFile);

  const relativeOut = path.relative(options.root, options.out).split(path.sep).join('/');
  console.log(`[project-map-sync] wrote ${relativeOut}`);
  console.log('[project-map-sync] review the generated draft and manually merge useful updates into context/project_map.md');
}

try {
  main();
} catch (error) {
  console.error(`[project-map-sync] failed: ${error.message}`);
  process.exit(1);
}
