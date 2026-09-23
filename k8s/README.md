# Kubernetes (local, kind)

Manifests live in `base/`, one resource per file, applied with Kustomize.
They are kept apart from the app code so a GitOps tool can watch this folder
on its own.

## Prerequisites
Docker, [kind](https://kind.sigs.k8s.io/), kubectl.

## Up
```bash
./k8s/kind-up.sh
```
This creates the `gamebuddy` kind cluster, builds and loads the images, applies
`base/`, sets `STEAM_API_KEY` from `.env` if present, and waits for rollout.

## Reach the app (port-forward)
The frontend bundle calls the API at `localhost:3001` and chat at
`localhost:4000`, so forward all three:
```bash
kubectl -n gamebuddy port-forward svc/frontend 3000:80 &
kubectl -n gamebuddy port-forward svc/backend 3001:3001 4000:4000 &
open http://localhost:3000
```

## What's in base/
| File | Kind | Notes |
|---|---|---|
| `namespace.yaml` | Namespace | everything lives in `gamebuddy` |
| `configmap.yaml` | ConfigMap | non-secret settings (ports, URLs, DB name/user) |
| `postgres-secret.yaml` | Secret | DB password (local dev value only) |
| `backend-secret.yaml` | Secret | JWT secret; Steam key patched in from `.env` |
| `postgres-init-configmap.yaml` | ConfigMap | schema, generated from `Backend/gb-schema.sql` |
| `postgres-pvc.yaml` | PersistentVolumeClaim | 1Gi for the data directory |
| `postgres-statefulset.yaml` | StatefulSet | Postgres 16, stable identity + storage |
| `postgres-service.yaml` | Service (headless) | DNS name `postgres` |
| `backend-deployment.yaml` | Deployment | API :3001 + chat :4000, waits for Postgres |
| `backend-service.yaml` | Service | ClusterIP, ports 3001/4000 |
| `frontend-deployment.yaml` | Deployment | nginx serving the React build |
| `frontend-service.yaml` | Service | ClusterIP, port 80 |

## Down
```bash
kind delete cluster --name gamebuddy
```
