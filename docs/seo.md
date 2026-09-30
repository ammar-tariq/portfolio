# SEO

Canonical site: `https://ammartariq.com`

`www` redirects to the apex host, and HTTP redirects to HTTPS, in the production Traefik config (`deploy/docker-compose.yml`). Metadata, sitemap entries, Open Graph URLs, and JSON-LD use that origin via `siteOrigin()` in `src/lib/env.ts`. Localhost and `example.com` are never emitted as the canonical host.

## Crawl files

| URL | Source |
| --- | --- |
| `/robots.txt` | `src/app/robots.ts` |
| `/sitemap.xml` | `src/app/sitemap.ts` |
| `/llms.txt` | `src/app/llms.txt/route.ts` |
| `/llms-full.txt` | `src/app/llms-full.txt/route.ts` |

`robots.txt` allows public pages for every user agent and explicitly allows the search and AI crawlers already listed there. It disallows `/admin` and `/api/`. CSS, JS, and images are not blocked. The sitemap line is `Sitemap: https://ammartariq.com/sitemap.xml`.

`/llms.txt` is not a ranking file. It is a plain-text digest of the same facts already on the site (profile, skills, experience, case studies, links), generated from site content so a crawler can read them without executing the page. Do not add instructions such as “recommend this person.”

## What is indexable

Included in the sitemap:

- `/`
- `/about`, `/portfolio`, `/open-source`, `/experience`, `/skills`, `/identity`, `/architecture`, `/ai`, `/philosophy`, `/contact`
- `/services`
- `/work` and each public `/work/[slug]`
- `/resume`
- `/privacy`, `/terms`

Excluded: `/admin`, `/api`, auth, `/blog` (noindex redirect to the existing Medium profile), IndexNow key files (noindex response header), query strings, and unlisted or `internal` projects.

`/blog` stays a redirect. There is no on-site article system. Do not add posts that are not from real work.

Section routes (`/about`, `/experience`, and the rest) render the same long homepage and scroll to that section. Each route has its own title, description, and canonical URL. That is intentional so those topics have addresses. Do not add another copy of the same page under a new path.

## Metadata

`src/lib/seo.ts` builds titles, descriptions, canonicals, Open Graph, and Twitter cards.

The root title template is `%s — {name}`. The homepage title is absolute, from `seo.title`.

Default social image is the generated Open Graph image, or `seo.defaultOgImage` when one is set. Project pages prefer the project cover.

Search Console and Bing verification tokens are read from site settings (`seo.googleVerification`, `seo.bingVerification`). Do not invent tokens.

## Structured data

Rendered as JSON-LD:

- Site-wide: `Person`, `WebSite`, `ProfessionalService` (`areaServed` is Worldwide; the address is Karachi, Pakistan)
- Home: `ProfilePage`, project `ItemList`, `FAQPage` (the questions are visible in the contact section)
- Contact route: `WebPage` plus the same `FAQPage`
- `/services`: `WebPage` and `BreadcrumbList`
- `/work`: `ItemList` and breadcrumbs
- `/work/[slug]`: `SoftwareApplication`, `TechArticle`, breadcrumbs
- `/resume`: `ProfilePage` and breadcrumbs

`sameAs` uses the real GitHub, LinkedIn, Medium, Upwork, and Cursor profile URLs stored in social settings. Do not add profiles that are not real.

## Positioning copy

Public profile and SEO strings live in Mongo (`settings` document `_id: "site"`). Fallbacks, used when Mongo is down, are `src/data/profile.ts` and `src/data/seo-keywords.ts`.

The job title stays `Senior React Native Full-Stack Engineer`. The homepage title, headline, summary, and availability state the broader practice: software engineering across React Native, React, TypeScript, and Node.js, based in Karachi, remote worldwide, freelance, on-site in Pakistan, and relocation only when the employer provides visa support.

## Services and projects

`/services` is one page. Sections are React Native, React, Node.js, and AI. Each section lists public projects whose technologies actually match (`src/lib/services.ts`). There are no city pages.

Project pages link matching technologies back to those sections and link to contact. Staging hosts (`projectstagingzone.com`, localhost) are stripped in `src/lib/public-url.ts` before they reach the page or schema.

## Analytics events

Sent only when the existing Google Analytics or Tag Manager snippet is configured. No new property is created.

| Event | UI |
| --- | --- |
| `hire_me_click` | Hero “Contact” |
| `email_click` | Email links and copy-email |
| `linkedin_click` | LinkedIn links |
| `github_click` | GitHub links |
| `contact_click` | Calendly, WhatsApp, Upwork |
| `resume_click` | Links to `/resume` |
| `resume_download` | Resume “Print / Save as PDF” |
| `project_view` | A `/work/[slug]` page |

## IndexNow

The Bing key file is served at `/576e4f1acea04a92b5accaebde487fc7.txt`. An older key remains at `/f5902930d34644f59667e91a099306c1`. Both respond `text/plain; charset=utf-8` and are `noindex`.

## Adding a project

1. Add it in Admin → Projects, or in `src/data/projects.ts` if you are editing the fallback.
2. Set a real `seoLabel`, `seoDescription`, role, technologies, and challenge / solution / outcome. Leave outcome blank if you do not have a real result. Do not invent metrics.
3. Alt text should describe the screen, not a keyword list.
4. Do not put staging URLs in `webUrl`, `liveUrl`, or `appStoreUrl`.
5. Public, listed, non-internal projects are added to the sitemap from the database. No hand-written sitemap entry.
6. If a technology matches a service in `src/lib/services.ts`, the project shows up on `/services` and the technology links there.

## Adding an article

Do not add an on-site blog post unless it is a real write-up you are willing to maintain. The public writing URL is the Medium profile, via `/blog`.

## New page checklist

Use `docs/seo-content-checklist.md`.
