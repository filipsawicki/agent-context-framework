# Handoff / Technical Base

## Scope
- Project: __PROJECT_NAME__
- Logical MCP role: project memory + canonical context files
- Canonical MCP memory server name: `__MCP_SERVER_NAME__`
- MCP environment status: unknown until configured
- Local Git remote `origin`: set per repo

## Context Operating Rules
- New sessions should start from `context/next_context_sync.md`; that file is the main entrypoint and tells the agent what else to verify.
- `context/project_map.md` is the lightweight repo-orientation map and should be read early in each session.
- `next_context_sync.md` is the compact code map and should prefer entries like:
  - `Class.method() @ path/to/file:line -> change; next: ...`
  - `Class.method() @ path/to/file:line -> change; risk: ...`
- `context_change_history.md` is the durable change log with tests and commits, not a second code map.
- `handoff_migration.md` is for project state, decisions, tradeoffs, and runbooks, not line-by-line implementation notes.
- MCP writes must stay concise and target only `__MCP_SERVER_NAME__`.
- MCP health should be checked with `./tools/mcp_memory_containers.sh status`; if needed, use `node tools/mcp_memory_smoke_test.cjs` for a deeper smoke test.
- Each closed implementation slice should explicitly include: short code review, implementation commit, `context/*` updates, 1 concise MCP write, and a follow-up context-sync commit when docs changed.

## Current Architecture
- Replace with actual project architecture.

## Versions
- Replace with actual toolchain versions.

## Module Status
- Foundation: planned

## Key Decisions
- `context/*` is canonical truth.
- MCP memory is support memory only.
- On mismatch, canonical files win.

## Risks / Gaps
- Replace with real risks.

## Runbooks
- Build/test command: replace with actual command
- MCP health:
  - `./tools/mcp_memory_containers.sh status`
  - `node tools/mcp_memory_smoke_test.cjs`
