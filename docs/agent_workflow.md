# Agent Workflow

## Goal
This starter should ensure that a new agent:
- knows where to begin
- understands the source of truth
- knows how to close each work slice
- does not let MCP and `context/*` drift apart

## Standard Session Flow
1. Read `context/next_context_sync.md`.
2. Read `context/project_map.md`.
3. Recall prior decisions from MCP.
4. Verify recall against:
   - `context/handoff_migration.md`
   - `context/context_change_history.md`
5. Do the work.
6. Close the slice with:
   - a short code review
   - an implementation commit
   - an update to `context/*`
   - 1 concise MCP entry
   - a context-sync commit if docs changed

## File Roles
- `context/next_context_sync.md`
  - quick start
  - active code map
  - next steps
- `context/project_map.md`
  - repo orientation
  - major modules
  - important files
- `context/handoff_migration.md`
  - technical state
  - decisions
  - risks
  - runbooks
- `context/context_change_history.md`
  - change history
  - tests
  - commits
- `context/master_plan.md`
  - scope
  - delivery rules
  - high-level backlog

## Source Of Truth Rule
- `context/*` wins over MCP.
- MCP is for recall and concise records, not for storing the full project history.

## Recommended Format In `next_context_sync.md`
- `Class.method() @ path/to/file:line -> change; next: ...`
- `Class.method() @ path/to/file:line -> change; risk: ...`

This gives the agent:
- fast code navigation
- low context cost
- fewer long paragraphs after compaction

## MCP Health
- context lint:

```bash
npm run verify:context
```

- quick check:

```bash
./tools/mcp_memory_containers.sh status
```

- smoke test:

```bash
node tools/mcp_memory_smoke_test.cjs
```

## Good Practices
- Do not store the same state in four places at once.
- Do not duplicate full changelogs in MCP.
- Do not mix workflow rules for one concrete project into this shared starter if it should serve many repos.
- Treat this starter as a base that should be adapted to the project stack.
