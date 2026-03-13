# Next Context Sync

## Context Format Rules
- `context/*` remains the source of truth; `__MCP_SERVER_NAME__` is support memory only.
- `next_context_sync.md` should store fresh code-entry references in this format:
  - `Class.method() @ path/to/file:line -> change; next: ...`
  - `Class.method() @ path/to/file:line -> change; risk: ...`
- `context_change_history.md` stays historical: `date | type | part | summary | risks | tests | commit | links`.
- `handoff_migration.md` stays strategic: current product state, decisions, risks, direction, runbooks.
- MCP gets 1 concise record per closed slice, not a duplicate of full `context/*`.
- Every closed slice should end with:
  - a short code review
  - an implementation commit
  - updates to `context/handoff_migration.md`, `context/context_change_history.md`, and `context/next_context_sync.md`
  - 1 concise write to `__MCP_SERVER_NAME__`
  - a context-sync commit if `context/*` changed

## Startup Checklist
1. Read this file.
2. Read `context/project_map.md` to orient on modules, entrypoints, and important files.
3. If the task matches a known repository workflow, read the relevant file in `context/procedures/`.
4. Recall prior decisions from `__MCP_SERVER_NAME__` using project-specific keywords.
5. Verify recall against `context/handoff_migration.md` and `context/context_change_history.md`.
6. If MCP health is unclear, run `./tools/mcp_memory_containers.sh status` and use `node tools/mcp_memory_smoke_test.cjs` for a deeper smoke check.
7. Continue from the next recommended step below.

## Last Completed Part
- Replace this section with closed milestones for the new project.

## Current State
- Build status: unknown
- Verification command: replace with project command
- Latest implementation commit: PENDING
- Latest repo correction commit: PENDING
- MCP environment: `__MCP_SERVER_NAME__` should be registered and containers should be available for the next session
- MCP health check script: `./tools/mcp_memory_containers.sh status`
- MCP smoke script: `node tools/mcp_memory_smoke_test.cjs`

## Active Code Map
- `default_slug_from_repo() @ tools/init_project_context.sh:11 -> bootstrap helper deriving the project slug from the parent repo folder; next: replace this sample entry with the real hot path of the new project`

## Recommended Next Step
- Replace this section with the next real action for the new project.

## Open Risks
- Replace this section with real project risks.
