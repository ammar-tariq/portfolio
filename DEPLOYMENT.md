# Deployment

Production pipeline for this portfolio:

```
git push origin main
  → GitHub Actions (CI)
  → Docker image build
  → GitHub Container Registry (GHCR)
  → SSH as `deploy` (not root)
  → Docker Compose on the VPS
  → Traefik (`proxy` network)
  → HTTPS site
```

The VPS does **not** build the app. It does **not** need Node.js or npm. It pulls an immutable image tagged with the Git commit SHA.

## Architecture

| Piece | Role |
| --- | --- |
| Next.js 16 App Router | Full-stack app (pages, `/admin`, API routes, server actions) |
| MongoDB Atlas | Content + analytics (external; not in Compose) |
| Cloudinary | Project images (external) |
| GitHub OAuth | Admin allowlist (`ADMIN_GITHUB_LOGIN`) |
| GHCR | Image registry `ghcr.io/<owner>/<repo>:<git-sha>` |
| Docker Compose | Runs the container on the VPS |
| Traefik | TLS, HTTP→HTTPS, routing on Docker network `proxy` |

There is no separate backend process, Redis, or in-container reverse proxy.

## Runtime

- **Node.js:** 22 (LTS image). App requires `>=20.9.0`.
- **Package manager:** npm (`package-lock.json`). Use `npm ci` in CI and Docker.
- **Port:** `3000` inside the container (`PORT`, default 3000).
- **Bind address:** `0.0.0.0` (`HOSTNAME`).
- **Health:** `GET /api/health` → `{ "status": "ok" }` (no auth, no database).

## Environment variables

Copy `.env.example` to `.env`. Never commit `.env`.

Server-only (never `NEXT_PUBLIC_`):

| Name | Required | Purpose |
| --- | --- | --- |
| `PORT` | no (default 3000) | Listen port |
| `HOSTNAME` | no (default `0.0.0.0` in Docker) | Bind address |
| `NODE_ENV` | set by Docker | Must be `production` in the container. Do not set it in a local `.env` used with `next dev`. |
| `SITE_HOST` | production | Traefik `Host()` rule. Production: `your-domain.com` |
| `PORTFOLIO_IMAGE` | set by Actions | Full GHCR image reference including SHA tag |
| `AUTH_URL` | yes | Public origin for Auth.js (`http://localhost:3000` locally, `https://<SITE_HOST>` in production) |
| `AUTH_SECRET` | yes | Auth.js secret (`openssl rand -base64 32`) |
| `AUTH_TRUST_HOST` | yes | `true` behind Traefik |
| `AUTH_GITHUB_ID` | yes | GitHub OAuth app client ID |
| `AUTH_GITHUB_SECRET` | yes | GitHub OAuth app client secret |
| `ADMIN_GITHUB_LOGIN` | yes | GitHub username allowed into `/admin` |
| `MONGODB_URI` | yes for CMS/analytics | Atlas connection string |
| `CLOUDINARY_URL` or `CLOUDINARY_*` | yes for screenshots | Cloudinary credentials |
| `GEMINI_API_KEY` | no | Admin “draft from notes” |
| `GEMINI_MODEL` | no | Defaults to `gemini-2.5-flash` |
| `NOTIFY_EMAIL` / `NOTIFY_FROM` / `SMTP_*` | no | Visit summary email |

There are no `NEXT_PUBLIC_` variables. Site URL in HTML/SEO comes from content (`profile.website` in Mongo or `src/data/profile.ts`).

## Local development

```bash
cp .env.example .env   # fill secrets; SITE_HOST is unused by `next dev`
npm ci
npm run seed           # once, if using Atlas + Cloudinary
npm run dev
```

- App: http://localhost:3000
- Admin: http://localhost:3000/admin
- OAuth callback: `http://localhost:3000/api/auth/callback/github`

Do not create `.env.local`. Without Mongo the UI falls back to `src/data/`.

## Production build (without Docker)

```bash
npm ci
npm run lint
npm run typecheck
npm run build
PORT=3000 npm run start
```

`npm run start` binds `0.0.0.0` and honors `PORT` (default 3000).

## Docker (local)

The image contains no secrets. Runtime config is passed with `-e` / `--env-file`.

```bash
docker build -t portfolio-test .
docker run --rm -p 3000:3000 --env-file .env portfolio-test
```

Then:

```bash
curl http://localhost:3000/
curl http://localhost:3000/api/health
```

Root `docker-compose.yml` is **local only** (builds the image and publishes `3000:3000`). Do not use it on the VPS.

## Health endpoint

`GET /api/health` returns HTTP 200:

```json
{ "status": "ok" }
```

Used by Docker `HEALTHCHECK` and the GitHub Actions deploy step. It does not query Mongo or external APIs.

## GHCR image naming

```
ghcr.io/<github-owner>/<repository-name>:<git-sha>
```

Example shape (not a real tag):

```
ghcr.io/owner/portfolio:0123456789abcdef0123456789abcdef01234567
```

The SHA tag is the production version. `latest` is not used. Rollback means redeploying a previous SHA.

## GitHub Actions

