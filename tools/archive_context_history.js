#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');

function printHelp() {
  console.log(`Usage:
  node tools/archive_context_history.js [--file context/context_change_history.md] [--archive-dir context/archive] [--keep-latest 100] [--dry-run]

Archives older entries from context_change_history.md into a timestamped file and keeps only the latest entries in the main file.
The script assumes entries are stored in chronological order and new entries are appended to the end of the file.
`);
}

function parseArgs(argv) {
  const options = {
    file: path.join(rootDir, 'context', 'context_change_history.md'),
    archiveDir: path.join(rootDir, 'context', 'archive'),
    keepLatest: 100,
    dryRun: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--file') {
      options.file = path.resolve(rootDir, argv[index + 1]);
      index += 1;
    } else if (arg === '--archive-dir') {
      options.archiveDir = path.resolve(rootDir, argv[index + 1]);
      index += 1;
    } else if (arg === '--keep-latest') {
      options.keepLatest = Number.parseInt(argv[index + 1], 10);
      index += 1;
    } else if (arg === '--dry-run') {
      options.dryRun = true;
    } else if (arg === '--help' || arg === '-h') {
      printHelp();
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  if (!Number.isInteger(options.keepLatest) || options.keepLatest < 1) {
    throw new Error('--keep-latest must be a positive integer');
  }

  return options;
}

function timestampForFilename() {
  const now = new Date();
  const parts = [
    now.getUTCFullYear(),
    String(now.getUTCMonth() + 1).padStart(2, '0'),
    String(now.getUTCDate()).padStart(2, '0'),
    String(now.getUTCHours()).padStart(2, '0'),
    String(now.getUTCMinutes()).padStart(2, '0'),
    String(now.getUTCSeconds()).padStart(2, '0'),
  ];
  return `${parts[0]}${parts[1]}${parts[2]}_${parts[3]}${parts[4]}${parts[5]}Z`;
}

function parseHistoryFile(markdown) {
  const lines = markdown.split(/\r?\n/);
  const entriesHeaderIndex = lines.findIndex((line) => line.trim() === '## Entries');

  if (entriesHeaderIndex === -1) {
    throw new Error('Missing "## Entries" section');
  }

  const prefix = lines.slice(0, entriesHeaderIndex + 1);
  const remaining = lines.slice(entriesHeaderIndex + 1);
  const entries = [];
  const suffix = [];
  let inEntries = true;

  for (const line of remaining) {
    if (inEntries && line.startsWith('- ')) {
      entries.push(line);
      continue;
    }

    if (inEntries && line.trim() === '') {
      continue;
    }

    inEntries = false;
    suffix.push(line);
  }

  return { prefix, entries, suffix };
}

function archiveNotice(archiveRelativePath, archivedCount, keepLatest) {
  return [
    '## Archive Notes',
    `- Older history entries are archived in \`${archiveRelativePath}\`.`,
    `- This file keeps the latest ${keepLatest} entries after archiving ${archivedCount} older entries.`,
  ];
}

function stripPreviousArchiveNotes(lines) {
  const cleaned = [];
  let skipping = false;

  for (const line of lines) {
    if (line.trim() === '## Archive Notes') {
      skipping = true;
      continue;
    }

    if (skipping) {
      if (line.startsWith('## ')) {
        skipping = false;
        cleaned.push(line);
      } else {
        continue;
      }
    } else {
      cleaned.push(line);
    }
  }

  return cleaned;
}

function renderHistoryFile(prefix, entries, suffix, noticeLines) {
  const sections = [
    ...prefix,
    ...entries,
  ];

  if (noticeLines.length > 0) {
    sections.push('');
    sections.push(...noticeLines);
  }

  if (suffix.length > 0) {
    sections.push('');
    sections.push(...suffix);
  }

  sections.push('');
  return sections.join('\n');
}

function buildArchiveContent(sourceFile, archivedEntries) {
  return [
    '# Context Change History Archive',
    '',
    `Source file: \`${sourceFile}\``,
    `Archived entries: ${archivedEntries.length}`,
    '',
    '## Entries',
    ...archivedEntries,
    '',
  ].join('\n');
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  if (!fs.existsSync(options.file)) {
    throw new Error(`Missing history file: ${options.file}`);
  }

  const markdown = fs.readFileSync(options.file, 'utf8');
  const parsed = parseHistoryFile(markdown);

  if (parsed.entries.length <= options.keepLatest) {
    console.log(`[history-archive] no archive needed; entries=${parsed.entries.length}, keep-latest=${options.keepLatest}`);
    return;
  }

  const archivedEntries = parsed.entries.slice(0, parsed.entries.length - options.keepLatest);
  const keptEntries = parsed.entries.slice(parsed.entries.length - options.keepLatest);
  const archiveFilename = `context_change_history_${timestampForFilename()}.md`;
  const archivePath = path.join(options.archiveDir, archiveFilename);
  const archiveRelativePath = path.relative(rootDir, archivePath).split(path.sep).join('/');
  const historyRelativePath = path.relative(rootDir, options.file).split(path.sep).join('/');

  const mainFileContent = renderHistoryFile(
    parsed.prefix,
    keptEntries,
    stripPreviousArchiveNotes(parsed.suffix),
    archiveNotice(archiveRelativePath, archivedEntries.length, options.keepLatest),
  );
  const archiveContent = buildArchiveContent(historyRelativePath, archivedEntries);

  if (options.dryRun) {
    console.log(`[history-archive] dry run`);
    console.log(`[history-archive] would archive ${archivedEntries.length} entries to ${archiveRelativePath}`);
    console.log(`[history-archive] would keep ${keptEntries.length} entries in ${historyRelativePath}`);
    return;
  }

  fs.mkdirSync(options.archiveDir, { recursive: true });
  fs.writeFileSync(archivePath, archiveContent, 'utf8');
  fs.writeFileSync(options.file, mainFileContent, 'utf8');

  console.log(`[history-archive] archived ${archivedEntries.length} entries to ${archiveRelativePath}`);
  console.log(`[history-archive] kept ${keptEntries.length} entries in ${historyRelativePath}`);
}

try {
  main();
} catch (error) {
  console.error(`[history-archive] failed: ${error.message}`);
  process.exit(1);
}
