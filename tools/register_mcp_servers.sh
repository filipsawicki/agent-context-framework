#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CONFIG_FILE="$ROOT_DIR/config/project.env"

REGISTER_FILESYSTEM="false"
FORCE="false"

usage() {
  cat <<EOF
Usage:
  $(basename "$0") [--force] [--with-filesystem]

Registers MCP Memory in Codex for the current repository.
Options:
  --force            replace an existing MCP registration with the same name
  --with-filesystem  also register a repo-scoped filesystem MCP server
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --force) FORCE="true"; shift ;;
    --with-filesystem) REGISTER_FILESYSTEM="true"; shift ;;
    --help|-h) usage; exit 0 ;;
    *) usage; exit 1 ;;
  esac
done

source "$ROOT_DIR/tools/load_project_env.sh"
load_project_env "$CONFIG_FILE" MCP_SERVER_NAME MEMORY_DB_URL REDIS_URL

command -v codex >/dev/null 2>&1 || {
  echo "[acf] codex CLI is required to register MCP servers" >&2
  exit 1
}

MEMORY_COMMAND="$ROOT_DIR/tools/mcp_memory_on_demand.sh"

register_server() {
  local name="$1"
  shift

  if codex mcp get "$name" >/dev/null 2>&1; then
    if [[ "$FORCE" == "true" ]]; then
      codex mcp remove "$name" >/dev/null
    else
      echo "[acf] MCP server already exists: $name"
      return 0
    fi
  fi

  codex mcp add "$name" "$@"
  echo "[acf] Registered MCP server: $name"
}

register_server \
  "$MCP_SERVER_NAME" \
  --env "MEMORY_DB_URL=$MEMORY_DB_URL" \
  --env "REDIS_URL=$REDIS_URL" \
  --env EMBEDDING_MODEL=Xenova/all-MiniLM-L6-v2 \
  --env LOG_LEVEL=info \
  --env DEFAULT_SEARCH_LIMIT=6 \
  --env ENABLE_ASYNC_PROCESSING=true \
  --env ENABLE_CLUSTERING=true \
  -- "$MEMORY_COMMAND"

if [[ "$REGISTER_FILESYSTEM" == "true" ]]; then
  FILESYSTEM_NAME="${MCP_SERVER_NAME%-mcp-memory}-filesystem"
  register_server \
    "$FILESYSTEM_NAME" \
    --env "FS_BASE_DIRECTORY=$ROOT_DIR" \
    --env MCP_LOG_LEVEL=error \
    -- npx -y @cyanheads/filesystem-mcp-server
fi
