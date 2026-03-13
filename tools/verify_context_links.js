#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');

function printHelp() {
  console.log(`Usage:
  node tools/verify_context_links.js [--file context/next_context_sync.md] [--window 20] [--strict] [--json]

Checks code-map references in next_context_sync-style files:
  Class.method() @ path/to/file:line -> summary
`);
}

function parseArgs(argv) {
  const options = {
    file: path.join(rootDir, 'context', 'next_context_sync.md'),
    window: 20,
    strict: false,
    json: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--file') {
      options.file = path.resolve(rootDir, argv[i + 1]);
      i += 1;
    } else if (arg === '--window') {
      options.window = Number.parseInt(argv[i + 1], 10);
      i += 1;
    } else if (arg === '--strict') {
      options.strict = true;
    } else if (arg === '--json') {
      options.json = true;
    } else if (arg === '--help' || arg === '-h') {
      printHelp();
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  if (!Number.isInteger(options.window) || options.window < 0) {
    throw new Error('--window must be a non-negative integer');
  }

  return options;
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function parseSymbol(rawSymbol) {
  const symbol = rawSymbol.trim();
  const symbolNoParens = symbol.replace(/\(\)$/, '');
  const dotIndex = symbolNoParens.indexOf('.');
  if (dotIndex === -1) {
    return { raw: symbol, className: symbolNoParens, memberName: null };
  }

  return {
    raw: symbol,
    className: symbolNoParens.slice(0, dotIndex),
    memberName: symbolNoParens.slice(dotIndex + 1),
  };
}

function extractEntries(markdownText) {
  const lines = markdownText.split(/\r?\n/);
  const pattern = /`?([^`@]+?)\s*@\s*([^:\s`][^:`]*?):(\d+)\s*->/;

  return lines.flatMap((line, index) => {
    const match = line.match(pattern);
    if (!match) {
      return [];
    }
    return [{
      markdownLine: index + 1,
      rawSymbol: match[1].trim(),
      relativePath: match[2].trim(),
      targetLine: Number.parseInt(match[3], 10),
    }];
  });
}

function verifyEntry(entry, windowRadius) {
  const absolutePath = path.resolve(rootDir, entry.relativePath);
  if (!fs.existsSync(absolutePath)) {
    return { ...entry, status: 'FAIL', reason: 'missing file' };
  }

  const fileLines = fs.readFileSync(absolutePath, 'utf8').split(/\r?\n/);
  if (entry.targetLine < 1 || entry.targetLine > fileLines.length) {
    return {
      ...entry,
      status: 'FAIL',
      reason: `line ${entry.targetLine} outside file length ${fileLines.length}`,
    };
  }

  const symbol = parseSymbol(entry.rawSymbol);
  const start = Math.max(0, entry.targetLine - 1 - windowRadius);
  const end = Math.min(fileLines.length, entry.targetLine - 1 + windowRadius + 1);
  const nearbyText = fileLines.slice(start, end).join('\n');

  const rawPattern = new RegExp(`\\b${escapeRegExp(symbol.raw.replace(/\(\)$/, ''))}\\b`);
  const classPattern = new RegExp(
    `\\b(?:class|interface|object|data\\s+class|sealed\\s+class|enum\\s+class)\\s+${escapeRegExp(symbol.className)}\\b`,
  );
  const memberPattern = symbol.memberName
    ? new RegExp(`\\b${escapeRegExp(symbol.memberName)}\\s*\\(`)
    : null;

  const foundMember = memberPattern ? memberPattern.test(nearbyText) : false;
  const foundClass = classPattern.test(nearbyText);
  const foundRaw = rawPattern.test(nearbyText);

  if (foundMember || (foundClass && !symbol.memberName) || foundRaw) {
    return {
      ...entry,
      status: 'OK',
      reason: foundMember ? 'member found nearby' : foundClass ? 'class found nearby' : 'raw symbol found nearby',
    };
  }

  return {
    ...entry,
    status: 'WARN',
    reason: `symbol not found within ±${windowRadius} lines`,
  };
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  if (!fs.existsSync(options.file)) {
    throw new Error(`Missing context file: ${options.file}`);
  }

  const markdown = fs.readFileSync(options.file, 'utf8');
  const results = extractEntries(markdown).map((entry) => verifyEntry(entry, options.window));

  if (options.json) {
    console.log(JSON.stringify({ file: options.file, results }, null, 2));
  } else {
    console.log(`[context-lint] file: ${path.relative(rootDir, options.file)}`);
    if (results.length === 0) {
      console.log('[context-lint] no references matched the code-map pattern');
    }
    for (const result of results) {
      console.log(
        `${result.status.padEnd(4)} ${result.rawSymbol} @ ${result.relativePath}:${result.targetLine} (${result.reason}; markdown line ${result.markdownLine})`,
      );
    }
  }

  const hasFail = results.some((result) => result.status === 'FAIL');
  const hasWarn = results.some((result) => result.status === 'WARN');
  if (hasFail || (options.strict && hasWarn)) {
    process.exit(1);
  }
}

try {
  main();
} catch (error) {
  console.error(`[context-lint] failed: ${error.message}`);
  process.exit(1);
}
