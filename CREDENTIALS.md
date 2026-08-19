# Credentials

How to create every secret and ID this app uses. Paste values into `.env` locally and into the production `.env` next to Compose on the server (path in `LOCAL.md`, gitignored). Never commit `.env`. Do not create `.env.local`. There are no `NEXT_PUBLIC_*` variables; Docker build does not need these keys.

After changing `.env`, restart `npm run dev` or the production container.

---

## Checklist

| Variable | Required | Used for |
| --- | --- | --- |
| `AUTH_URL` | yes | Auth.js origin |
| `AUTH_SECRET` | yes | Session encryption |
| `AUTH_TRUST_HOST` | yes | `true` behind Traefik / localhost |
| `AUTH_GITHUB_ID` | yes | Admin GitHub login |
| `AUTH_GITHUB_SECRET` | yes | Admin GitHub login |
| `ADMIN_GITHUB_LOGIN` | yes | Allowlisted GitHub username |
| `MONGODB_URI` | yes for CMS | Atlas |
| `CLOUDINARY_URL` or `CLOUDINARY_*` | yes for your own uploads | Cloudinary |
| `GITHUB_TOKEN` | no | Rate-limit GitHub API / contribution graph |
| `GEMINI_API_KEY` | no | Drafts, rewrites, job-application copy |
| `GEMINI_MODEL` | no | Default `gemini-2.5-flash` |
| `GTM_CONTAINER_ID` | no | Tag Manager (skipped if GA4 is set) |
| `GA_MEASUREMENT_ID` | no | GA4 gtag; if set, GTM is not injected |
| `SMTP_*` / `NOTIFY_*` | no | Visit emails; SMTP send fallback |
| `FIREBASE_*` | no | Admin push (visits, digest, application replies) |
| `GMAIL_CLIENT_*` / `GMAIL_REFRESH_TOKEN` / `GMAIL_USER` | no | Send applications + sync replies |
| `GMAIL_SYNC_SECRET` | with Gmail API | Internal sync/push routes |
| `GMAIL_PUBSUB_TOPIC` | no | Instant Gmail push (poll works without it) |
| `USAJOBS_API_KEY` / `USAJOBS_USER_AGENT` | no | Admin job-search USAJOBS adapter |
| `JOB_POLL_LOOP` | no | `1` to poll listings in `next dev`; production on unless `0` |
| `SITE_HOST` | production | Traefik hostname (no `https://`) |
| `VPS_HOST` / `VPS_USER` / `VPS_SSH_KEY` / `VPS_APP_DIR` | production | GitHub Actions deploy secrets |

---

## 1. Auth secret

```bash
openssl rand -base64 32
```

```env
AUTH_SECRET=paste_here
AUTH_TRUST_HOST=true
AUTH_URL=http://localhost:3000
```

Production:

```env
AUTH_URL=https://your-domain.com
AUTH_TRUST_HOST=true
```

Use a **different** `AUTH_SECRET` on the VPS than locally if you want. Never reuse it as `GMAIL_SYNC_SECRET`.

---

## 2. GitHub OAuth (admin login)

Admin is GitHub OAuth, allowlisted to one username.

