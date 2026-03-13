# Procedure: Close Work Slice

Use this procedure when implementation for the current slice is complete.

## Typical Flow
1. Review the changed code for obvious regressions, risky assumptions, and missing validation.
2. Run the most relevant checks for the touched area.
3. Update `context/next_context_sync.md` with the current hotspot, status, and next step.
4. Update `context/handoff_migration.md` if architecture, decisions, risks, or runbooks changed.
5. Update `context/context_change_history.md` with summary, risks, tests, commit, and links.
6. Store one concise MCP memory entry if the slice is worth future recall.
7. Commit the implementation and any context sync changes.

## Check Before Closing
- confirm `context/*` reflects the new state
- keep MCP concise and non-duplicative
- leave a clear next step for the next session
