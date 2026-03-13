#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
INIT_SCRIPT="$ROOT_DIR/tools/init_project_context.sh"

PROJECT_NAME=""
PROJECT_SLUG=""
DB_PORT=""
REDIS_PORT=""

usage() {
  cat <<EOF
Usage:
  $(basename "$0") [--project-name "My Project"] [--project-slug "my-project"] [--db-port 55735] [--redis-port 56810]

Bootstraps ACF for an existing repository by:
  1. initializing project placeholders
  2. scanning the repository for likely stack and entrypoints
  3. generating draft context files that require human review
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --project-name) PROJECT_NAME="$2"; shift 2 ;;
    --project-slug) PROJECT_SLUG="$2"; shift 2 ;;
    --db-port) DB_PORT="$2"; shift 2 ;;
    --redis-port) REDIS_PORT="$2"; shift 2 ;;
    --help|-h) usage; exit 0 ;;
    *) usage; exit 1 ;;
  esac
done

ARGS=()
[[ -n "$PROJECT_NAME" ]] && ARGS+=(--project-name "$PROJECT_NAME")
[[ -n "$PROJECT_SLUG" ]] && ARGS+=(--project-slug "$PROJECT_SLUG")
[[ -n "$DB_PORT" ]] && ARGS+=(--db-port "$DB_PORT")
[[ -n "$REDIS_PORT" ]] && ARGS+=(--redis-port "$REDIS_PORT")

"$INIT_SCRIPT" "${ARGS[@]}"

python3 - <<'PY'
from __future__ import annotations

import json
import os
from pathlib import Path

root = Path(os.environ.get("ROOT_DIR_OVERRIDE") or Path.cwd())
root = root.resolve()

ignore_dirs = {
    ".git",
    "node_modules",
    ".venv",
    "venv",
    "dist",
    "build",
    "coverage",
    ".next",
    ".turbo",
    ".idea",
    ".vscode",
}

manifests = {
    "package.json": "Node.js",
    "pnpm-workspace.yaml": "pnpm workspace",
    "yarn.lock": "Yarn",
    "package-lock.json": "npm lockfile",
    "pyproject.toml": "Python",
    "requirements.txt": "Python requirements",
    "Pipfile": "Pipenv",
    "poetry.lock": "Poetry",
    "go.mod": "Go",
    "Cargo.toml": "Rust",
    "pom.xml": "Maven",
    "build.gradle": "Gradle",
    "docker-compose.yml": "Docker Compose",
    "docker-compose.yaml": "Docker Compose",
    "Dockerfile": "Docker",
    "Makefile": "Make",
}

verification_candidates = [
    ("package.json", "npm test"),
    ("vitest.config.ts", "npm run test"),
    ("vitest.config.js", "npm run test"),
    ("pytest.ini", "pytest"),
    ("pyproject.toml", "pytest"),
    ("go.mod", "go test ./..."),
    ("Cargo.toml", "cargo test"),
    ("pom.xml", "mvn test"),
    ("build.gradle", "./gradlew test"),
]

entrypoint_candidates = [
    "src/main.ts",
    "src/main.js",
    "src/index.ts",
    "src/index.js",
    "src/app.ts",
    "src/app.js",
    "app/main.py",
    "main.py",
    "manage.py",
    "cmd/main.go",
    "src/main.rs",
]

def walk_files(base: Path):
    for path in base.rglob("*"):
        if not path.is_file():
            continue
        rel = path.relative_to(base)
        if any(part in ignore_dirs for part in rel.parts):
            continue
        yield rel

files = list(walk_files(root))
top_level_dirs = sorted(
    [
        p.name
        for p in root.iterdir()
        if p.is_dir() and p.name not in ignore_dirs
    ]
)

manifest_hits = []
manifest_names = {rel.name for rel in files}
for rel in files:
    if rel.name in manifests:
        manifest_hits.append((str(rel), manifests[rel.name]))

stack_signals = []
for _, label in manifest_hits:
    if label not in stack_signals:
        stack_signals.append(label)

verification_command = "replace with project command"
for filename, command in verification_candidates:
    if filename in manifest_names:
        verification_command = command
        break

entrypoints = []
file_strings = {str(rel) for rel in files}
for candidate in entrypoint_candidates:
    if candidate in file_strings:
        entrypoints.append(candidate)

if not entrypoints:
    for rel in files[:5]:
        entrypoints.append(str(rel))

entrypoints = entrypoints[:5]
manifest_hits = manifest_hits[:12]

manifest_lines = "\n".join(
    f"- `{path}` -> {label}" for path, label in manifest_hits
) or "- No common stack manifests detected automatically."

entrypoint_lines = "\n".join(
    f"- `{path}` -> review this likely entrypoint or hot path and replace with a verified code-map reference`"
    for path in entrypoints
)
entrypoint_lines = entrypoint_lines.replace("reference`", "reference")
if not entrypoints:
    entrypoint_lines = "- Replace with verified entrypoints from the repository."

top_level_lines = "\n".join(f"- `{name}/`" for name in top_level_dirs[:15]) or "- No top-level directories detected."

