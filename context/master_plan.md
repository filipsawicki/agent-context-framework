# Master Plan: __PROJECT_NAME__

## Active Scope
- Stabilize the current ACF core.
- Evaluate `context/project_map.md` and `context/procedures/` before considering optional future tiers.

## Delivery Policy
- Work autonomously by default.
- Commit after each testable part.
- Review after each part.
- Sync MCP Memory and `context/*` after each meaningful milestone.

## MCP And Context Rules
- Canonical truth lives in `context/next_context_sync.md`, `context/project_map.md`, `context/handoff_migration.md`, `context/context_change_history.md`.
- `context/procedures/` stores procedural memory for recurring repository workflows.
- MCP Memory is support memory only.
- On mismatch, canonical files win.
- Session startup flow:
  1. Read `context/next_context_sync.md`.
  2. Read `context/project_map.md`.
  3. Read a relevant file from `context/procedures/` if the task matches a known workflow.
  4. Recall previous decisions from MCP Memory.
  5. Verify against `handoff_migration.md` and `context_change_history.md`.
  6. After changes, update all canonical files.
  7. Store one concise MCP record.

## Phase Status
- Foundation: active
- Phase 1: stabilize `project_map.md`, `context/procedures/`, and bootstrap behavior
- Phase 2: evaluate real-world usefulness and maintenance cost
- Phase 3+: backlog for optional advanced or large-repo features

## Deferred Backlog
- Improve validation and examples for the current core workflow.
- Gather feedback on whether `project_map.md` speeds up agent startup in real repositories.
- Gather feedback on whether `context/procedures/` reduces repository-pattern drift.
- Keep scale-oriented features, such as code graphs or heavy indexing, out of the default core path.
