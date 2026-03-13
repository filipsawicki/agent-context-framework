# Procedure: Close Work Slice

Use this procedure when implementation for the current slice is complete.

## Typical Flow
1. Review the changed code for obvious regressions, risky assumptions, and missing validation.
2. Run the most relevant checks for the touched area.
3. If `context/next_context_sync.md` has a real `Verification command`, run it before closing the slice.
4. Update `context/next_context_sync.md` with the current hotspot, status, and next step.
5. Update `context/handoff_migration.md` if architecture, decisions, risks, or runbooks changed.
6. Append a new chronological entry to `context/context_change_history.md` with summary, risks, tests, commit, and links.
7. Store one concise MCP memory entry if the slice is worth future recall.
8. Commit the implementation and any context sync changes.

For long-running repositories:
- archive older history entries when `context/context_change_history.md` becomes hard to review
- use `npm run context:archive-history -- --keep-latest 100`

## Check Before Closing
- confirm `context/*` reflects the new state
- run `npm run context:run-verification` when the verification command is configured
- keep MCP concise and non-duplicative
- leave a clear next step for the next session
