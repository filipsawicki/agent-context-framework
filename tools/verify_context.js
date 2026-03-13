#!/usr/bin/env node
const path = require('path');
const { spawnSync } = require('child_process');

const rootDir = path.resolve(__dirname, '..');
const validators = [
  path.join(rootDir, 'tools', 'verify_context_links.js'),
  path.join(rootDir, 'tools', 'verify_project_map.js'),
];

function printHelp() {
  console.log(`Usage:
  node tools/verify_context.js

Runs the context-link validator and the project-map validator.
`);
}

if (process.argv.includes('--help') || process.argv.includes('-h')) {
  printHelp();
  process.exit(0);
}

for (const validator of validators) {
  const result = spawnSync(process.execPath, [validator], { stdio: 'inherit' });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}
