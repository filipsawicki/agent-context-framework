#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const rootDir = path.resolve(__dirname, '..');

function printHelp() {
  console.log(`Usage:
  node tools/run_next_verification.js [--file context/next_context_sync.md]

Reads the "Verification command" from next_context_sync.md and runs it.
`);
}

function parseArgs(argv) {
  const options = {
    file: path.join(rootDir, 'context', 'next_context_sync.md'),
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--file') {
      options.file = path.resolve(rootDir, argv[index + 1]);
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
  if (!fs.existsSync(options.file)) {
    throw new Error(`Missing context file: ${options.file}`);
  }

  const markdown = fs.readFileSync(options.file, 'utf8');
  const match = markdown.match(/- Verification command:\s*(.+)/);
  if (!match) {
    throw new Error('Missing "Verification command" line');
  }

  const command = match[1].trim();
  if (
    command.length === 0
    || /replace with/i.test(command)
    || command === 'unknown'
  ) {
    throw new Error(`Verification command is not ready: ${command}`);
  }

  console.log(`[context-verify-run] running: ${command}`);
  const result = spawnSync('bash', ['-lc', command], {
    cwd: rootDir,
    stdio: 'inherit',
  });

  process.exit(result.status ?? 1);
}

try {
  main();
} catch (error) {
  console.error(`[context-verify-run] failed: ${error.message}`);
  process.exit(1);
}
