#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const rootDir = path.resolve(__dirname, '..');
const nextContextPath = path.join(rootDir, 'context', 'next_context_sync.md');

function runCommand(command, args, options = {}) {
  return spawnSync(command, args, {
    cwd: rootDir,
    encoding: 'utf8',
    ...options,
  });
}

function parseVerificationCommand(markdown) {
  const match = markdown.match(/- Verification command:\s*(.+)/);
  return match ? match[1].trim() : 'not found';
}

function parseLatestField(markdown, fieldLabel) {
  const escaped = fieldLabel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = markdown.match(new RegExp(`- ${escaped}:\\s*(.+)`));
  return match ? match[1].trim() : 'not found';
}

function isPlaceholder(value) {
  return (
    !value
    || value === 'not found'
    || value === 'PENDING'
    || /replace with/i.test(value)
    || value === 'unknown'
  );
}

function formatStatus(label, ok, details) {
  const status = ok ? 'OK  ' : 'WARN';
  console.log(`${status} ${label}: ${details}`);
}

function printCommandOutput(header, stdout, stderr) {
  const chunks = [];
  if (stdout && stdout.trim().length > 0) {
    chunks.push(stdout.trimEnd());
  }
  if (stderr && stderr.trim().length > 0) {
    chunks.push(stderr.trimEnd());
  }
  if (chunks.length === 0) {
    return;
  }
  console.log('');
  console.log(header);
  console.log(chunks.join('\n'));
}

function normalizedText(value) {
  return (value || '').trim();
}

function main() {
  console.log('[acf-status]');

  const verifyResult = runCommand(process.execPath, [path.join(rootDir, 'tools', 'verify_context.js')]);
  formatStatus(
    'context validation',
    verifyResult.status === 0,
    verifyResult.status === 0 ? 'verify:context passed' : 'verify:context reported warnings or failures',
  );

  const mcpResult = runCommand('bash', [path.join(rootDir, 'tools', 'mcp_memory_containers.sh'), 'status']);
  const mcpDetails = mcpResult.status === 0
    ? 'status command completed'
    : (mcpResult.stderr || mcpResult.stdout || 'status command failed; check config or local runtime').trim();
  formatStatus(
    'mcp containers',
    mcpResult.status === 0,
    mcpDetails,
  );

  const headCommit = runCommand('git', ['log', '-1', '--oneline']);
  formatStatus(
    'latest repo commit',
    headCommit.status === 0,
    headCommit.status === 0 ? headCommit.stdout.trim() : 'unavailable',
  );

  const contextCommit = runCommand('git', ['log', '-1', '--oneline', '--', 'context']);
  formatStatus(
    'latest context commit',
    contextCommit.status === 0 && contextCommit.stdout.trim().length > 0,
    contextCommit.status === 0 && contextCommit.stdout.trim().length > 0 ? contextCommit.stdout.trim() : 'no context-specific commit found',
  );

  if (fs.existsSync(nextContextPath)) {
    const markdown = fs.readFileSync(nextContextPath, 'utf8');
    const verificationCommand = parseVerificationCommand(markdown);
    const latestImplementationCommit = parseLatestField(markdown, 'Latest implementation commit');
    const latestRepoCorrectionCommit = parseLatestField(markdown, 'Latest repo correction commit');

    formatStatus('verification command', !isPlaceholder(verificationCommand), verificationCommand);
    formatStatus('latest implementation commit', !isPlaceholder(latestImplementationCommit), latestImplementationCommit);
    formatStatus('latest repo correction commit', !isPlaceholder(latestRepoCorrectionCommit), latestRepoCorrectionCommit);
  } else {
    formatStatus('next context file', false, 'context/next_context_sync.md not found');
  }

  printCommandOutput('[acf-status] context validation output', verifyResult.stdout, verifyResult.stderr);

  const mcpStdout = normalizedText(mcpResult.stdout);
  const mcpStderr = normalizedText(mcpResult.stderr);
  const mcpOutputMatchesSummary = !mcpStdout && mcpStderr === normalizedText(mcpDetails);
  if (!mcpOutputMatchesSummary) {
    printCommandOutput('[acf-status] mcp status output', mcpResult.stdout, mcpResult.stderr);
  }

  if (verifyResult.status !== 0) {
    process.exit(verifyResult.status ?? 1);
  }
}

try {
  main();
} catch (error) {
  console.error(`[acf-status] failed: ${error.message}`);
  process.exit(1);
}