1. Open [https://github.com/settings/developers](https://github.com/settings/developers)
2. **OAuth Apps → New OAuth App**
3. **Application name:** `portfolio-admin` (anything)
4. **Homepage URL:**
   - Local app: `http://localhost:3000`
   - Production app: `https://your-domain.com`
5. **Authorization callback URL** (must match exactly):
   - Local: `http://localhost:3000/api/auth/callback/github`
   - Production: `https://your-domain.com/api/auth/callback/github`
6. **Register application**
7. Copy **Client ID** → `AUTH_GITHUB_ID`
8. **Generate a new client secret** → `AUTH_GITHUB_SECRET`

GitHub allows multiple callback URLs on one OAuth app. Add both local and production callbacks on the same app, or create two apps and put the matching pair in each `.env`.

```env
AUTH_GITHUB_ID=Ov23li...
AUTH_GITHUB_SECRET=...
ADMIN_GITHUB_LOGIN=your-github-username
```

`ADMIN_GITHUB_LOGIN` is the GitHub **login** (not display name), case-insensitive. Anyone else who signs in is denied.

---

## 3. GitHub PAT (optional)

Public contribution calendar works without this. A token avoids GitHub rate limits for imports and the graph.

1. [https://github.com/settings/tokens](https://github.com/settings/tokens)
2. **Generate new token (classic)**
3. Note: `portfolio graph`
4. Expiration: your choice
5. Scopes: `public_repo` is enough for public data. Fine-grained: read access to public repos / the user.
6. Generate → copy once → `GITHUB_TOKEN`

```env
GITHUB_TOKEN=github_pat_...
```

---

## 4. MongoDB Atlas

1. [https://cloud.mongodb.com/](https://cloud.mongodb.com/) → sign in → **Create project** if needed
2. **Create cluster** (M0 free is fine)
3. **Database Access → Add new database user**
   - Password auth
   - Username + strong password (avoid `@ : / ? #` in the password, or URL-encode them)
   - Role: **Atlas admin** or **readWrite** on the `portfolio` database
4. **Network Access → Add IP address**
   - Local: your current IP, or `0.0.0.0/0` while developing
   - VPS: the VPS public IP, or `0.0.0.0/0` if the IP changes
5. **Clusters → Connect → Drivers → Node.js**
6. Copy the URI. Set the database name to `portfolio`:

```env
MONGODB_URI=mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/portfolio?retryWrites=true&w=majority
```

Compose on the VPS strips quotes. `docker run --env-file` does **not** — use unquoted values there.

Seed once:

```bash
npm run seed
```

---

## 5. Cloudinary (your own uploads)

Store import **hotlinks** Apple/Google screenshot URLs. Cloudinary is only for files you upload in admin (app icon, banner, extra screenshots, video).

1. [https://console.cloudinary.com/](https://console.cloudinary.com/) → sign up
2. Dashboard → **API Keys**
3. Copy **Cloud name**, **API Key**, **API Secret**

Either the URL **or** the three fields:

```env
CLOUDINARY_URL=cloudinary://API_KEY:API_SECRET@CLOUD_NAME
CLOUDINARY_CLOUD_NAME=CLOUD_NAME
CLOUDINARY_API_KEY=API_KEY
CLOUDINARY_API_SECRET=API_SECRET
```

---

## 6. Gemini (Google AI Studio)

Used for project drafts, field rewrites, and job-application resume / letter / screening answers.

1. [https://aistudio.google.com/apikey](https://aistudio.google.com/apikey)
2. Sign in with Google
3. **Create API key** (pick or create a Google Cloud project)
4. Copy → `GEMINI_API_KEY`

```env
GEMINI_API_KEY=AIza...
GEMINI_MODEL=gemini-2.5-flash
```

`GEMINI_MODEL` is optional. Leave the default unless you change models in AI Studio.

---

## 7. Google Tag Manager and GA4

IDs appear in page source. Still do not commit them; put them in `.env` only.

**One Google tag per page.** If `GA_MEASUREMENT_ID` is set, GTM is **not** injected. Prefer either:

- GA4 gtag only, or
- GTM only, with GA4 added **inside** Tag Manager (not a second snippet in HTML)

### 7a. GA4 (gtag.js)

1. [https://analytics.google.com/](https://analytics.google.com/) → **Admin → Data streams → Web**
2. Create a web stream for your domain if needed
3. Copy **Measurement ID** (`G-XXXXXXXX`)

```env
GA_MEASUREMENT_ID=G-XXXXXXXX
```

The root layout injects the official gtag snippet immediately after `<head>` on every page.

### 7b. Tag Manager (optional; skipped when GA4 is set)

1. [https://tagmanager.google.com/](https://tagmanager.google.com/) → **Create account / container** → Web
2. Copy container ID (`GTM-XXXXXXX`)

```env
GTM_CONTAINER_ID=GTM-XXXXXXX
```

To use GTM **and** GA4 without double-counting: add the GA4 stream as a tag inside GTM, set `GTM_CONTAINER_ID`, and **clear** `GA_MEASUREMENT_ID`.

Put the same IDs on the VPS `.env`.

---

## 8. Gmail SMTP (visit emails + send fallback)

SMTP can send mail. It **cannot** sync recruiter replies (no Gmail `threadId`). Use an **App Password**, not your Gmail login password.

1. Google Account → [https://myaccount.google.com/security](https://myaccount.google.com/security)
2. Turn on **2-Step Verification**
3. [https://myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
4. App: Mail → Device: Other → `portfolio`
5. Copy the 16-character password (spaces optional; the app strips them)

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=you@gmail.com
SMTP_PASS=xxxx xxxx xxxx xxxx
NOTIFY_EMAIL=you@gmail.com
NOTIFY_FROM=you@gmail.com
NOTIFY_TZ=Asia/Karachi
NOTIFY_DIGEST_HOUR=21
```

`NOTIFY_EMAIL` is where visit summaries go. `NOTIFY_FROM` is the From header.

Production already runs the daily digest loop. Locally, set `NOTIFY_DIGEST_LOOP=1` only if you want it in `next dev`.

---

## 9. Gmail API (send applications + sync replies)

SMTP is not enough for thread tracking. You need OAuth with **both** scopes.

You will end with:

```env
GMAIL_CLIENT_ID=....apps.googleusercontent.com
GMAIL_CLIENT_SECRET=GOCSPX-....
GMAIL_REFRESH_TOKEN=1//0....
GMAIL_USER=you@gmail.com
GMAIL_SYNC_SECRET=64-char-hex
```

Use the **same Google account** as the mailbox you send from.

### 9a. Google Cloud project

1. [https://console.cloud.google.com/](https://console.cloud.google.com/)
2. Project picker → **New project** → name e.g. `portfolio` → **Create**
3. Wait until that project is selected in the top bar

### 9b. Enable Gmail API

1. [https://console.cloud.google.com/apis/library/gmail.googleapis.com](https://console.cloud.google.com/apis/library/gmail.googleapis.com)
2. Confirm the project name
3. **Enable**

### 9c. OAuth consent screen (Google Auth Platform)

Google splits this into Branding / Audience / Data access / Clients.

**Branding** — [https://console.cloud.google.com/auth/overview](https://console.cloud.google.com/auth/overview)

1. **Get started** if prompted
2. User type: **External** (personal Gmail). **Internal** is Workspace-only.
3. App name: `portfolio apply`
4. User support email: your Gmail
5. Developer contact: same Gmail
6. Skip logo, domain, privacy policy while **Testing**
7. **Save**

**Audience**

1. Publishing status: **Testing** (do not publish)
2. **Test users → Add users**
3. Add **exactly** the Gmail you send from
4. **Save**

If this address is missing, login later fails with `access_denied`.

**Data access (do not skip)**

1. **Add or remove scopes**
2. Search `Gmail` and check **both**:
   - `https://www.googleapis.com/auth/gmail.send`
   - `https://www.googleapis.com/auth/gmail.readonly`
3. Or **Manually add scopes** and paste those two URLs
4. **Update → Save**

A send-only token cannot sync replies. Stay in Testing; these are sensitive scopes.

### 9d. OAuth client ID + secret

1. [https://console.cloud.google.com/auth/clients](https://console.cloud.google.com/auth/clients)  
   or **APIs & Services → Credentials → Create credentials → OAuth client ID**
2. Application type: **Desktop app** (no redirect URI needed)
3. Name: `portfolio-gmail`
4. **Create**
5. Copy **Client ID** → `GMAIL_CLIENT_ID`
6. Copy **Client secret** → `GMAIL_CLIENT_SECRET`

If you already created a **Web** client, edit it and add Authorized redirect URI:

`https://developers.google.com/oauthplayground`

### 9e. Refresh token (OAuth Playground)

1. Open [https://developers.google.com/oauthplayground](https://developers.google.com/oauthplayground) (private window helps)
2. **Gear** (OAuth 2.0 configuration)
   - Check **Use your own OAuth credentials**
   - Paste Client ID and Client secret
   - OAuth flow: **Server-side**
   - Access type: **Offline** (required for a refresh token)
   - Turn **Force approval prompt** on if present
3. Step 1: expand **Gmail API v1** and check `gmail.send` and `gmail.readonly`, or paste the two scope URLs
4. **Authorize APIs**
5. Pick the Test user Gmail
6. **Google hasn’t verified this app** → **Advanced** → **Go to portfolio apply (unsafe)**
7. Allow send + read
8. **Exchange authorization code for tokens**
9. Copy **Refresh token** only (`1//...`) → `GMAIL_REFRESH_TOKEN`  
   Do not store the access token.

**If `refresh_token` is missing:** [https://myaccount.google.com/permissions](https://myaccount.google.com/permissions) → remove the app → force consent → authorize again.

**`redirect_uri_mismatch`:** Web client missing the Playground redirect URI, or recreate as Desktop.

**`access_denied`:** wrong account, or not in Test users.

**`invalid_client`:** wrong ID/secret, or different Cloud project than the one with Gmail API enabled.

```env
GMAIL_USER=you@gmail.com
```

Must be the account that clicked Allow.

### 9f. Sync secret

Not from Google:

```bash
openssl rand -hex 32
```

```env
GMAIL_SYNC_SECRET=paste_openssl_output
```

Leave `GMAIL_PUBSUB_TOPIC` empty. Production polls every 15 minutes; admin has a **Sync** button.

### 9g. Optional Pub/Sub (instant inbox push)

Skip unless you want near-real-time replies.

1. Same Cloud project → enable **Cloud Pub/Sub API**
2. **Topics → Create topic** named `gmail-push`
3. Topic **Permissions → Grant access**
   - Principal: `gmail-api-push@system.gserviceaccount.com`
   - Role: **Pub/Sub Publisher**
4. **Subscriptions → Create**
   - Topic: `gmail-push`
   - Delivery: **Push**
   - Endpoint: `https://your-domain.com/api/internal/gmail-push?token=YOUR_GMAIL_SYNC_SECRET`

```env
GMAIL_PUBSUB_TOPIC=projects/YOUR_PROJECT_ID/topics/gmail-push
```

Watch expires ~7 days; production renews it on the 15-minute loop. Locally `GMAIL_SYNC_LOOP=1` to run the loop in `next dev`.

### 9h. Verify Gmail API

1. Restart the app
2. `/admin/applications` → open one → **Send** to yourself
3. Mail appears in Gmail Sent
4. Reply from another mailbox
5. **Sync** → snippet on the application

If Sync says the token needs `gmail.readonly`, redo 9e with both scopes and replace `GMAIL_REFRESH_TOKEN`.

---

## 10. Firebase Cloud Messaging (admin push)

Admin-only. Public visitors never get a prompt. After keys are set: sign into `/admin` → **Enable push**. iPhone: add the **admin** page to the Home Screen first.

Same Google Cloud project as Gmail is fine.

```env
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
FIREBASE_WEB_API_KEY=
FIREBASE_WEB_APP_ID=
FIREBASE_MESSAGING_SENDER_ID=
FIREBASE_VAPID_KEY=
```

Optional: `FIREBASE_AUTH_DOMAIN` (defaults to `PROJECT_ID.firebaseapp.com`).

### 10a. Project + web app

1. [https://console.firebase.google.com/](https://console.firebase.google.com/) → **Add project** (or use the existing Cloud project)
2. Gear → **Project settings → General → Your apps → Add app → Web**
3. Nickname: `portfolio-admin` (skip Analytics if you want)
4. Copy:
   - Project ID → `FIREBASE_PROJECT_ID`
   - **apiKey** → `FIREBASE_WEB_API_KEY`
   - **appId** → `FIREBASE_WEB_APP_ID`
   - **messagingSenderId** → `FIREBASE_MESSAGING_SENDER_ID`

### 10b. VAPID (Web Push certificate)

1. **Project settings → Cloud Messaging**
2. Enable **Cloud Messaging API (V1)** if asked
3. **Web Push certificates → Generate key pair**
4. Copy the key → `FIREBASE_VAPID_KEY`

### 10c. Service account (server send)

1. **Project settings → Service accounts → Generate new private key** → JSON download
2. From the JSON:
   - `client_email` → `FIREBASE_CLIENT_EMAIL`
   - `private_key` → `FIREBASE_PRIVATE_KEY`

Keep the `-----BEGIN PRIVATE KEY-----` block. In `.env` wrap the key in double quotes, or use a single line with `\n` (the app expands `\n` to real newlines).

Push is used for: visit sessions (instead of email when a device token exists), daily digest at `NOTIFY_DIGEST_HOUR`, and application inbox classifications.

---

## 11. Production-only (not in local `.env`)

```env
SITE_HOST=your-domain.com
PORT=3000
HOSTNAME=0.0.0.0
```

`SITE_HOST` is the Traefik Host() rule: hostname only, no scheme.

`PORTFOLIO_IMAGE` is set by GitHub Actions on deploy. Do not set it locally.

### GitHub Actions secrets

Repo → **Settings → Secrets and variables → Actions**:

| Secret | Value |
| --- | --- |
| `VPS_HOST` | VPS hostname or IP |
| `VPS_USER` | SSH user (non-root, in the `docker` group) |
| `VPS_SSH_KEY` | Private key for that user |
| `VPS_APP_DIR` | Absolute path to the Compose directory on the server |

Application secrets stay on the VPS `.env`, not in GitHub.

Also: **Actions → General → Workflow permissions → Read and write** so `GITHUB_TOKEN` can push to GHCR.

---

## 12. USAJOBS (optional job search)

Used only by **Admin → Job search**. Most discovery sources need **no key** (Greenhouse, Lever, Ashby, Remote OK, Remotive, Himalayas, Arbeitnow, We Work Remotely RSS). Company board tokens live in Mongo, not `.env`.

USAJOBS is official and free. Eligibility for a Pakistan-based applicant is usually low; listings are still ingested and ranked down, never hidden.

1. Open [https://developer.usajobs.gov/apirequest/](https://developer.usajobs.gov/apirequest/)
2. Request an API key. Describe use as a personal job-search tracker (no commercial resale of the feed).
3. When the key arrives:

```env
USAJOBS_API_KEY=paste_key
USAJOBS_USER_AGENT=you@gmail.com
```

`USAJOBS_USER_AGENT` should be the email they associate with the key (their docs send it as User-Agent). Leave both empty to skip this adapter.

Local polling is off unless:

```env
JOB_POLL_LOOP=1
```

Production polls about every 20 minutes unless `JOB_POLL_LOOP=0`. You can always press **Poll now** on `/admin/jobs`.

Do **not** create LinkedIn, Indeed, Greenhouse Job Board (apply) keys, or spray-apply SaaS accounts for this module.

---

## 13. Search Console / Bing (not env)

Paste verification tokens in **Admin → SEO**. They live in Mongo, not `.env`. Then submit `https://your-domain.com/sitemap.xml`.

---

## Where to put what

| Place | File |
| --- | --- |
| Laptop | project `.env` (`AUTH_URL=http://localhost:3000`) |
| Server | production `.env` next to Compose (`AUTH_URL=https://SITE_HOST`). Real path: `LOCAL.md` |
| GitHub | `VPS_*` only (including `VPS_APP_DIR`) |
| Git | `.env.example` placeholders only |

Copy from `.env.example`. After Gmail or Firebase keys, restart. After production `.env` changes, restart the container.
