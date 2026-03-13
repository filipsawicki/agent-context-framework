# Agent Context Framework (ACF)

Lightweight, file-based framework for bootstrapping, preserving, and handing off project context across AI agent sessions.

Agent Context Framework helps teams keep continuity in AI-assisted software projects, especially across fresh sessions, context resets, and handoffs. Canonical project state lives in Markdown files under `context/*`, while MCP Memory serves as a supporting semantic recall layer.

For the Polish version, see [PRZECZYTAJ_MNIE.md](PRZECZYTAJ_MNIE.md).

## Why ACF
- keeps a canonical, file-based source of truth in `context/*`
- gives agents a repeatable startup and handoff workflow
- reduces repeated re-explanation after compaction or session resets
- keeps MCP as a supporting memory layer instead of the only project record
- stays lightweight in architecture while covering a broad project workflow

## Agent Compatibility
ACF is agent-agnostic at the workflow level.

That means the core model works with:
- Codex
- ChatGPT
- Claude
- Cursor
- Aider
- Continue
- custom CLI or editor agents

The framework itself is based on:
- canonical context files in `context/*`
- repeatable startup and handoff rules
- MCP as an optional supporting memory layer

Some automation in this repository is Codex-aware, especially MCP registration scripts, but the workflow itself does not depend on Codex.

## What You Get
- `context/next_context_sync.md` for startup and active code-map references
- `context/project_map.md` for lightweight repository orientation and module layout
- `context/handoff_migration.md` for technical state, decisions, and runbooks
- `context/context_change_history.md` for history, tests, and commits
- `context/master_plan.md` for scope and delivery policy
- `tools/acf_setup.sh` as the unified interactive entrypoint
- `tools/init_project_context.sh` for direct project initialization
- `tools/bootstrap_existing_project.sh` for draft context generation in existing repositories
- `tools/generate_project_map.js` for draft project-map generation
- `tools/verify_context_links.js` for code-reference validation
- `tools/verify_project_map.js` for project-map path validation
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
- `context/project_map.md`
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

## Quick Install Via Agent
If you are already working with an AI coding agent, you can delegate the installation instead of doing the setup manually.

Use a prompt like this inside the target repository:

```text
Install Agent Context Framework in this repository.

Steps:
1. Clone or copy ACF into this repo.
2. Run `npm install` in the ACF directory.
3. Run `npm run acf:setup`.
4. If this repository already contains code, choose `existing`.
5. After setup, run `npm run verify:context`.
6. Summarize what was created and what still needs manual review.
```

For a more explicit request:

```text
Attach Agent Context Framework to this existing repository, use the `existing` setup mode, verify the generated context links, and then tell me which context files I should review first.
```

Shortest copy-paste version:

```text
Install ACF here, choose `existing` if this repo already has code, run the setup, verify context links, and tell me what I should review next.
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
context/project_map.md
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
2. The agent reads `context/project_map.md` to orient on modules, entrypoints, and important files.
3. The agent recalls relevant MCP Memory entries.
4. The agent verifies MCP recall against canonical files in `context/*`.
5. The agent works on the codebase.
6. The work slice is closed with:
- a short code review
- an implementation commit
- updates to `context/*`
- one concise MCP write

Primary rule:
- `context/*` wins over MCP.

## Multi-Agent Use
ACF works well when multiple agents collaborate on the same project.

Typical examples:
- one agent works on backend changes
- another agent works on frontend changes
- another agent reviews or updates documentation

This works because:
- `context/*` is shared canonical state
- `context/next_context_sync.md` is the common startup point for every new session
- `context/project_map.md` gives each session a lightweight repo map before deeper analysis
- MCP Memory is used for concise recall, not as the only source of truth

For multi-agent work to stay reliable:
- every closed work slice should update `context/*`
- every closed work slice should write one concise MCP record
- every new session should start from `context/next_context_sync.md` and then read `context/project_map.md`
- when MCP and `context/*` differ, `context/*` wins

In short:
- ACF supports multiple agents on one project
- the shared context files are what keep those agents aligned

## MCP Setup
Use [docs/mcp_ai_memory_setup.md](docs/mcp_ai_memory_setup.md) for MCP registration and environment details.

Useful commands:

```bash
npm run acf:setup
npm run generate:project-map
npm run mcp:init
npm run verify:context
npm run verify:project-map
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
2. Read `context/project_map.md`.
3. Recall prior decisions from MCP `<server-name>` using project-specific keywords.
4. Verify recall against:
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
