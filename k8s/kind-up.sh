#!/usr/bin/env bash
# Build the images, create the kind cluster (if needed), load the images and
# apply k8s/base. Safe to re-run.
#   ./k8s/kind-up.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CLUSTER=gamebuddy
NS=gamebuddy

# Keep the schema ConfigMap in step with Backend/gb-schema.sql
{
  sed -n '1,/^  01-schema.sql: |$/p' "$ROOT/k8s/base/postgres-init-configmap.yaml"
  sed 's/^/    /; s/^    $//' "$ROOT/Backend/gb-schema.sql"
} > "$ROOT/k8s/base/postgres-init-configmap.yaml.tmp"
mv "$ROOT/k8s/base/postgres-init-configmap.yaml.tmp" "$ROOT/k8s/base/postgres-init-configmap.yaml"

if ! kind get clusters | grep -qx "$CLUSTER"; then
  kind create cluster --config "$ROOT/k8s/kind-config.yaml"
fi
kubectl config use-context "kind-$CLUSTER" >/dev/null

docker build -t gamebuddy-backend:local "$ROOT/Backend"
docker build -t gamebuddy-frontend:local "$ROOT/Frontend"
docker pull -q postgres:16-alpine
kind load docker-image --name "$CLUSTER" gamebuddy-backend:local gamebuddy-frontend:local postgres:16-alpine

kubectl apply -k "$ROOT/k8s/base"

# Real Steam key from .env (never committed) into the backend Secret
STEAM_API_KEY="$(grep -s '^STEAM_API_KEY=' "$ROOT/.env" | cut -d= -f2- || true)"
if [ -n "$STEAM_API_KEY" ]; then
  kubectl -n "$NS" patch secret backend-secret --type merge \
    -p "{\"stringData\":{\"STEAM_API_KEY\":\"$STEAM_API_KEY\"}}"
else
  echo "No STEAM_API_KEY in .env: the app runs, Steam login returns 503."
fi

# Images are tagged :local, so a rebuild needs a restart to be picked up
kubectl -n "$NS" rollout restart deployment/backend deployment/frontend
kubectl -n "$NS" rollout status statefulset/postgres --timeout=180s
kubectl -n "$NS" rollout status deployment/backend --timeout=180s
kubectl -n "$NS" rollout status deployment/frontend --timeout=120s
kubectl -n "$NS" get pods

cat <<MSG

GameBuddy is running. To reach it, port-forward in another terminal:
  kubectl -n $NS port-forward svc/frontend 3000:80 &
  kubectl -n $NS port-forward svc/backend 3001:3001 4000:4000 &
then open http://localhost:3000
MSG
