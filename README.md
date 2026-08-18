# Portfolio

Full-stack personal site: Next.js 16, MongoDB Atlas, Cloudinary, and a GitHub-gated `/admin` dashboard. All site content lives in MongoDB — not in this repo. Project screenshots are not stored in Git.

## Run locally

1. Copy `.env.example` to `.env` (only this file — do not create `.env.local`).
2. Fill `MONGODB_URI`, `AUTH_SECRET` (`openssl rand -base64 32`), GitHub OAuth app credentials, `ADMIN_GITHUB_LOGIN`, and Cloudinary keys.
3. GitHub OAuth callback for local: `http://localhost:3000/api/auth/callback/github`.
4. Seed the database, then run:

```bash
npm install
npm run seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Dashboard: [http://localhost:3000/admin](http://localhost:3000/admin).

Content is served from MongoDB. `npm run seed` restores from a private snapshot at `seed-data/site-content.json` (gitignored) if present, and otherwise seeds the placeholder/example data in `src/data/`. Use `npm run export-content` to (re)generate the snapshot from a live database. Without Mongo, the UI renders the placeholder data in `src/data/`.

## Dashboard

`/admin` is GitHub OAuth, allowlisted to `ADMIN_GITHUB_LOGIN`. From there you can edit projects, experience, skills, philosophy, architecture, about/social, SEO (including Google Search Console / Bing verification tokens), and view first-party analytics (page, referrer, country/city from IP — no browser location permission).

Share previews (WhatsApp, iMessage, Slack, Discord, LinkedIn, X, Telegram) use Open Graph tags and a Cloudinary `1200×630` JPEG. Paste your Search Console verification token under **SEO**, then submit `https://your-domain.com/sitemap.xml`.

## Production

Pushes to `main` run CI, publish a SHA-tagged image to GHCR, and deploy over SSH to Docker Compose behind Traefik. Other branches do not deploy.

See [DEPLOYMENT.md](DEPLOYMENT.md) for environment variables, GitHub secrets, VPS layout (`/opt/apps/portfolio/production`), and rollback.

GitHub OAuth callback: `https://your-domain.com/api/auth/callback/github`.

Project images live on Cloudinary. They are not in this repo. Git history of older commits may still contain `public/projects/` until you rewrite history (force-push) if you want that gone too.

## Colors


The whole site is token-driven. Edit `src/app/globals.css`.

- `:root` — dark theme (default)
- `html.light` — light theme

The ones that matter most:

| Token | Role |
| --- | --- |
| `--bg` / `--bg-elevated` / `--bg-soft` | Surfaces |
| `--fg` / `--muted` / `--subtle` | Text |
| `--accent` / `--accent-2` | Links, highlights, focus |
| `--wash-1` / `--wash-2` | Page background glows |
| `--line` / `--line-strong` | Borders |

Tailwind classes like `bg-bg`, `text-fg`, `text-accent` map to these in the `@theme inline` block. Change the CSS variables; you rarely need to touch components.

A few extras if the accent still looks off after a palette swap:

- `.spot` in `globals.css` — cursor follow glow (hardcoded rgba)
- `src/components/spatial/spatial-scene.tsx` — 3D lights / dust
- `src/components/spatial/models/atom.tsx` — orbit ring colors
- `src/app/layout.tsx` — `themeColor` in the viewport export

Electron labels in the atom use brand colors (React blue, Node green, etc.). Leave those unless you want them to match the site accent too.

Fonts are in `src/app/layout.tsx` (Geist, Geist Mono, Instrument Serif).

## Notes

- `⌘K` / `Ctrl+K` opens the command palette.
- Press `` ` `` for a small terminal easter egg.
- Custom cursor is desktop / fine-pointer only and respects `prefers-reduced-motion`.
- The 3D hero is skipped on touch devices and when reduced motion is requested.

---

## Agent prompt

Copy this into Cursor / Claude / Codex if you want a similar site — a variation of this one, not a generic template. Fill in the bracketed bits. Swap the accent and the atom labels; keep the system.

```
Build a senior-engineer personal site. Calm, precise, dark-first. Not a SaaS landing page, not a Dribbble clone, not a three.js playground with a bio taped on.

Stack
- Next.js App Router, React, TypeScript, Tailwind CSS v4 (CSS-first @theme tokens — no long tailwind.config)
- Motion (scroll, hover, overlays). Lenis for smooth scroll.
- lucide-react for icons.
- React Three Fiber + drei for ONE hero scene only. Dynamic import, ssr: false. Skip entirely on touch and prefers-reduced-motion.

