#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const defaultRoot = path.resolve(__dirname, '..');

const ignoreDirs = new Set([
  '.git',
  'node_modules',
  '.venv',
  'venv',
  'dist',
  'build',
  'coverage',
  '.next',
  '.turbo',
  '.idea',
  '.vscode',
  '.github',
]);

const entrypointCandidates = [
  'src/main.ts',
  'src/main.js',
  'src/index.ts',
  'src/index.js',
  'src/app.ts',
  'src/app.js',
  'src/server.ts',
  'src/server.js',
  'app/main.py',
  'main.py',
  'manage.py',
  'cmd/main.go',
  'src/main.rs',
  'server.js',
  'index.js',
  'tools/acf_setup.sh',
];

const importantFileCandidates = [
  'package.json',
  'pyproject.toml',
  'go.mod',
  'Cargo.toml',
  'README.md',
  'src/main.ts',
  'src/index.ts',
  'src/app.ts',
  'app/main.py',
  'main.py',
  'manage.py',
  'cmd/main.go',
  'context/next_context_sync.md',
  'context/project_map.md',
  'context/handoff_migration.md',
];

const categoryKeywords = {
  core: new Set([
    'src',
    'app',
    'lib',
    'core',
    'domain',
    'engine',
    'ui',
    'frontend',
    'backend',
    'web',
    'client',
    'server',
    'services',
    'service',
    'packages',
    'pkg',
    'modules',
    'features',
  ]),
  infrastructure: new Set([
    'config',
    'db',
    'infra',
    'infrastructure',
    'scripts',
    'tools',
    'migrations',
    'deploy',
    'docker',
    'ops',
    'platform',
    'context',
    'docs',
  ]),
  integration: new Set([
    'api',
    'cli',
    'rpc',
    'grpc',
    'routes',
    'adapters',
    'integrations',
    'webhooks',
  ]),
};

const descriptions = {
  api: 'external API surface',
  app: 'application module root',
  cli: 'command-line entrypoints',
  config: 'configuration and environment loading',
  context: 'canonical context files for agent startup and handoff',
  core: 'core domain logic',
  db: 'database and persistence',
  docs: 'project workflow and architecture documentation',
  engine: 'core engine or domain rules',
  frontend: 'frontend application surface',
  backend: 'backend service surface',
  packages: 'workspace packages or shared modules',
  server: 'server-side runtime or service entrypoints',
  services: 'service layer modules',
  src: 'main source tree',
  tools: 'automation, setup, and operational scripts',
  ui: 'user interface layer',
  web: 'web-facing application surface',
};

function printHelp() {
  console.log(`Usage:
  node tools/generate_project_map.js [--root /path/to/repo] [--out context/project_map.md]

Generates a lightweight project map draft with entrypoints, modules, and important files.
`);
}

