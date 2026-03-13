#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
REPO_ROOT="$(cd "$ROOT_DIR/.." && pwd)"
CONFIG_EXAMPLE="$ROOT_DIR/config/project.env.example"
CONFIG_FILE="$ROOT_DIR/config/project.env"

PROJECT_NAME=""
PROJECT_SLUG=""
DB_PORT=""
REDIS_PORT=""

default_slug_from_repo() {
  basename "$REPO_ROOT"
}

default_name_from_slug() {
  local slug="$1"
  echo "$slug" | tr '_-' ' ' | sed 's/\b\(.\)/\u\1/g'
}

usage() {
  cat <<EOF
Usage:
  $(basename "$0") [--project-name "My Project"] [--project-slug "my-project"] [--db-port 55735] [--redis-port 56810]

Defaults:
  --project-slug  basename of the parent repository folder: $(default_slug_from_repo)
  --project-name  title generated from the repository slug
  --db-port       55735
  --redis-port    56810
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --project-name) PROJECT_NAME="$2"; shift 2 ;;
    --project-slug) PROJECT_SLUG="$2"; shift 2 ;;
    --db-port) DB_PORT="$2"; shift 2 ;;
    --redis-port) REDIS_PORT="$2"; shift 2 ;;
    *) usage; exit 1 ;;
  esac
done

PROJECT_SLUG="${PROJECT_SLUG:-$(default_slug_from_repo)}"
PROJECT_NAME="${PROJECT_NAME:-$(default_name_from_slug "$PROJECT_SLUG")}"
DB_PORT="${DB_PORT:-55735}"
REDIS_PORT="${REDIS_PORT:-56810}"

cp "$CONFIG_EXAMPLE" "$CONFIG_FILE"

python3 - <<PY
from pathlib import Path

root = Path(r"$ROOT_DIR")
project_name = r"$PROJECT_NAME"
project_slug = r"$PROJECT_SLUG"
db_port = r"$DB_PORT"
redis_port = r"$REDIS_PORT"
mcp_server = f"{project_slug}-mcp-memory"
mcp_db_container = f"{project_slug}-mcp-memory-db"
mcp_redis_container = f"{project_slug}-mcp-memory-redis"

targets = [
    root / "config" / "project.env",
    root / "README.md",
    root / "docs" / "mcp_ai_memory_setup.md",
    root / "docs" / "mcp_memory_rules.md",
    root / "context" / "next_context_sync.md",
    root / "context" / "project_map.md",
    root / "context" / "handoff_migration.md",
    root / "context" / "master_plan.md",
]

replacements = {
    "__PROJECT_NAME__": project_name,
    "__PROJECT_SLUG__": project_slug,
    "__MCP_SERVER_NAME__": mcp_server,
    "__MCP_DB_CONTAINER__": mcp_db_container,
    "__MCP_REDIS_CONTAINER__": mcp_redis_container,
    "__MCP_DB_PORT__": db_port,
    "__MCP_REDIS_PORT__": redis_port,
}

for path in targets:
    text = path.read_text(encoding="utf-8")
    for old, new in replacements.items():
        text = text.replace(old, new)
    text = text.replace("55735", db_port)
    text = text.replace("56810", redis_port)
    path.write_text(text, encoding="utf-8")
PY

cat <<EOF
[starter] Initialized project context
  PROJECT_NAME=$PROJECT_NAME
  PROJECT_SLUG=$PROJECT_SLUG
  MCP_SERVER_NAME=${PROJECT_SLUG}-mcp-memory
  DB_PORT=$DB_PORT
  REDIS_PORT=$REDIS_PORT
EOF
