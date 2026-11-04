#!/usr/bin/env bash
# Build the static export and sync out/ to Hostinger over SSH.
#
# Usage:
#   npm run deploy            # build + dry run (shows what would change, touches nothing)
#   npm run deploy -- --live  # build + real upload
#
# Requires the "ijac-hostinger" host alias in ~/.ssh/config (see HOSTINGER-DEPLOYMENT.md).
# Override with DEPLOY_HOST / DEPLOY_DIR if needed.
set -euo pipefail

HOST="${DEPLOY_HOST:-ijac-hostinger}"
REMOTE_DIR="${DEPLOY_DIR:-domains/ijac.com.ar/public_html/}"
LIVE=false

for arg in "$@"; do
  case "$arg" in
    --live) LIVE=true ;;
    *) echo "Unknown option: $arg" >&2; exit 2 ;;
  esac
done

cd "$(dirname "$0")/.."

npm run build

if [[ ! -f out/index.html ]]; then
  echo "Build did not produce out/index.html; aborting." >&2
  exit 1
fi

RSYNC_ARGS=(
  -az
  --delete
  --itemize-changes
  --chmod=D755,F644
  # Never delete server-only files (security headers, certificate challenges).
  --filter='P .htaccess'
  --filter='P .well-known/'
)

if [[ "$LIVE" != true ]]; then
  RSYNC_ARGS+=(--dry-run)
  echo "DRY RUN: nothing will change on $HOST. Re-run with --live to upload."
fi

rsync "${RSYNC_ARGS[@]}" out/ "$HOST:$REMOTE_DIR"

if [[ "$LIVE" == true ]]; then
  echo "Deployed out/ to $HOST:$REMOTE_DIR"
fi
