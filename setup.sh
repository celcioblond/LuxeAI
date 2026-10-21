#!/usr/bin/env bash
# First-time setup for a fresh clone: creates the env files docker compose needs.
# Safe to re-run: existing .env files are never overwritten.
set -euo pipefail

cd "$(dirname "$0")"

created_server_env=false

for dir in server client ai-service; do
  if [[ -f "$dir/.env" ]]; then
    echo "  skip    $dir/.env (already exists)"
  else
    cp "$dir/.env.example" "$dir/.env"
    echo "  create  $dir/.env"
    [[ "$dir" == "server" ]] && created_server_env=true
  fi
done

# Replace the placeholder JWT secret with a random one, only in a file we just created
if $created_server_env; then
  if command -v openssl >/dev/null 2>&1; then
    secret="$(openssl rand -hex 32)"
  else
    secret="$(LC_ALL=C tr -dc 'a-f0-9' </dev/urandom | head -c 64)"
  fi
  # Portable in-place edit (BSD sed on macOS and GNU sed differ on -i)
  tmp="$(mktemp)"
  sed "s/^JWT_SECRET=.*/JWT_SECRET=$secret/" server/.env >"$tmp"
  mv "$tmp" server/.env
  echo "  set     random JWT_SECRET in server/.env"
fi

if ! command -v docker >/dev/null 2>&1; then
  echo
  echo "warning: docker was not found. Install Docker to run the stack with docker compose."
fi

cat <<'EOF'

Done. Next steps:
  1. (Optional) Add your Stripe test keys to server/.env and client/.env
     to enable checkout. Everything else works without them.
  2. docker compose up -d --build
  3. docker compose exec backend npm run seed
  4. Open http://localhost:5173 and log in with a sample user (see README).
EOF
