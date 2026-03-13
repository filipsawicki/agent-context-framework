#!/usr/bin/env bash

load_project_env() {
  local config_file="$1"
  shift
  local allowed_keys=("$@")
  local key value required_key

  [[ -f "$config_file" ]] || {
    echo "[acf] Missing config: $config_file" >&2
    return 1
  }

  while IFS='=' read -r key value; do
    key="${key%%[[:space:]]*}"
    [[ -n "$key" ]] || continue
    [[ "$key" =~ ^[A-Z0-9_]+$ ]] || continue

    case " ${allowed_keys[*]} " in
      *" $key "*) ;;
      *) continue ;;
    esac

    value="${value#\"}"
    value="${value%\"}"
    printf -v "$key" '%s' "$value"
  done < <(grep -E '^[A-Z0-9_]+=' "$config_file")

  for required_key in "${allowed_keys[@]}"; do
    : "${!required_key:=}"
  done
}
