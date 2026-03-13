#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CONFIG_FILE="$ROOT_DIR/config/project.env"
[[ -f "$CONFIG_FILE" ]] || { echo "[mcp] Missing config: $CONFIG_FILE" >&2; exit 1; }

load_config() {
  local key value
  local allowed_keys=(
    MCP_BIN
  )

  while IFS='=' read -r key value; do
    key="${key%%[[:space:]]*}"
    [[ -n "$key" ]] || continue
    [[ "$key" =~ ^[A-Z0-9_]+$ ]] || continue

    case "$key" in
      MCP_BIN) ;;
      *) continue ;;
    esac

    value="${value#\"}"
    value="${value%\"}"
    printf -v "$key" '%s' "$value"
  done < <(grep -E '^[A-Z0-9_]+=' "$CONFIG_FILE")

  for key in "${allowed_keys[@]}"; do
    : "${!key:=}"
  done
}

load_config

CONTAINERS_HELPER="$ROOT_DIR/tools/mcp_memory_containers.sh"
LOCAL_MCP_BIN="$ROOT_DIR/node_modules/.bin/mcp-ai-memory"
MCP_EXECUTABLE="${MCP_BIN:-}"

[[ -x "$CONTAINERS_HELPER" ]] || { echo "[mcp] Missing helper script: $CONTAINERS_HELPER" >&2; exit 1; }

if [[ -n "$MCP_EXECUTABLE" && "$MCP_EXECUTABLE" == "$ROOT_DIR/"* && -x "$MCP_EXECUTABLE" ]]; then
  :
elif [[ -x "$LOCAL_MCP_BIN" ]]; then
  MCP_EXECUTABLE="$LOCAL_MCP_BIN"
elif command -v mcp-ai-memory >/dev/null 2>&1; then
  MCP_EXECUTABLE="$(command -v mcp-ai-memory)"
else
  echo "[mcp] Missing MCP binary. Run npm install or set MCP_BIN in config/project.env." >&2
  exit 1
fi

"$CONTAINERS_HELPER" start >/dev/null
exec "$MCP_EXECUTABLE" "$@"
