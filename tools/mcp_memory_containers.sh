#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CONFIG_FILE="$ROOT_DIR/config/project.env"
source "$ROOT_DIR/tools/load_project_env.sh"
load_project_env "$CONFIG_FILE" MCP_DB_CONTAINER MCP_REDIS_CONTAINER MCP_DB_PORT MCP_REDIS_PORT

DB_IMAGE="${MCP_DB_IMAGE:-docker.io/pgvector/pgvector:pg16}"
REDIS_IMAGE="${MCP_REDIS_IMAGE:-docker.io/library/redis:7-alpine}"
DB_VOLUME="${MCP_DB_CONTAINER}-data"
REDIS_VOLUME="${MCP_REDIS_CONTAINER}-data"

usage() {
  echo "Usage: $(basename "$0") <init|start|stop|status|reset>"
}

require_container_exists() {
  local name="$1"
  if ! podman container exists "$name"; then
    echo "[mcp] Missing required container: $name" >&2
    echo "[mcp] Recreate it according to docs/mcp_ai_memory_setup.md" >&2
    exit 1
  fi
}

create_db_container() {
  if podman container exists "$MCP_DB_CONTAINER"; then
    return
  fi

  podman volume exists "$DB_VOLUME" >/dev/null 2>&1 || podman volume create "$DB_VOLUME" >/dev/null
  podman create \
    --name "$MCP_DB_CONTAINER" \
    -e POSTGRES_USER=mcp \
    -e POSTGRES_PASSWORD=mcp \
    -e POSTGRES_DB=mcp_ai_memory \
    -p "${MCP_DB_PORT}:5432" \
    -v "${DB_VOLUME}:/var/lib/postgresql/data:Z" \
    "$DB_IMAGE" >/dev/null
}

create_redis_container() {
  if podman container exists "$MCP_REDIS_CONTAINER"; then
    return
  fi

  podman volume exists "$REDIS_VOLUME" >/dev/null 2>&1 || podman volume create "$REDIS_VOLUME" >/dev/null
  podman create \
    --name "$MCP_REDIS_CONTAINER" \
    -p "${MCP_REDIS_PORT}:6379" \
    -v "${REDIS_VOLUME}:/data:Z" \
    "$REDIS_IMAGE" \
    redis-server --appendonly yes >/dev/null
}

init_containers() {
  create_db_container
  create_redis_container
  start_containers
}

start_containers() {
  require_container_exists "$MCP_DB_CONTAINER"
  require_container_exists "$MCP_REDIS_CONTAINER"
  podman start "$MCP_DB_CONTAINER" >/dev/null || true
  podman start "$MCP_REDIS_CONTAINER" >/dev/null || true
  podman exec "$MCP_DB_CONTAINER" psql -U mcp -d mcp_ai_memory -c "CREATE EXTENSION IF NOT EXISTS vector;" >/dev/null
  status_containers
}

reset_containers() {
  podman rm -f "$MCP_DB_CONTAINER" >/dev/null 2>&1 || true
  podman rm -f "$MCP_REDIS_CONTAINER" >/dev/null 2>&1 || true
  podman volume rm "$DB_VOLUME" >/dev/null 2>&1 || true
  podman volume rm "$REDIS_VOLUME" >/dev/null 2>&1 || true
  echo "[mcp] Removed containers and named volumes for $MCP_DB_CONTAINER and $MCP_REDIS_CONTAINER"
}

stop_containers() {
  podman stop "$MCP_DB_CONTAINER" >/dev/null 2>&1 || true
  podman stop "$MCP_REDIS_CONTAINER" >/dev/null 2>&1 || true
  status_containers
}

status_containers() {
  podman ps -a --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | {
    head -n 1
    if command -v rg >/dev/null 2>&1; then
      rg "$MCP_DB_CONTAINER|$MCP_REDIS_CONTAINER" || true
    else
      grep -E "$MCP_DB_CONTAINER|$MCP_REDIS_CONTAINER" || true
    fi
  }
}

[[ $# -eq 1 ]] || { usage; exit 1; }
case "$1" in
  init) init_containers ;;
  start) start_containers ;;
  stop) stop_containers ;;
  status) status_containers ;;
  reset) reset_containers ;;
  *) usage; exit 1 ;;
esac
