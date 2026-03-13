#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
INIT_SCRIPT="$ROOT_DIR/tools/init_project_context.sh"
EXISTING_SCRIPT="$ROOT_DIR/tools/bootstrap_existing_project.sh"
CONTAINERS_SCRIPT="$ROOT_DIR/tools/mcp_memory_containers.sh"
REGISTER_SCRIPT="$ROOT_DIR/tools/register_mcp_servers.sh"

MODE=""
PROJECT_NAME=""
PROJECT_SLUG=""
DB_PORT="55735"
REDIS_PORT="56810"
SETUP_CONTAINERS="yes"
REGISTER_MEMORY="yes"
REGISTER_FILESYSTEM="no"

usage() {
  cat <<EOF
Usage:
  $(basename "$0") [--mode new|existing] [--project-name "My Project"] [--project-slug "my-project"] [--db-port 55735] [--redis-port 56810] [--no-containers] [--no-memory-register] [--with-filesystem]

Interactive setup entrypoint for Agent Context Framework.
Modes:
  new       bootstrap a new project
  existing  attach ACF to an existing repository and generate draft context
EOF
}

slugify() {
  local input="$1"
  echo "$input" | tr '[:upper:]' '[:lower:]' | sed -E 's/[^a-z0-9]+/-/g; s/^-+//; s/-+$//; s/-+/-/g'
}

prompt_value() {
  local prompt="$1"
  local default_value="$2"
  local answer=""

  if [[ -n "$default_value" ]]; then
    read -r -p "$prompt [$default_value]: " answer
    echo "${answer:-$default_value}"
  else
    read -r -p "$prompt: " answer
    echo "$answer"
  fi
}

prompt_yes_no() {
  local prompt="$1"
  local default_value="$2"
  local answer=""
  read -r -p "$prompt [$default_value]: " answer
  answer="${answer:-$default_value}"
  case "$answer" in
    y|Y|yes|YES) echo "yes" ;;
    n|N|no|NO) echo "no" ;;
    *) echo "$default_value" ;;
  esac
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --mode) MODE="$2"; shift 2 ;;
    --project-name) PROJECT_NAME="$2"; shift 2 ;;
    --project-slug) PROJECT_SLUG="$2"; shift 2 ;;
    --db-port) DB_PORT="$2"; shift 2 ;;
    --redis-port) REDIS_PORT="$2"; shift 2 ;;
    --no-containers) SETUP_CONTAINERS="no"; shift ;;
    --no-memory-register) REGISTER_MEMORY="no"; shift ;;
    --with-filesystem) REGISTER_FILESYSTEM="yes"; shift ;;
    --help|-h) usage; exit 0 ;;
    *) usage; exit 1 ;;
  esac
done

if [[ -z "$MODE" ]]; then
  echo "Choose setup mode:"
  echo "  1) new"
  echo "  2) existing"
  read -r -p "Mode [new]: " mode_answer
  case "${mode_answer:-new}" in
    1|new|NEW) MODE="new" ;;
    2|existing|EXISTING) MODE="existing" ;;
    *) echo "[acf] Invalid mode" >&2; exit 1 ;;
  esac
fi

if [[ "$MODE" != "new" && "$MODE" != "existing" ]]; then
  echo "[acf] Mode must be 'new' or 'existing'" >&2
  exit 1
fi

if [[ -z "$PROJECT_NAME" ]]; then
  PROJECT_NAME="$(prompt_value "Project name" "$(basename "$(cd "$ROOT_DIR/.." && pwd)")")"
fi

if [[ -z "$PROJECT_SLUG" ]]; then
  PROJECT_SLUG="$(prompt_value "Project slug" "$(slugify "$PROJECT_NAME")")"
fi

DB_PORT="$(prompt_value "MCP DB port" "$DB_PORT")"
REDIS_PORT="$(prompt_value "MCP Redis port" "$REDIS_PORT")"
if [[ "$SETUP_CONTAINERS" == "yes" ]]; then
  SETUP_CONTAINERS="$(prompt_yes_no "Create or start Podman containers for MCP Memory?" "yes")"
fi
if [[ "$REGISTER_MEMORY" == "yes" ]]; then
  REGISTER_MEMORY="$(prompt_yes_no "Register MCP Memory in Codex?" "yes")"
fi
if [[ "$REGISTER_FILESYSTEM" == "no" ]]; then
  REGISTER_FILESYSTEM="$(prompt_yes_no "Also register a repo-scoped filesystem MCP in Codex?" "no")"
fi

COMMON_ARGS=(
  --project-name "$PROJECT_NAME"
  --project-slug "$PROJECT_SLUG"
  --db-port "$DB_PORT"
  --redis-port "$REDIS_PORT"
)

case "$MODE" in
  new)
    "$INIT_SCRIPT" "${COMMON_ARGS[@]}"
    cat <<EOF
[acf] New project bootstrap complete
  Next: review NEW_PROJECT_CHECKLIST.md
  Start sessions from context/next_context_sync.md
EOF
    ;;
  existing)
    "$EXISTING_SCRIPT" "${COMMON_ARGS[@]}"
    cat <<EOF
[acf] Existing project bootstrap complete
  Next: review the generated draft context files carefully
  Start review from context/next_context_sync.md and docs/system_flow.md
EOF
    ;;
esac

if [[ "$SETUP_CONTAINERS" == "yes" ]]; then
  "$CONTAINERS_SCRIPT" init
fi

if [[ "$REGISTER_MEMORY" == "yes" ]]; then
  REGISTER_ARGS=()
  [[ "$REGISTER_FILESYSTEM" == "yes" ]] && REGISTER_ARGS+=(--with-filesystem)
  "$REGISTER_SCRIPT" "${REGISTER_ARGS[@]}"
fi
