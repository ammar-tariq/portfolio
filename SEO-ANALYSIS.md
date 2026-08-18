# SEO analysis review

A review of a ChatGPT write-up of this site. No code was changed for this note.

The write-up’s core diagnosis is right. The checklist of “what to focus on” mostly describes work this site has already done.

---

## Verdict

ChatGPT treated this like a typical new personal site that understands itself well but has not been discovered yet. That split is real.

The part that does not hold up is the implication that robots, sitemap, canonicals, titles, Open Graph, and Person / WebSite / ProfilePage schema are the next jobs. Those are already in the codebase.

**Useful sentence from the write-up:** turn an already-strong portfolio into an indexed person entity plus a searchable project knowledge base.

**Correction:** the site is already most of the way there on-page. The unfinished work is indexing, citations, and making the existing `/work` URLs the thing people (and Google) land on.

---

## What ChatGPT got right

- **Do not redesign the visual site for SEO.** The content and entity signals are already strong.
- **Discovery and trust are the bottleneck**, not “Google cannot parse the page.” A new personal domain with little inbound citation will sit in Search Console as crawled / discovered / not indexed no matter how good the HTML is.
- **The homepage is doing too many jobs as a ranking URL.** Experience, skills, projects, philosophy, and FAQ all live on `/`. Google and LLMs can read that. They cannot assign “React Native case study” or “career history” to a unique URL if the only public surfaces are `/` plus hash sections (`#portfolio`, `#experience`, `#skills`).
- **Project pages should be independently rankable.** That is the highest-leverage on-site idea in the write-up.
- **Entity consistency matters more than more homepage copy.** Same name, same profiles, same site. `sameAs` already points at GitHub, LinkedIn, Medium, Upwork, and Cursor. Off-site citations that use the same name and URL are what still have to happen.
- **LLM / entity foundation is strong.** Stronger than the write-up knows: `llms.txt`, brand-free `seoLabel` / `seoDescription`, crawler fallback HTML, FAQPage, and a Person graph are already there.

---

## What it listed as next work that is already built

| It said to focus on | What the site already has |
| --- | --- |
| `robots.txt` | Generated, allows Google/Bing plus major LLM crawlers, blocks `/admin` and `/api`, points at the sitemap |
| `sitemap.xml` | Home, `/work`, `/resume`, legal pages, and every public `/work/[slug]` with real `lastmod` |
| Canonical URLs | Set per route |
| Title / meta on important pages | Home, `/work`, `/work/[slug]`, `/resume`, privacy, terms |
| Open Graph / Twitter | Per-route, plus a generated OG image |
| Person + WebSite + ProfilePage JSON-LD | Site-wide graph plus homepage ProfilePage |
| Project schema | `SoftwareApplication` + breadcrumbs on each case study |
| Search Console / Bing tokens | Admin SEO fields already exist; remaining work is verification and coverage, not code |

The technical foundation is closer to **strong** than “good / mixed.” The 7/10 is reasonable as an *overall* SEO score including authority. It is low as a score of on-page implementation.

---

## Where the architecture advice is off

ChatGPT’s proposed map:

| URL | Role |
| --- | --- |
| `/` | Person |
| `/work` | Project index |
| `/work/bar-genius` | Specific project |
| `/experience` | Career |
| `/skills` | Technical expertise |
| `/resume` | Resume |

The first three plus `/resume` **already exist**. `/experience` and `/skills` do not, and they should not be created just to match that diagram.

Experience and skills are already on the homepage and on `/resume`. Extra routes with the same copy would be thin duplicates. Google does not need a `/skills` URL to know the React Native association; it needs other sites to cite the person, and it needs `/work/[slug]` pages that can win specific queries.

### The real IA gap is smaller

- Nav is hash-based (`#portfolio`, `#experience`, `#skills`), so those sections are not crawlable as their own pages. That is fine for a portfolio as long as `/work` and `/resume` stay the dedicated URLs.
- Case-study pages still send people “back” to `/#portfolio` instead of `/work`. The work index is slightly under-linked.
- The footer links socials, privacy, and terms, but not `/work` or `/resume`.
- Homepage FAQ JSON-LD is tied to `/`, while the visible FAQ is a hash (`/#faq`). That is a small entity/URL mismatch, not a crisis.

---

## Project SEO is “needs work” only in a specific sense

The pages, metadata, and schema are there. What is still yellow:

- Ranking those URLs, not merely having them
- Depth and uniqueness of each write-up (challenge / solution / outcome / architecture)
- Inbound links to `/work/[slug]` URLs, not only to `/`
- Whether each `seoLabel` targets a query a stranger would actually search

ChatGPT cannot see Search Console from the HTML, so **Google discovery 🔴** is an inference from domain newness. It is probably right, but it is a guess until coverage data says so.

---

## Scorecard

| Area | ChatGPT | Closer reading |
| --- | --- | --- |
| Crawlability | Good | Good. SSR homepage plus sitemap plus robots. Hash nav is the only real crawl quirk. |
| HTML / semantics / entity clarity | Excellent | Accurate |
| Technical SEO foundation | Good / mixed | Already implemented. Remaining work is Search Console hygiene, not new tags. |
| Project SEO | Needs work | Infrastructure done; content + links + query targeting remain. |
| Google discovery | Questionable | Fair if the domain is new; confirm in Search Console. |
| Domain authority | Very low | Fair for a new personal domain. |
| LLM discoverability | Strong foundation | Stronger than stated (`llms.txt` + entity graph + case studies). |
| Overall | 7/10 foundation | ~8–9/10 on-page foundation, ~4–6/10 including discovery and authority. |

---

## What to do next

1. Treat Search Console coverage as the source of truth: which URLs are indexed, which are “crawled – currently not indexed,” whether the sitemap is accepted.
2. Put the same URL on GitHub, LinkedIn, Medium, Upwork, and any directory or talk bio. That is how the Person entity gets confirmed off-site.
3. Point people at `/work/[slug]`, not only at `/`.
4. Leave `/experience` and `/skills` unbuilt unless those pages would contain material that is not already on `/` and `/resume`.
5. Do not spend time re-adding robots, sitemap, canonicals, OG, or Person schema. That layer is done.
