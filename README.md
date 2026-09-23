# GameBuddy

Match with other Steam players who own the same games and share your free
time, then chat in a session room. PERN stack: PostgreSQL, Express, React, Node.

```
Backend/    Express REST API (:3001) + Socket.IO chat server (:4000)
Frontend/   React (Create React App), served by nginx in Docker
```

This repo holds the application code, Dockerfiles and docker-compose.
Kubernetes manifests live in
[minnal-a/gamebuddy-gitops](https://github.com/minnal-a/gamebuddy-gitops),
which Argo CD watches.

## Run with Docker

```bash
cp .env.example .env      # add your STEAM_API_KEY for Steam login
docker compose up --build
```

Open http://localhost:3000. Postgres starts with the schema from
`Backend/gb-schema.sql` loaded on first run (data lives in the `db-data`
volume; `docker compose down -v` resets it).

Without `STEAM_API_KEY` the app still starts, but `/auth/steam` returns 503.

## Configuration

Backend (set in `docker-compose.yml`):

| Variable | Default | Purpose |
|---|---|---|
| `DATABASE_URL` | `gamebuddy` | Postgres connection string |
| `DATABASE_SSL` | on when `NODE_ENV=production` | `false` for a local/compose Postgres |
| `SECRET_KEY` | `secret-dev` | JWT signing secret |
| `PORT` | `3001` | REST API port |
| `CHAT_PORT` | `4000` | Socket.IO chat port |
| `API_URL` | `http://localhost:3001` | Public API URL (Steam OpenID realm/return URL) |
| `FRONTEND_URL` | `http://localhost:3000` | Post-login redirect and chat CORS origin |
| `STEAM_API_KEY` | none | Steam Web API key |

Frontend (build args; Create React App bakes them into the bundle):

| Variable | Default |
|---|---|
| `REACT_APP_BASE_URL` | `http://localhost:3001` |
| `REACT_APP_CHAT_URL` | `http://localhost:4000` |

## Run on Kubernetes (kind)

See [gamebuddy-gitops](https://github.com/minnal-a/gamebuddy-gitops):
with both repos cloned side by side, `./scripts/kind-up.sh ../gamebud` from
the gitops repo builds these images and deploys them.

## CI/CD

`.github/workflows/ci.yml` runs on every push to `main`:

1. **Test**: `npm run test:ci` in `Backend/`
2. **Build + push**: backend and frontend images (linux/amd64 + arm64) to
   `ghcr.io/minnal-a/gamebuddy-{backend,frontend}:<commit SHA>`
3. **Deploy**: commits the new tag to
   [gamebuddy-gitops](https://github.com/minnal-a/gamebuddy-gitops)
   (`overlays/local/kustomization.yaml`), which Argo CD syncs

Needs an Actions secret `GITOPS_TOKEN`: a fine-grained personal access token
with **Contents: Read and write** on `minnal-a/gamebuddy-gitops` only.

### Tests

| Suite | Status |
|---|---|
| `Backend/helpers`, `Backend/middleware` (17 unit tests) | pass; run in CI |
| `Backend/models`, `Backend/routes`, `config.test.js`, `app.test.js` | fail: written for the Jobly template project (password/first_name columns, `jobly` DB) and never updated for GameBuddy |
| `Frontend/src/App.test.js` | fails: default Create React App test ("learn react"); Jest also cannot load axios' ES module |

## Run without Docker

```bash
createdb gamebuddy && psql gamebuddy < Backend/gb-schema.sql
cd Backend && npm install && npm start     # :3001 and :4000
cd Frontend && npm install && npm start    # :3000
```
