# Project Map: __PROJECT_NAME__

Use this file as the lightweight repo-orientation map for new sessions.

## Entrypoints
- `tools/acf_setup.sh` - interactive setup entrypoint for this starter; replace with the real runtime or application entrypoints in your project

## Core Modules
- `context/` - canonical context files and startup state
- `docs/` - workflow and architecture guidance
- `tools/` - setup, verification, and MCP helper scripts

## Infrastructure
- `config/` - generated local environment config

## Integration Points
- `tools/register_mcp_servers.sh` - Codex MCP registration flow
- `tools/mcp_memory_on_demand.sh` - MCP Memory runtime entry

## Important Files
- `context/next_context_sync.md` - first file a new session should read
- `context/project_map.md` - repository orientation map; keep it concise and current
- `context/handoff_migration.md` - stable technical state, decisions, and runbooks
- `context/context_change_history.md` - durable historical log
- `package.json` - local command entrypoints for this starter

## Dependency Notes
- Replace this sample map with the real structure of the target repository after bootstrap.
- Keep this file lightweight: orient the agent, do not duplicate full architecture notes from `context/handoff_migration.md`.
