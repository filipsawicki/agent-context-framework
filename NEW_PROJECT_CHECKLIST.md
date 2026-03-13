# NEW_PROJECT_CHECKLIST

Short checklist for bootstrapping a new project from `agent-context-framework`.

## 1. Copy The Starter
- copy `agent-context-framework/` into the new repository
- decide whether to keep that name or distribute the contents into target folders:
  - `context/`
  - `docs/`
  - `tools/`
  - `config/`

## 2. Install Tooling
- install local Node dependencies:

```bash
npm install
```

## 3. Run Unified Setup
- preferred path:

```bash
./tools/acf_setup.sh
```

- choose:
  - `new` for a greenfield project
  - `existing` for attaching ACF to an existing repository

- the setup can also:
  - create and start Podman containers for MCP Memory
  - register MCP Memory in Codex
  - optionally register a repo-scoped filesystem MCP server

## 4. Initialize The Project
- simplest version:

```bash
./tools/init_project_context.sh
```

- by default the script:
  - derives the slug from the parent repository folder name
  - builds the project name from the slug
  - uses ports `55735` and `56810`

- if you want overrides, run:

```bash
./tools/init_project_context.sh \
  --project-name "New Project" \
  --project-slug "new-project" \
  --db-port 55735 \
  --redis-port 56810
```

## 5. Review Core Files
- review:
  - `config/project.env`
  - `context/next_context_sync.md`
  - `context/project_map.md`
  - `context/handoff_migration.md`
  - `docs/mcp_ai_memory_setup.md`

## 6. Prepare MCP
- first verify context references:

```bash
npm run verify:context
```

- check status:

```bash
./tools/mcp_memory_containers.sh status
```

- if needed, start containers:

```bash
./tools/mcp_memory_containers.sh start
```

- run the smoke test:

```bash
node tools/mcp_memory_smoke_test.cjs
```

## 7. Register MCP In Codex
- use the command from:
  - `docs/mcp_ai_memory_setup.md`

## 8. Fill In The Initial Project State
- write the real scope into:
  - `context/master_plan.md`
- write the real technical state into:
  - `context/handoff_migration.md`
- write the lightweight repo map into:
  - `context/project_map.md`
- write the initial working state into:
  - `context/next_context_sync.md`
- write the first historical record into:
  - `context/context_change_history.md`

## 9. Start Working With The Agent
- in the first session, tell the agent to:
  - read `context/next_context_sync.md`
  - read `context/project_map.md`
  - recall prior decisions from MCP
  - verify recall against:
    - `context/handoff_migration.md`
    - `context/context_change_history.md`

## 10. Working Rules After Bootstrap
- `context/*` is the source of truth
- MCP is a supporting layer
- after each closed slice:
  - short code review
  - implementation commit
  - update `context/*`
  - 1 concise MCP entry
  - context-sync commit if docs changed

## 11. Note For The Agent
- the agent will not pick this checklist automatically
- the agent will use it when:
  - README points to it
  - you mention it in the first prompt
- after bootstrap, the main startup file for the agent remains:
  - `context/next_context_sync.md`
  - followed by `context/project_map.md`