File: `.github/workflows/deploy.yml`

**Trigger (only this):**

```yaml
on:
  push:
    branches:
      - main
```

A merge into `main` is a push to `main` and will deploy. Pushes to `develop`, feature branches, tags, and pull requests do nothing.

**Concurrency:** `production-deploy` with `cancel-in-progress: true`. If commit A is still deploying and commit B is pushed to `main`, A is cancelled and B becomes the deployment that matters.

**Job steps:**

1. Checkout
2. Node.js 22
3. `npm ci`
4. `npm run lint`
5. `npm run typecheck`
6. `npm run build`
7. Docker build
8. Push `ghcr.io/<owner>/<repo>:<GITHUB_SHA>`
9. Copy `deploy/docker-compose.yml` to `/opt/apps/portfolio/production`
10. SSH as `VPS_USER`, pull that exact image, `docker compose up -d` (no `compose down`)
11. `GET /api/health` inside the container until it passes

Permissions: `contents: read`, `packages: write`. GHCR auth uses `GITHUB_TOKEN`.

## Required GitHub setup

Repository settings:

1. **Actions → General → Workflow permissions:** Read and write (so `GITHUB_TOKEN` can push to GHCR), and allow GitHub Actions to create/approve PRs is **not** required.
2. **Packages:** after the first successful push, ensure the GHCR package is bound to this repository. If the repo is private, keep the package private; the deploy step logs into GHCR on the VPS with `GITHUB_TOKEN`.

Secrets (Actions → Secrets):

| Secret | Value |
| --- | --- |
| `VPS_HOST` | VPS hostname or IP |
| `VPS_USER` | SSH user (`deploy`, never `root`) |
| `VPS_SSH_KEY` | Private key for that user |

Do not put application secrets (`AUTH_SECRET`, `MONGODB_URI`, Cloudinary, SMTP) in GitHub unless you later choose to. They belong in `/opt/apps/portfolio/production/.env` on the VPS.

## VPS expectations

Prepare these **once** (this repository does not SSH in or create them):

- Ubuntu with Docker, Docker Compose, and Traefik already running
- External Docker network named `proxy` (Traefik attached, `exposedByDefault: false`)
- Deploy user `deploy` in the `docker` group
- Directory `/opt/apps/portfolio/production` owned by `deploy`
- File `/opt/apps/portfolio/production/.env` with production values, including:
  - `SITE_HOST` — public hostname (no scheme)
  - `AUTH_URL=https://<SITE_HOST>`
  - `AUTH_TRUST_HOST=true`
  - `AUTH_SECRET`, GitHub OAuth, `ADMIN_GITHUB_LOGIN`
  - `MONGODB_URI`, Cloudinary
- GitHub OAuth callback: `https://<SITE_HOST>/api/auth/callback/github`
- Traefik: entrypoint `websecure`, resolver `letsencrypt`, global HTTP→HTTPS redirect

The container listens on `0.0.0.0:3000` with HTTP only. Traefik terminates TLS.

`www.<SITE_HOST>` is routed by the same router and permanently redirected to the apex domain by the `portfolio-www` redirectregex middleware (canonical URL for SEO).

## Rollback

The deploy job captures the currently running image before updating. If `/api/health` does not pass, it restores that previous image with `docker compose up -d --pull never` (the old image is not deleted) and fails the GitHub job so the last working version stays up. If this is the first deploy and there is no previous image, the job fails without inventing a rollback target.

Manual rollback to a known SHA:

```bash
export PORTFOLIO_IMAGE=ghcr.io/<owner>/<repo>:<old-sha>
docker pull "$PORTFOLIO_IMAGE"
docker compose up -d --pull never
```

Or revert `main` to that commit and push (the workflow will deploy that SHA).

## Troubleshooting

| Symptom | Check |
| --- | --- |
| Workflow never runs | Confirm the push was to `main`. Other branches are ignored. |
| GHCR push 403 | Workflow permissions must be read/write; `packages: write` is already in the YAML. |
| SSH fails | `VPS_HOST` / `VPS_USER` / `VPS_SSH_KEY`; user `deploy` must be able to SSH and run Docker. |
| Compose copy fails | Directory `/opt/apps/portfolio/production` must already exist. |
| Container starts, Traefik 404 | `SITE_HOST` must match the public hostname; container must be on `proxy`; `traefik.enable=true`. |
| Health check fails | `docker compose logs portfolio`; confirm `/api/health` inside the container. |
| OAuth redirect mismatch | GitHub app callback and `AUTH_URL` must be `https://<SITE_HOST>`. |
| Admin 403 | `ADMIN_GITHUB_LOGIN` must match the GitHub username (case-insensitive). |
| Images 404 | Cloudinary env vars; seed is a one-time local/ops task, not part of CI. |
| Mongo `Invalid scheme` with `docker run --env-file` | `docker run --env-file` does not strip quotes. Compose on the VPS does. Use unquoted values for `docker run`, or keep quotes only in Compose `.env`. |

Logs go to container stdout/stderr (`docker compose logs -f portfolio`). Nothing is written to log files inside the image.
