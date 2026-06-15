#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

DEPLOYMENT_FLAG=()
if [[ "${1:-}" == "--prod" ]]; then
  DEPLOYMENT_FLAG=(--prod)
elif [[ "${1:-}" == "--local" ]]; then
  DEPLOYMENT_FLAG=(--deployment local)
fi

TMP="$(mktemp)"
trap 'rm -f "$TMP"' EXIT

node scripts/generateKeys.mjs > "$TMP"
npx convex env set --from-file "$TMP" --force "${DEPLOYMENT_FLAG[@]}"

if [[ "${1:-}" == "--prod" ]]; then
  npx convex env set SITE_URL https://taganga-gastos.vercel.app --prod
else
  npx convex env set SITE_URL http://localhost:5173 "${DEPLOYMENT_FLAG[@]}"
fi

echo "✔ Auth env list:"
npx convex env list "${DEPLOYMENT_FLAG[@]}"
