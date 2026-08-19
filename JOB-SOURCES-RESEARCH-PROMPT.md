# Job sources research prompt

Copy everything below the horizontal rule into another AI. Ask for **one JSON file** (or a fenced `json` block) plus a short human summary. Paste that JSON back into this repo’s chat for further processing.

---

You are a research analyst for a **personal, free job-pipeline**. The product does **not** need to auto-submit applications. It needs: **discover listings → save the job URL + JD → prepare a tailored resume/cover/answers → track status**. A human may still click Apply on the real site.

Do **not** write code, scrapers, payloads, or step-by-step bypasses of logins, CAPTCHAs, or anti-bot systems. Do **not** recommend breaking Terms of Service as a plan. For each source, state whether data is **officially available** (public API, RSS, JSON-LD, documented job-board endpoint) vs **only HTML that would need a user-initiated fetch of a public page**. If scraping is against ToS, say so and still describe what a human can copy-paste.

**Applicant profile (for eligibility scoring only, never as a hard filter):**

- Software engineer (mobile / web / backend / AI)
- Based in **Pakistan**, willing to **relocate** and to take **remote**
- Must still **list jobs that do not sponsor or hire from Pakistan** — those get a lower priority score, they are **not excluded**

**Budget:** Prefer **$0**. If a product is paid, **still include it**, mark `cost: "paid"`, and give plan name + typical price if known. Free tiers count as free only if they actually expose listing data without a card.

## Coverage you must hit

Search until each bucket has real names. If you cannot find more, write `"exhausted": true` and why. **Do not stop at 10 famous sites.**

1. **Famous platforms** — at minimum discuss all of: LinkedIn, Indeed, Glassdoor, Wellfound/AngelList, Greenhouse, Lever, Workday, Ashby, SmartRecruiters, iCIMS, Taleo/Oracle, Jobvite, BambooHR, Workable, ZipRecruiter, Monster, Naukri, Bayt, GulfTalent.
2. **ATS / career-site engines** (company uses this on `jobs.company.com`) — famous **and** underdogs, including at least: Ashby, Teamtailor, Recruitee, Breezy, Personio, Homerun, Pinpoint, Join.com, Dover, Freshteam, JazzHR, Comeet, Rippling, Gem, Manatal, Polymer, Kula, Eightfold, Phenom, Avature, SuccessFactors, UKG, Paycor, Zoho Recruit.
3. **Boards / aggregators / niches** — Otta, TrueUp, Levels.fyi jobs, Key Values, Welcome to the Jungle, Built In, Landing.jobs, Remote OK, Remotive, Himalayas, Arbeitnow, We Work Remotely, FlexJobs, HN Who’s Hiring, YC Work at a Startup, Cutshort, Instahyre, Hasjob, Rozee, Naukrigulf, PowerToFly, Dice, The Muse, EchoJobs, Nodesk, Working Nomads, JS/React/mobile specialty boards, government (USAJOBS etc.), university/alumni boards. Add **every underdog you can find** (regional, language-specific, visa/relocation-focused, startup-only, remote-only, EU Blue Card, Netherlands highly skilled migrant, Germany, UAE, KSA, UK, Canada, Australia).
4. **Direct company sources** — engineering career pages, `jobs.` / `careers.` subdomains, Greenhouse/Lever/Ashby board tokens, RSS on career sites, JSON-LD `JobPosting`, Google for Jobs (as a discovery surface, not an API you own), company newsletters.
5. **“AI job automation” products** — LazyApply, Massive, Sonara, Loopcv, Teal, Huntr, Simplify, Jobscan, ApplyPass, and **every similar tool** you can find. For each: what they actually do (search vs autofill vs submit), cost, whether they give **you** the listing URL/JD, whether they track applications, ToS/ban risk.

If a name is acquired, dead, or rebranded, say so and point to the successor.

## For every source, fill this object (no missing keys)

