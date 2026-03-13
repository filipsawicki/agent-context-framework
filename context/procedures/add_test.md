# Procedure: Add Test

Use this procedure when the task introduces or updates automated test coverage.

## Typical Flow
1. Identify the closest existing test pattern for the touched area.
2. Prefer extending the local test suite near the feature instead of inventing a new test location.
3. Cover the expected behavior, the main failure mode, and one regression-sensitive edge case.
4. Keep fixtures and helpers aligned with existing repository conventions.
5. If the feature changes a public contract, update any integration or end-to-end coverage that depends on it.

## Check Before Closing
- run the smallest relevant test command first
- run the broader verification command from `context/next_context_sync.md` if the risk is wider
- note important testing gaps in `context/context_change_history.md` if coverage is partial
