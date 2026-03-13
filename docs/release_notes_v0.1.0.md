# Release Notes: v0.1.0

## Agent Context Framework

Initial public release of Agent Context Framework (ACF).

This release provides a portable starter for bootstrapping and maintaining project context across AI agent sessions.

## Highlights
- file-based canonical context structure in `context/*`
- startup and handoff workflow for agent sessions
- MCP Memory integration as a supporting recall layer
- helper scripts for context verification and MCP operations
- English-first documentation with a Polish companion README
- portable local setup with `package.json` and documented requirements

## Included
- `context/next_context_sync.md`
- `context/handoff_migration.md`
- `context/context_change_history.md`
- `context/master_plan.md`
- `tools/init_project_context.sh`
- `tools/verify_context_links.js`
- `tools/mcp_memory_containers.sh`
- `tools/mcp_memory_on_demand.sh`
- `tools/mcp_memory_smoke_test.cjs`

## Notes
- install dependencies with `npm install`
- initialize a new project with `./tools/init_project_context.sh`
- review `README.md` and `NEW_PROJECT_CHECKLIST.md` for first-time setup

## Known Constraints
- full MCP usage still depends on local environment setup such as `podman`, Node.js, and access to required packages
- container lifecycle scripts assume a Podman-based workflow
