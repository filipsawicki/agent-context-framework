#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { Client } = require("@modelcontextprotocol/sdk/dist/cjs/client/index.js");
const { StdioClientTransport } = require("@modelcontextprotocol/sdk/dist/cjs/client/stdio.js");

const rootDir = path.resolve(__dirname, '..');
const configPath = path.join(rootDir, 'config', 'project.env');
const allowedConfigKeys = new Set([
  'MEMORY_DB_URL',
  'REDIS_URL',
  'LOG_LEVEL',
  'ENABLE_ASYNC_PROCESSING',
  'ENABLE_CLUSTERING',
  'DEFAULT_SEARCH_LIMIT',
  'MCP_BIN',
]);

if (!fs.existsSync(configPath)) {
  console.error(`mcp smoke test failed: missing config ${configPath}`);
  process.exit(1);
}

const envFile = fs.readFileSync(configPath, 'utf8');
for (const rawLine of envFile.split('\n')) {
  const line = rawLine.trim();
  if (!line || line.startsWith('#')) continue;
  const index = line.indexOf('=');
  if (index === -1) continue;
  const key = line.slice(0, index);
  if (!allowedConfigKeys.has(key)) continue;
  let value = line.slice(index + 1);
  value = value.replace(/^"/, '').replace(/"$/, '');
  if (!process.env[key]) process.env[key] = value;
}

const localBinary = path.join(rootDir, 'node_modules', '.bin', process.platform === 'win32' ? 'mcp-ai-memory.cmd' : 'mcp-ai-memory');
const configuredBinary = process.env.MCP_BIN;
const command = configuredBinary && configuredBinary.startsWith(`${rootDir}${path.sep}`)
  ? configuredBinary
  : fs.existsSync(localBinary)
    ? localBinary
    : 'mcp-ai-memory';
const userContext = process.env.USER_CONTEXT || 'mcp-smoke';
const query = process.env.QUERY || 'bootstrap';

async function main() {
  const env = {
    ...process.env,
    MEMORY_DB_URL: process.env.MEMORY_DB_URL,
    REDIS_URL: process.env.REDIS_URL,
    LOG_LEVEL: process.env.LOG_LEVEL || 'error',
    ENABLE_ASYNC_PROCESSING: process.env.ENABLE_ASYNC_PROCESSING || 'true',
    ENABLE_CLUSTERING: process.env.ENABLE_CLUSTERING || 'true',
    DEFAULT_SEARCH_LIMIT: process.env.DEFAULT_SEARCH_LIMIT || '6',
  };

  if (!env.MEMORY_DB_URL) throw new Error('MEMORY_DB_URL is required');

  const transport = new StdioClientTransport({ command, env });
  const client = new Client({ name: 'mcp-memory-smoke-test', version: '1.0.0' });

  try {
    await client.connect(transport);
    const result = await client.callTool({
      name: 'memory_search',
      arguments: { user_context: userContext, query, limit: 3 },
    });
    console.log('mcp smoke test passed');
    console.log(JSON.stringify({ userContext, query, hasResult: !!result }, null, 2));
  } finally {
    void client.close();
  }
}

main().catch((err) => {
  console.error('mcp smoke test failed:', err?.message || err);
  process.exit(1);
});
