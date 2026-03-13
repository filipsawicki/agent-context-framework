#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');

function printHelp() {
  console.log(`Usage:
  node tools/verify_project_map.js [--file context/project_map.md] [--json]

Validates path references stored in context/project_map.md.
`);
}

function parseArgs(argv) {
  const options = {
    file: path.join(rootDir, 'context', 'project_map.md'),
    json: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--file') {
      options.file = path.resolve(rootDir, argv[i + 1]);
      i += 1;
    } else if (arg === '--json') {
      options.json = true;
    } else if (arg === '--help' || arg === '-h') {
      printHelp();
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return options;
}

function extractPathEntries(markdown) {
  const lines = markdown.split(/\r?\n/);
  const seen = new Set();
  const results = [];

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const matches = [...line.matchAll(/`([^`\n]+)`/g)];

    for (const match of matches) {
      const rawValue = match[1].trim();
      if (!rawValue || rawValue.includes(' ') || seen.has(rawValue)) {
        continue;
      }
      if (!rawValue.includes('/') && !rawValue.includes('.')) {
        continue;
      }

      seen.add(rawValue);
      results.push({
        markdownLine: index + 1,
        relativePath: rawValue,
      });
    }
  }

  return results;
}

function verifyEntry(entry) {
  const absolutePath = path.resolve(rootDir, entry.relativePath.replace(/\/$/, ''));
  const relative = path.relative(rootDir, absolutePath);

  if (relative.startsWith('..')) {
    return { ...entry, status: 'FAIL', reason: 'path escapes repository root' };
  }

  if (!fs.existsSync(absolutePath)) {
    return { ...entry, status: 'FAIL', reason: 'missing path' };
  }

  const stats = fs.statSync(absolutePath);
  return {
    ...entry,
    status: 'OK',
    reason: stats.isDirectory() ? 'directory exists' : 'file exists',
  };
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  if (!fs.existsSync(options.file)) {
    throw new Error(`Missing project map file: ${options.file}`);
  }

  const markdown = fs.readFileSync(options.file, 'utf8');
  const entries = extractPathEntries(markdown);
  const results = entries.map(verifyEntry);

  if (options.json) {
    console.log(JSON.stringify({ file: options.file, results }, null, 2));
  } else {
    console.log(`[project-map] file: ${path.relative(rootDir, options.file)}`);
    if (results.length === 0) {
      console.log('[project-map] WARN no path references found');
    }
    for (const result of results) {
      console.log(
        `${result.status.padEnd(4)} ${result.relativePath} (${result.reason}; markdown line ${result.markdownLine})`,
      );
    }
  }

  const hasFail = results.some((result) => result.status === 'FAIL');
  if (hasFail) {
    process.exit(1);
  }
}

try {
  main();
} catch (error) {
  console.error(`[project-map] failed: ${error.message}`);
  process.exit(1);
}
