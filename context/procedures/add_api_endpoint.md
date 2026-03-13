# Procedure: Add API Endpoint

Use this procedure when the task adds or changes an HTTP or RPC entrypoint.

## Typical Flow
1. Find the current entrypoint and routing layer using `context/project_map.md`.
2. Add or update the handler in the API or service layer.
3. Register the route in the router or transport integration point.
4. Add validation for input and output if the project uses schemas.
5. Add or update tests for the endpoint behavior.
6. Update `context/next_context_sync.md` with the touched code path if it becomes an active hotspot.

## Check Before Closing
- confirm the route is wired in the real entrypoint path
- run the project test command from `context/next_context_sync.md`
- record any new assumptions or tradeoffs in `context/handoff_migration.md`
