# Agent Context Framework (ACF)

Lightweight, file-based framework for bootstrapping, preserving, and handing off project context across AI agent sessions.

Agent Context Framework helps teams keep continuity in AI-assisted software projects, especially across fresh sessions, context resets, and handoffs. Canonical project state lives in Markdown files under `context/*`, while MCP Memory serves as a supporting semantic recall layer.

For the Polish version, see [README.pl.md](README.pl.md).

## Why ACF
- keeps a canonical, file-based source of truth in `context/*`
- gives agents a repeatable startup and handoff workflow
- reduces repeated re-explanation after compaction or session resets
- keeps MCP as a supporting memory layer instead of the only project record
- stays lightweight in architecture while covering a broad project workflow

## What You Get
- `context/next_context_sync.md` for startup and active code-map references
- `context/handoff_migration.md` for technical state, decisions, and runbooks
- `context/context_change_history.md` for history, tests, and commits
- `context/master_plan.md` for scope and delivery policy
- `tools/acf_setup.sh` as the unified interactive entrypoint
- `tools/init_project_context.sh` for direct project initialization
- `tools/bootstrap_existing_project.sh` for draft context generation in existing repositories
- `tools/verify_context_links.js` for code-reference validation
- MCP helper scripts for container setup, registration, and smoke checks

## Requirements
- `bash`
- `node` and `npm`
- `python3`
- `podman` for the container-based MCP workflow
- `codex` if you want automatic MCP registration from the setup flow

## After Download
If you just downloaded or cloned this repository, use this exact order:

1. Move into the repository directory.
2. Install dependencies:

```bash
npm install
```

3. Start the unified setup:

```bash
npm run acf:setup
```

4. When prompted, choose one mode:
- `new` if you are starting a fresh project from this framework
- `existing` if you are attaching the framework to a repository that already has code

5. During setup, ACF can also:
- create and start Podman containers for MCP Memory
- register MCP Memory in Codex
- optionally register a repo-scoped filesystem MCP server

6. After setup finishes, review:
- `context/next_context_sync.md`
- `context/handoff_migration.md`
- `docs/mcp_ai_memory_setup.md`

7. Verify the generated context references:

```bash
npm run verify:context
```

8. Continue with:
- [NEW_PROJECT_CHECKLIST.md](NEW_PROJECT_CHECKLIST.md) for operational setup
- [docs/system_flow.md](docs/system_flow.md) to understand how file-based context and MCP Memory work together

## Start Modes

### New Project
Choose `new` when:
- you are creating a project from scratch
- you want the framework to initialize clean placeholders and MCP naming
- you want to fill in the context files as the project begins

What ACF does in this mode:
- initializes project placeholders
- generates `config/project.env`
- prepares context files for a new project
- can create and register MCP infrastructure

### Existing Project
Choose `existing` when:
- the repository already contains real code
- you want to attach ACF to an existing codebase
- you want draft context files generated from a repository scan

What ACF does in this mode:
- initializes project-specific config
- scans the repository for manifests, likely stack, top-level directories, and likely entrypoints
- generates draft context files and marks them for human review
- can create and register MCP infrastructure

Important:
- `existing` mode generates a starting draft
- the user should review and correct the generated context files before treating them as canonical

## Quick Start
If you already know the framework and just want the shortest path:

```bash
npm install
npm run acf:setup
npm run verify:context
```

## Non-Interactive Example

```bash
./tools/acf_setup.sh \
  --mode new \
  --project-name "New Project" \
  --project-slug "new-project" \
  --db-port 55735 \
  --redis-port 56810 \
  --with-filesystem
```

By default, the initializer:
- derives `project-slug` from the parent repository folder name
- builds `project-name` from that slug
- uses default ports `55735` and `56810`

## Typical Workflow

```text
LLM Agent
   |
   v
context/next_context_sync.md
   |
   v
MCP semantic recall
   |
   v
verify with canonical context
   |
   v
work on codebase
   |
   v
update context + memory
```

In ACF, the recommended session flow is:

1. The agent starts from `context/next_context_sync.md`.
2. The agent recalls relevant MCP Memory entries.
3. The agent verifies MCP recall against canonical files in `context/*`.
4. The agent works on the codebase.
5. The work slice is closed with:
- a short code review
- an implementation commit
- updates to `context/*`
- one concise MCP write

Primary rule:
- `context/*` wins over MCP.

## MCP Setup
Use [docs/mcp_ai_memory_setup.md](docs/mcp_ai_memory_setup.md) for MCP registration and environment details.

Useful commands:

```bash
npm run acf:setup
npm run mcp:init
npm run verify:context
npm run mcp:register
npm run mcp:status
npm run mcp:smoke
```

## Documentation Map
- [NEW_PROJECT_CHECKLIST.md](NEW_PROJECT_CHECKLIST.md): human setup checklist
- [docs/system_flow.md](docs/system_flow.md): architecture and memory flow
- [docs/agent_workflow.md](docs/agent_workflow.md): day-to-day agent workflow
- [docs/mcp_ai_memory_setup.md](docs/mcp_ai_memory_setup.md): MCP registration and runtime setup
- [docs/mcp_memory_rules.md](docs/mcp_memory_rules.md): source-of-truth and write/retrieval rules

## Recommended Startup Prompt

```text
Act as a senior engineer for project <name>.

Startup:
1. Read `context/next_context_sync.md`.
2. Recall prior decisions from MCP `<server-name>` using project-specific keywords.
3. Verify recall against:
   - `context/handoff_migration.md`
   - `context/context_change_history.md`

Rules:
- `context/*` is the source of truth.
- If MCP and `context/*` differ, `context/*` wins.
- After each closed slice:
  - short code review,
  - commit,
  - update `context/*`,
  - 1 concise MCP record.
```

## Contributing
Contributions are welcome. Please read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request.

## Security
If you find a security issue, please follow [SECURITY.md](SECURITY.md).

## License
This project is available under the [MIT License](LICENSE).
