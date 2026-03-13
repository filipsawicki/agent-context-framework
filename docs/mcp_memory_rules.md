# MCP Memory Rules (__PROJECT_NAME__)

## Source Of Truth
- Canonical context is in:
  - `context/next_context_sync.md`
  - `context/project_map.md`
  - `context/handoff_migration.md`
  - `context/context_change_history.md`
- MCP memory is support/index layer only.

## Retrieval Flow
1. Ensure infra is up: `./tools/mcp_memory_containers.sh start`
2. Use `memory_search` in `__MCP_SERVER_NAME__`.
3. Verify with canonical files.
4. On mismatch, canonical files win.

## Write Flow
1. Update all canonical files in `context/*`.
2. Store one concise MCP record.
3. Do not duplicate whole change logs in MCP.