```json
{
  "id": "kebab-case-stable-id",
  "name": "",
  "kind": "ats | job-board | aggregator | career-page-pattern | rss-or-api | ai-apply-saas | tracker | other",
  "fame": "famous | underdog | dead-or-acquired",
  "url": "homepage or docs",
  "cost": "free | free-tier | paid | unknown",
  "cost_notes": "price, what is gated",
  "data_access": {
    "official_listing_api": true,
    "rss": true,
    "json_ld_jobposting": true,
    "public_job_board_json": true,
    "documented_apply_api": true,
    "email_or_mailto": true,
    "html_only_public": true,
    "login_wall": true,
    "captcha_or_bot_defense": true,
    "against_tos_to_scrape": true,
    "notes": "exact endpoints or feed URLs if public, else 'none found'"
  },
  "automation": {
    "discover": "full | partial | manual",
    "ingest_url_and_jd": "full | partial | manual",
    "prepare_materials": "n/a — our app does this",
    "submit_application": "full | partial | manual | none",
    "track_status": "native | export | none"
  },
  "needs_company_slug": true,
  "global_search": true,
  "geo": {
    "remote_roles": "common | mixed | rare | unknown",
    "relocation_or_visa": "common | mixed | rare | unknown",
    "pakistan_can_apply": "often | sometimes | rarely | unknown",
    "priority_hint": "high | medium | low",
    "priority_reason": "one sentence; low priority must still be listed"
  },
  "listing_fields_available": ["url", "title", "company", "location", "remote", "description", "questions", "posted_at", "board_token"],
  "tracking_fit": "How this source helps or hurts a personal tracker (unique job URL, stable id, status webhooks, none)",
  "risks": ["tos", "ban", "stale-data", "duplicate-cross-post", "no-stable-id"],
  "verdict": "watch | paste-url | skip | paid-optional",
  "sources_you_used": ["url to docs or page you actually checked"]
}
```

**Priority rules:** `pakistan_can_apply` and visa/relocation only change `priority_hint`. **Never omit** a source because PK applicants are excluded.

**Automation meanings:**

- `full` = official feed/API or documented public JSON/RSS you can poll with a company list or query, no login
- `partial` = public pages/JSON-LD, user presses “fetch this URL”, or search is public but apply is not
- `manual` = human finds it, pastes link
- Submit `none` is OK and expected for most boards

## Extra sections required (same JSON file)

1. `meta` — date, models/tools you used, confidence, `"exhausted_buckets": { ... }`
2. `duplicates_and_crossposting` — how the same role appears on LinkedIn + Greenhouse + Otta; how to key a tracker (`canonical_url`, ATS job id, title+company+location hash)
3. `tracker_schema_recommendation` — fields a personal tracker needs: source, canonical job id, apply URL, status enum (seen, drafted, applied, interview, offer, rejected, ghosted), dates, materials used, next action. Call out sources that **cannot** give a stable id.
4. `pakistan_relocation_remote` — ranked **discovery** tactics (not exclusions): visa-friendly boards, “relocation”, “visa sponsorship”, “remote worldwide”, EU/UK/US/Canada/UAE/KSA, plus the honest base rate that many US roles still say no.
5. `direct_company_playbook` — how to build a **company watchlist** (Ashby/Greenhouse/Lever tokens, careers URL patterns). List 30+ example companies **with known public board URLs or tokens** if you can verify them; mark unverified.
6. `ai_saas_landscape` — table-equivalent array of automation products vs our model (we only want listings + tracking; they often spray-apply).
7. `recommended_mvp` — only **free** sources: what to poll, what to paste, what to ignore. Max 15 watch sources, ordered.
8. `open_questions` — anything you could not verify.

## Quality bar

- Prefer **primary docs** (API reference, RSS, `site:boards-api.greenhouse.io`, Ashby posting-api, Lever `/v0/postings`). Cite URLs in `sources_you_used`.
- If you guess an endpoint, set `"official_listing_api": false` and say **unverified**.
- Count: aim for **80+ source objects**. Underdogs should outnumber famous names.
- Output **valid JSON** as a single object:

```json
{
  "meta": {},
  "sources": [{ "...source object..." }],
  "duplicates_and_crossposting": {},
  "tracker_schema_recommendation": {},
  "pakistan_relocation_remote": {},
  "direct_company_playbook": {},
  "ai_saas_landscape": [],
  "recommended_mvp": {},
  "open_questions": []
}
```

No markdown tables inside JSON. After the JSON, 20–40 lines of prose: what surprised you, what is actually free, what is theater.

If you hit output limits, continue in a second message with `"sources": [ ... ]` only, same schema, no id collisions.
