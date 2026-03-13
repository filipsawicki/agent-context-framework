# MCP AI Memory Setup (__PROJECT_NAME__)

## Containers
- DB container: __MCP_DB_CONTAINER__ (port __MCP_DB_PORT__)
- Redis container: __MCP_REDIS_CONTAINER__ (port __MCP_REDIS_PORT__)

## Quick Ops
```bash
./tools/mcp_memory_containers.sh init
./tools/mcp_memory_containers.sh start
./tools/mcp_memory_containers.sh status
./tools/mcp_memory_containers.sh stop
./tools/register_mcp_servers.sh
```

## Unified Setup
If you want one interactive entrypoint for project bootstrap and MCP setup, use:

```bash
./tools/acf_setup.sh
```

This setup can:
- bootstrap a `new` or `existing` project
- create and start Podman containers
- register MCP Memory in Codex
- optionally register a repo-scoped filesystem MCP server

## Register MCP Server In Codex
```bash
codex mcp add __MCP_SERVER_NAME__ \
  --env MEMORY_DB_URL=postgresql://mcp:mcp@127.0.0.1:__MCP_DB_PORT__/mcp_ai_memory \
  --env REDIS_URL=redis://127.0.0.1:__MCP_REDIS_PORT__ \
  --env EMBEDDING_MODEL=Xenova/all-MiniLM-L6-v2 \
  --env LOG_LEVEL=info \
  --env DEFAULT_SEARCH_LIMIT=6 \
  --env ENABLE_ASYNC_PROCESSING=true \
  --env ENABLE_CLUSTERING=true \
  -- ./tools/mcp_memory_on_demand.sh
```