context_next = root / "context" / "next_context_sync.md"
context_handoff = root / "context" / "handoff_migration.md"
context_master = root / "context" / "master_plan.md"
context_history = root / "context" / "context_change_history.md"

context_next.write_text(
    f"""# Next Context Sync

## Context Format Rules
- `context/*` remains the source of truth; `__MCP_SERVER_NAME__` is support memory only.
- `next_context_sync.md` should store fresh code-entry references in this format:
  - `Class.method() @ path/to/file:line -> change; next: ...`
  - `Class.method() @ path/to/file:line -> change; risk: ...`
- `context_change_history.md` stays historical: `date | type | part | summary | risks | tests | commit | links`.
- `handoff_migration.md` stays strategic: current product state, decisions, risks, direction, runbooks.
- MCP gets 1 concise record per closed slice, not a duplicate of full `context/*`.

## Startup Checklist
1. Read this file.
2. Recall prior decisions from `__MCP_SERVER_NAME__` using project-specific keywords.
3. Verify recall against `context/handoff_migration.md` and `context/context_change_history.md`.
4. If MCP health is unclear, run `./tools/mcp_memory_containers.sh status` and use `node tools/mcp_memory_smoke_test.cjs` for a deeper smoke check.
5. Continue from the next recommended step below.

## Last Completed Part
- Existing repository bootstrap completed.
- Status: draft context generated automatically and requires human review.

## Current State
- Build status: existing repository imported into ACF
- Verification command: {verification_command}
- Latest implementation commit: replace with real commit
- Latest repo correction commit: replace with real commit
- MCP environment: `__MCP_SERVER_NAME__` should be registered and containers should be available for the next session
- MCP health check script: `./tools/mcp_memory_containers.sh status`
- MCP smoke script: `node tools/mcp_memory_smoke_test.cjs`

## Active Code Map
{entrypoint_lines}

## Recommended Next Step
- Review the generated context drafts against the real codebase and replace placeholder notes with verified references.

## Open Risks
- Auto-generated bootstrap may miss domain-specific architecture or hidden runtime dependencies.
- Verification command is inferred and may need correction.
""",
    encoding="utf-8",
)

context_handoff.write_text(
    f"""# Handoff / Technical Base

## Scope
- Project: __PROJECT_NAME__
- Logical MCP role: project memory + canonical context files
- Canonical MCP memory server name: `__MCP_SERVER_NAME__`
- MCP environment status: unknown until configured
- Local Git remote `origin`: set per repo

## Context Operating Rules
- New sessions should start from `context/next_context_sync.md`.
- `context/*` remains canonical truth.
- MCP writes should stay concise and target only `__MCP_SERVER_NAME__`.
- This file was generated from an existing repository scan and requires human review.

## Current Architecture
- Stack signals detected:
{manifest_lines}

- Top-level directories detected:
{top_level_lines}

## Versions
- Replace with actual runtime and toolchain versions.

## Module Status
- Existing repository imported into ACF.
- Architecture and runbooks still need review and cleanup.

## Key Decisions
- ACF has been attached to an existing repository instead of starting greenfield.
- Canonical project state should now live in `context/*`.
- MCP memory remains a support layer only.

## Risks / Gaps
- Generated notes may be incomplete or inaccurate until reviewed.
- Deployment, build, and test runbooks still need human confirmation.

## Runbooks
- Build/test command: {verification_command}
- MCP health:
  - `./tools/mcp_memory_containers.sh status`
  - `node tools/mcp_memory_smoke_test.cjs`
""",
    encoding="utf-8",
)

context_master.write_text(
    """# Master Plan: __PROJECT_NAME__

## Active Scope
- Existing repository bootstrap into Agent Context Framework.
- Review and replace generated draft context with verified project-specific content.

## Delivery Policy
- Work autonomously by default.
- Commit after each testable part.
- Review after each part.
- Sync MCP Memory and `context/*` after each meaningful milestone.

## MCP And Context Rules
- Canonical truth lives in `context/next_context_sync.md`, `context/handoff_migration.md`, `context/context_change_history.md`.
- MCP Memory is support memory only.
- On mismatch, canonical files win.

## Phase Status
- Phase 0: ACF bootstrap for existing repository
- Phase 1: review generated context
- Phase 2: continue delivery with verified context

## Deferred Backlog
- Replace this section with the real backlog after reviewing the repository.
""",
    encoding="utf-8",
)

context_history.write_text(
    """# Context Change History

## Entries
- YYYY-MM-DD | type:bootstrap-existing | part:acf-setup | summary: Generated draft context files from existing repository scan. | risks:generated-context-may-be-incomplete | tests:replace-with-real-validation | commit:PENDING | links:context/next_context_sync.md
""",
    encoding="utf-8",
)

summary = {
    "verification_command": verification_command,
    "manifests": manifest_hits,
    "entrypoints": entrypoints,
    "top_level_dirs": top_level_dirs[:15],
}
print(json.dumps(summary, indent=2))
PY

cat <<EOF
[starter] Existing repository bootstrap complete
  Draft context generated from repository scan
  Review context/next_context_sync.md, context/handoff_migration.md, context/master_plan.md, and context/context_change_history.md
EOF
