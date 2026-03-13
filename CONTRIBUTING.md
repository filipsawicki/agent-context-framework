# Contributing

Thanks for considering a contribution to Agent Context Framework.

## Before You Start
- read [README.md](README.md)
- review [NEW_PROJECT_CHECKLIST.md](NEW_PROJECT_CHECKLIST.md) and [docs/agent_workflow.md](docs/agent_workflow.md)
- keep `context/*` and MCP usage rules consistent with [docs/mcp_memory_rules.md](docs/mcp_memory_rules.md)

## Development Setup
```bash
npm install
```

If you want to test the MCP workflow end to end, you will also need a working local environment for `podman` and the MCP runtime described in [docs/mcp_ai_memory_setup.md](docs/mcp_ai_memory_setup.md).

## Contribution Guidelines
- keep the documentation English-first unless a file is explicitly bilingual
- prefer small, focused pull requests
- update documentation when behavior or workflow changes
- avoid introducing machine-specific paths or environment assumptions
- preserve `context/*` as the canonical file-based source of truth

## Suggested Validation
Run these checks before opening a pull request:

```bash
npm run verify:context
bash -n tools/init_project_context.sh tools/mcp_memory_containers.sh tools/mcp_memory_on_demand.sh
```

If you changed MCP-related behavior, also document how you tested it.

## Pull Requests
Please include:
- what changed
- why it changed
- how you validated it
- any limitations or follow-up work