Look
- Fonts: Geist (sans), Geist Mono, Instrument Serif. Mono uppercase eyebrows with wide tracking + accent color. Serif for section titles and last name. Sans for first name and body.
- Colors in globals.css: :root (dark, default) and html.light. Tokens: --bg, --bg-elevated, --bg-soft, --fg, --muted, --subtle, --accent, --accent-2, --accent-soft, --glow, --wash-1, --wash-2, --line, --line-strong. Map them in @theme inline (bg-bg, text-fg, text-accent).
- Reference palette (change it): dark bg #05070c, fg #f3f6fa, accent #4fbbf2 / #1558d2. Light is a washed paper blue, not pure white.
- Full-page grain overlay. Hero has a faint masked grid. A pointer-follow spotlight (--spot-x / --spot-y). Soft radial washes on the body, not loud gradients.
- Floating pill nav: logo left, Portfolio / Experience / Skills / About center, theme toggle + ⌘K + solid Contact pill right. Compact on scroll. Backdrop blur.
- Pill buttons, magnetic on desktop. Custom cursor on fine-pointer desktop only (dot that grows on links, “View” on case studies). Hide it on the 3D canvas.
- Theme in localStorage with a tiny blocking <head> script so it doesn’t flash.

Hero (full viewport)
- Left: mono title, then first name huge sans, last name huge serif, slightly different pointer parallax on each line. Headline, two CTAs (View portfolio / Contact), then location · years · availability in mono.
- Right / background: a 3D atom. Glowing nucleus (TypeScript or a core skill). Three elliptical orbits = clients / backend / data. Small labeled electrons (React, Native, Next, Node, Nest, LLM, PG, Mongo, Redis, …) using each tech’s brand color. Clicking a label smooth-scrolls to #skill-{category}. Scene reacts to pointer and shrinks slightly on scroll. Stars + dust in dark mode only.
- “Scroll” hint, bottom-center accent line.

Page
One long homepage, one SiteShell: Hero → Portfolio → Experience → Identity (practice diagram) → Architecture → AI → Skills → Philosophy → About → GitHub → Contact.
Also: /work index, /work/[slug] case studies, /resume (printable), sitemap, robots, opengraph-image, /llms.txt generated from the same data.

Section patterns (this is the product, not decoration)
- Every section: mono eyebrow, serif title, optional muted kicker. max-w-6xl container, lots of vertical air.
- Portfolio: featured case studies as alternating two-column rows (visual / copy). Giant 01 02 03 in faded serif. Generated abstract visuals per project — no screenshots. Click opens a full-page overlay (challenge / solution / architecture / outcome). Overlay also has a real /work/[slug] page for crawlers. Remaining projects as a quieter list.
- Experience: left = year timeline with a glowing active dot; right = role, bullets, tech, chips that open associated projects.
- Identity + Architecture + AI: clickable node diagrams (rounded nodes, connectors, a detail panel). Identity = one spine, four surfaces. Architecture = clients → API → data → infra. AI = user → product → orchestration → model → tools → result. Selecting a node updates copy; don’t animate a fake graph.
- Skills: cards with chips. Give each card id="skill-{id}" so the atom can jump here.
- Philosophy: 4–6 principle cards (title, one-line statement, short body).
- GitHub: fetch public repos, fall back to a static list in data.
- Contact: channel rows (email, WhatsApp, Calendly, LinkedIn, GitHub…) with copy-to-clipboard on email. Floating Connect FAB. Footer repeats the links.
- Command palette (⌘K / Ctrl+K) from a commands.ts list. Optional backtick terminal easter egg (whoami, portfolio, contact).

Content
ALL copy in src/data/: profile, social, projects, experience, skills, philosophy, architecture, github, commands. Components only render. Don’t invent case-study outcomes — empty optional fields are fine.
Nav label is “Portfolio” (href #portfolio). Keep /work URLs for pages.

My details
- Name: [first] [last]
- Title: [title]
- Location / availability / years: [...]
- Email, LinkedIn, GitHub, Calendly, site URL: [...]
- Accent if not icy blue: [hex]
- Atom electrons / skill groups: [your stack]
- Real projects and jobs: [paste bullets, or leave gaps]

Constraints
Keep it small: one shell, data files, CSS tokens. No CMS, no shadcn kitchen sink, no extra 3D scenes, no fake metrics. Respect reduced motion everywhere. Ship a site someone would actually send a hiring manager.
```