function parseArgs(argv) {
  const options = {
    root: defaultRoot,
    out: path.join(defaultRoot, 'context', 'project_map.md'),
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--root') {
      options.root = path.resolve(argv[i + 1]);
      i += 1;
    } else if (arg === '--out') {
      options.out = path.resolve(argv[i + 1]);
      i += 1;
    } else if (arg === '--help' || arg === '-h') {
      printHelp();
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return options;
}

function toPosixPath(targetPath) {
  return targetPath.split(path.sep).join('/');
}

function walkFiles(baseDir) {
  const results = [];
  const stack = ['.'];

  while (stack.length > 0) {
    const relativeDir = stack.pop();
    const absoluteDir = path.join(baseDir, relativeDir);
    const entries = fs.readdirSync(absoluteDir, { withFileTypes: true });

    for (const entry of entries) {
      if (ignoreDirs.has(entry.name)) {
        continue;
      }

      const relativePath = relativeDir === '.'
        ? entry.name
        : path.join(relativeDir, entry.name);

      if (entry.isDirectory()) {
        stack.push(relativePath);
      } else if (entry.isFile()) {
        results.push(toPosixPath(relativePath));
      }
    }
  }

  return results.sort();
}

function describeDirectory(dirName) {
  return descriptions[dirName] || 'module or subsystem directory';
}

function detectEntrypoints(fileSet) {
  const detected = entrypointCandidates.filter((candidate) => fileSet.has(candidate));
  return detected.slice(0, 6);
}

function classifyDirectories(topLevelDirs) {
  const buckets = {
    core: [],
    infrastructure: [],
    integration: [],
    other: [],
  };

  for (const dirName of topLevelDirs) {
    if (categoryKeywords.core.has(dirName)) {
      buckets.core.push(dirName);
    } else if (categoryKeywords.infrastructure.has(dirName)) {
      buckets.infrastructure.push(dirName);
    } else if (categoryKeywords.integration.has(dirName)) {
      buckets.integration.push(dirName);
    } else {
      buckets.other.push(dirName);
    }
  }

  if (buckets.core.length === 0) {
    buckets.core.push(...buckets.other.slice(0, 3));
    buckets.other = buckets.other.slice(3);
  }

  return buckets;
}

function detectImportantFiles(files, fileSet, entrypoints) {
  const picked = [];

  const addPath = (relativePath) => {
    if (!relativePath || picked.includes(relativePath) || !fileSet.has(relativePath)) {
      return;
    }
    picked.push(relativePath);
  };

  for (const entrypoint of entrypoints) {
    addPath(entrypoint);
  }

  for (const candidate of importantFileCandidates) {
    addPath(candidate);
  }

  for (const filePath of files) {
    if (picked.length >= 8) {
      break;
    }
    if (!filePath.includes('/')) {
      addPath(filePath);
    }
  }

  for (const filePath of files) {
    if (picked.length >= 8) {
      break;
    }
    addPath(filePath);
  }

  return picked.slice(0, 8);
}

function renderSection(title, lines, fallback) {
  const content = lines.length > 0 ? lines.join('\n') : `- ${fallback}`;
  return `## ${title}\n${content}`;
}

function buildMarkdown(rootDir, files) {
  const fileSet = new Set(files);
  const topLevelDirs = fs.readdirSync(rootDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !ignoreDirs.has(entry.name))
    .map((entry) => entry.name)
    .sort();

  const entrypoints = detectEntrypoints(fileSet);
  const categories = classifyDirectories(topLevelDirs);
  const importantFiles = detectImportantFiles(files, fileSet, entrypoints);

  const entrypointLines = entrypoints.map((relativePath) => `- \`${relativePath}\` - detected entrypoint candidate`);
  const coreLines = categories.core.slice(0, 8).map((dirName) => `- \`${dirName}/\` - ${describeDirectory(dirName)}`);
  const infrastructureLines = categories.infrastructure.slice(0, 8).map((dirName) => `- \`${dirName}/\` - ${describeDirectory(dirName)}`);
  const integrationLines = categories.integration.slice(0, 8).map((dirName) => `- \`${dirName}/\` - ${describeDirectory(dirName)}`);
  const importantFileLines = importantFiles.map((relativePath) => `- \`${relativePath}\` - high-value file to inspect early`);

  const dependencyNotes = [
    '- Replace this section with verified module relationships after review.',
    '- Keep this file lightweight: orient the agent, do not duplicate full architecture notes from `context/handoff_migration.md`.',
  ];

  return [
    '# Project Map',
    '',
    'Use this file as the lightweight repo-orientation map for new sessions.',
    '',
    renderSection('Entrypoints', entrypointLines, 'Replace with verified runtime or operational entrypoints.'),
    '',
    renderSection('Core Modules', coreLines, 'Replace with the main modules or source areas of the repository.'),
    '',
    renderSection('Infrastructure', infrastructureLines, 'Replace with configuration, persistence, and operational directories.'),
    '',
    renderSection('Integration Points', integrationLines, 'Replace with API, CLI, or external integration surfaces.'),
    '',
    renderSection('Important Files', importantFileLines, 'Replace with the files an agent should inspect early.'),
    '',
    '## Dependency Notes',
    dependencyNotes.join('\n'),
    '',
  ].join('\n');
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  const files = walkFiles(options.root);
  const markdown = buildMarkdown(options.root, files);
  fs.mkdirSync(path.dirname(options.out), { recursive: true });
  fs.writeFileSync(options.out, markdown, 'utf8');
  console.log(`[project-map] generated ${path.relative(options.root, options.out)}`);
}

try {
  main();
} catch (error) {
  console.error(`[project-map] failed: ${error.message}`);
  process.exit(1);
}
