# Perplexity — job sources research (2026-08-19)

Perplexity declined to invent an 80+ source inventory. Confidence: **low-to-moderate**. JSON: `research/job-sources-perplexity.json`.

## Caveat

It cannot reliably produce 80+ fully verified records from this pass without inventing or overstating facts. Search confirmed some official ATS feed patterns (Greenhouse, Lever, Ashby, SmartRecruiters). Most other platforms need individual primary-source verification. A third-party article is not enough to mark an endpoint as official.

## Short summary

The strongest free foundation is employer ATS data, especially Greenhouse, Lever, Ashby, and SmartRecruiters public posting feeds.

These feeds usually require a company slug, board token, or company identifier, so they are ideal for a curated company watchlist rather than unrestricted global search.

Google for Jobs is useful for human discovery, but it is not an API you own. Treat it as “paste this URL,” not as a polling source.

Public JobPosting JSON-LD is valuable when a user initiates a fetch of a career page. It commonly supplies title, company, location, description, and dates.

Most large job boards are better treated as manual or user-initiated sources unless their current official documentation confirms a public listing API.

LinkedIn, Indeed, Glassdoor, Workday, iCIMS, Taleo, and similar systems can be valuable but often involve login walls, bot defenses, unstable URLs, or restrictive terms.

AI job products divide into three groups: trackers, autofill assistants, and auto-submit services.

Teal and Huntr are mainly trackers and job-organization products.

Simplify is closer to a browser-assisted autofill and answer-generation tool.

LazyApply and LoopCV emphasize automation or volume and are a poor fit for a deliberate human-review workflow.

Jobscan helps compare a resume with a job description, but it is not a discovery or tracking source.

“Free” often means free account access, not a free public listing feed. The MVP should require no card and no paid API subscription.

The most important tracker field is not just source; it is a durable identity composed of canonical URL, ATS job ID, company identifier, and a fallback title-company-location hash.

Store the original aggregator URLs even after selecting an employer ATS URL as canonical.

A missing listing should not automatically become rejected; it may have expired, been filled, or been temporarily unpublished.

Remote labels require caution because “remote” often means remote within a specific country or payroll region.

Pakistan eligibility, sponsorship, and relocation should affect ranking only, never exclusion.

Many US roles still require existing US work authorization, so the honest approach is to lower their priority while retaining them.

The initial MVP should poll a small number of verified ATS watchlists and allow users to paste everything else.

The largest research gap is the requested 80-plus source inventory; completing it properly requires checking each platform’s primary documentation, terms, current status, and pricing page rather than relying on comparison articles.
