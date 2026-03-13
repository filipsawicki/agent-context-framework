# ACF Scope Boundary

This document defines the natural boundary of Agent Context Framework.

ACF should stay a lightweight memory file system for AI-assisted software work.
It should help agents start faster, preserve continuity, and follow repository conventions without turning into a full repository analysis platform.

## Current Priority
The healthiest next step for ACF is:
- stabilize the current core
- verify whether `context/project_map.md` and `context/procedures/` improve real agent outcomes
- postpone any new memory layers until that value is confirmed

This means the project should prefer:
- better examples
- tighter validation
- clearer startup rules
- more reliable bootstrap behavior

over:
- new memory categories
- heavy indexing
- code intelligence pipelines
- orchestration features

## What Belongs In Core ACF
Core ACF should remain focused on:
- working memory in `context/next_context_sync.md`
- semantic memory in `context/handoff_migration.md`
- episodic memory in `context/context_change_history.md`
- strategic memory in `context/master_plan.md`
- lightweight repo orientation in `context/project_map.md`
- procedural memory in `context/procedures/`
- MCP as a concise support recall layer

These pieces are still lightweight, file-based, reviewable, and agent-agnostic.

## What Does Not Belong In Core ACF Yet
The following ideas may be useful, but should stay outside the core unless there is strong evidence they are needed:
- full code dependency graphs
- symbol-level code indexing
- task orchestration systems
- ownership and locking systems for multi-agent concurrency
- heavy semantic query layers over the whole repository
- automatic diff-to-context pipelines for every commit

These features move ACF toward a repository intelligence platform rather than a lightweight memory framework.

## Evaluation Before Expansion
Before adding an `advanced` or `large-repo` mode, verify:
- whether agents actually start faster with `project_map.md`
- whether `context/procedures/` reduces pattern drift
- whether contributors keep these files current without extra friction
- whether the current validation scripts catch the most common failure modes

If the answer is mostly yes, then optional higher-tier features may be justified.
If not, the right move is to improve the current core instead of expanding it.

## If ACF Ever Adds An Advanced Tier
It should be:
- optional
- clearly separated from the core workflow
- generated where possible instead of manually maintained
- useful for large repositories without burdening small ones

In short:
- core ACF should optimize for clarity and continuity
- any advanced tier should optimize for scale without polluting the default path
