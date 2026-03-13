# System Flow

This document explains how Agent Context Framework stores project knowledge and how an agent should use MCP Memory together with the canonical context files.

## Core Rule
- `context/*` is the source of truth
- MCP Memory is a supporting recall layer
- when MCP and `context/*` differ, `context/*` wins

## Scope Rule
- ACF should stay lightweight by default.
- For the detailed product boundary, see `docs/acf_scope_boundary.md`.

## High-Level Architecture

```text
LLM Agent
   |
   v
context/next_context_sync.md
   |
   v
context/project_map.md
   |
   v
MCP semantic recall
   |
   v
verify with canonical context
   |
   v
work on codebase
   |
   v
update context + memory
```

## Startup Flow
At the beginning of a session, the agent should:

1. Read `context/next_context_sync.md`.
2. Read `context/project_map.md` to orient on entrypoints, modules, and important files.
3. Read a relevant file from `context/procedures/` if the task matches a recurring repository workflow.
4. Use MCP recall for project-specific keywords, recent decisions, or known feature names.
5. Verify the recalled information against:
   - `context/handoff_migration.md`
   - `context/context_change_history.md`
6. Continue work only after the canonical files and recalled memory are aligned.

Why this matters:
- MCP recall is fast but not canonical
- `context/*` gives durable, human-readable continuity
- the combination reduces token cost without losing control over project state

## Write Flow
When a meaningful work slice is completed:

1. Update the canonical files in `context/*`.
2. Store one concise MCP Memory record.
3. Commit the implementation and the context updates.

The MCP write should summarize the slice, not duplicate the entire file-based state.

## What Goes Into `context/*`

### `context/next_context_sync.md`
Use this as the primary startup file for the next session.

It should contain:
- the current state snapshot
- active code-map references
- recommended next step
- current risks

Recommended code-map format:
- `Class.method() @ path/to/file:line -> change; next: ...`
- `Class.method() @ path/to/file:line -> change; risk: ...`

### `context/project_map.md`
Use this as the lightweight repository-orientation file:
- entrypoints
- core modules
- infrastructure areas
- integration points
- important files worth reading early

### `context/procedures/`
Use this as the procedural memory layer:
- repo-specific ways of doing recurring tasks
- short recipes for common changes
- validation expectations before closing a slice

### `context/handoff_migration.md`
Use this for stable technical context:
- architecture notes
- decisions and tradeoffs
- runbooks
- technical risks and constraints

### `context/context_change_history.md`
Use this as the historical log:
- date
- change type
- part or scope
- summary
- risks
- tests
- commit reference
- related links

### `context/master_plan.md`
Use this for:
- current scope
- delivery policy
- phase status
- higher-level backlog

## What Goes Into MCP Memory
MCP Memory should store:
- concise summaries of closed work slices
- keywords that improve future recall
- high-value decisions worth surfacing quickly in later sessions

MCP Memory should not store:
- full changelogs duplicated from `context/context_change_history.md`
- the entire architecture narrative from `context/handoff_migration.md`
- line-by-line code maps already tracked in `context/next_context_sync.md`

## Practical Storage Split

```text
implementation completed
   |
   +--> update context/*
   |       |
   |       v
   |    canonical project state
   |
   +--> write concise MCP record
           |
           v
        searchable recall memory
```

## Why The Split Works
- files are explicit, reviewable, and versionable
- MCP is fast for lookup and continuity across sessions
- keeping MCP concise avoids drift and duplication
- keeping files canonical makes handoff safer for both humans and agents

## Operational Checks
Useful validation commands:

```bash
npm run verify:context
npm run verify:project-map
npm run mcp:status
npm run mcp:smoke
```

## Short Rule Of Thumb
- if it must be correct and durable, put it in `context/*`
- if it should be easy to recall later, put a concise summary in MCP Memory
