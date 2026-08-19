# Job sources research (merged)

Merged 19 Aug 2026 from Grok (`g`), DeepSeek (`deepseek`), ChatGPT (`chatgpt`), and Perplexity (`p`).

Machine-readable file: `research/job-sources.json` (87 sources after de-dupe; 238 raw rows).

**What this pipeline is:** discover listings, save URL + JD, prepare materials, track status. A human clicks Apply. No spray auto-apply.

## Codes

| Code | Model |
|------|--------|
| `g` | Grok |
| `deepseek` | DeepSeek |
| `chatgpt` | ChatGPT |
| `p` | Perplexity |

Every source has `suggestedBy` listing which models named it.

## What is actually free to poll

These are the highest-leverage **$0** listing feeds. Company ATS sources need a slug/token watchlist; remote boards are global search.

1. **Greenhouse, Lever, Ashby** — unauthenticated public job JSON. All four models agree this is the core.
2. **Workable, Recruitee, Personio XML, SmartRecruiters** — public or widely documented company feeds.
3. **Remote OK** (JSON/RSS), **We Work Remotely** (RSS), **Remotive**, **Himalayas**, **Arbeitnow** — remote/EU discovery without a company list.
4. **USAJOBS** — official API (key required). Keep it, but score low for Pakistan eligibility.
5. **Breezy / BambooHR** — public JSON is cited when you know the company subdomain; treat as watch-with-verification.

## What is theater

- **LinkedIn / Indeed / Glassdoor** have no self-serve **read** API for seekers. Partner APIs are write-side or closed. Use paste-URL.
- **LazyApply, Sonara, LoopCV, ApplyPass, Massive** are spray-apply bots. They do not give you a clean listing feed you own. Skip.
- **Teal, Huntr, Simplify, Jobscan** are trackers/autofill/resume tools, not discovery sources. Optional later.
- **FlexJobs** is a paid seeker board. Skip for a $0-first MVP.
- **GitHub Jobs** is dead.

## Pakistan ranking (rank, do not exclude)

Practical order for a Pakistan-based engineer willing to relocate or work remote:

1. Himalayas, Remote OK, Remotive, We Work Remotely (worldwide remote — still read the JD)
2. Rozee (Pakistan-local)
3. Bayt, GulfTalent, Naukri Gulf (GCC relocation)
4. Arbeitnow, Landing.jobs, Otta (EU / visa language)
5. YC Work at a Startup, Wellfound, HN Who’s Hiring → then the company’s Greenhouse/Lever/Ashby page
6. USAJOBS and US-only boards last unless the posting clearly allows non-US applicants

“Remote” ≠ “remote from Pakistan.” Store `country_eligibility`, `citizenship_requirement`, and `visa_language`. Never hard-filter.

## MVP

**Poll:** Greenhouse, Lever, Ashby, Workable, Recruitee, Personio, Remote OK, WWR RSS, Remotive, Himalayas, Arbeitnow, Breezy, BambooHR, USAJOBS, SmartRecruiters.

**Paste URL:** Rozee, Bayt, GulfTalent, Naukri Gulf, YC, Wellfound, Otta, LinkedIn, Indeed, HN, Landing.jobs, TrueUp, Levels.fyi.

**Ignore at first:** auto-apply SaaS, FlexJobs, scraping login walls, Workday/iCIMS/Taleo without a public feed.

## How to key the tracker

1. Employer ATS apply URL  
2. ATS job id + board token, or USAJOBS announcement number  
3. Title + company + location hash  

Same role will appear on ATS + LinkedIn + Indeed + Otta. Deduplicate toward the ATS URL.

## Watch (20)

Sources with a free official listing API or RSS, or otherwise worth polling.

- **Arbeitnow** (`arbeitnow`) — job-board, free, PK sometimes — suggested by `g,deepseek,p`
- **Ashby Job Postings API** (`ashby`) — ats, free, PK often — suggested by `g,deepseek,p,chatgpt`
- **EchoJobs** (`echojobs`) — job-board, free, PK sometimes — suggested by `g,deepseek`
- **Greenhouse Job Board API** (`greenhouse`) — ats, free, PK often — suggested by `g,deepseek,p,chatgpt`
- **Hacker News Who’s Hiring** (`hn-who-is-hiring`) — job-board, free, PK sometimes — suggested by `g,deepseek`
- **Himalayas** (`himalayas`) — rss-or-api, free, PK often — suggested by `g,deepseek,p`
- **Landing.jobs** (`landing-jobs`) — job-board, free, PK sometimes — suggested by `g,deepseek,p`
- **Lever Postings API** (`lever`) — ats, free, PK often — suggested by `g,deepseek,p,chatgpt`
- **Recruitee (Tellent)** (`recruitee`) — ats, free, PK sometimes — suggested by `g,deepseek,p`
- **Remote OK** (`remote-ok`) — rss-or-api, free, PK often — suggested by `g,deepseek,p,chatgpt`
- **Remotive** (`remotive`) — job-board, free, PK often — suggested by `g,deepseek,p`
- **SmartRecruiters** (`smartrecruiters`) — ats, free, PK often — suggested by `g,deepseek,p,chatgpt`
- **We Work Remotely** (`we-work-remotely`) — job-board, free, PK often — suggested by `g,deepseek,p`
- **Workable** (`workable`) — ats, free, PK often — suggested by `g,deepseek,p,chatgpt`
- **Working Nomads** (`working-nomads`) — job-board, free, PK often — suggested by `g,deepseek,p`
- **Breezy HR** (`breezy`) — ats, free, PK sometimes — suggested by `g,deepseek,p`
- **Personio** (`personio`) — ats, free, PK sometimes — suggested by `g,deepseek,p`
- **Techmap Job API** (`techmap`) — aggregator, free-tier, PK unknown — suggested by `deepseek`
- **The Muse** (`the-muse`) — job-board, free, PK sometimes — suggested by `g,deepseek,p`
- **USAJOBS** (`usajobs`) — rss-or-api, free, PK rarely — suggested by `g,deepseek,p,chatgpt`

## Paste-URL (49)

Human finds the job, pastes the public URL. Pipeline fetches JD and prepares materials.

- **Bayt** (`bayt`) — job-board, free, PK often — suggested by `g,deepseek,p,chatgpt`
- **Generic Company Career Pages** (`career-page-pattern`) — career-page-pattern, free, PK sometimes — suggested by `g`
- **GulfTalent** (`gulftalent`) — job-board, free, PK often — suggested by `g,deepseek,p,chatgpt`
- **Indeed** (`indeed`) — job-board, free, PK sometimes — suggested by `g,deepseek,chatgpt`
- **Levels.fyi Jobs** (`levels-fyi-jobs`) — job-board, free, PK sometimes — suggested by `g,deepseek,p`
- **LinkedIn** (`linkedin`) — job-board, free, PK sometimes — suggested by `g,deepseek,chatgpt`
- **Naukri** (`naukri`) — job-board, free, PK often — suggested by `g,deepseek,chatgpt`
- **NaukriGulf** (`naukrigulf`) — job-board, free, PK often — suggested by `g,deepseek,p`
- **Otta** (`otta`) — job-board, free, PK sometimes — suggested by `g,deepseek`
- **Rozee.pk** (`rozee`) — job-board, free, PK often — suggested by `g,deepseek,p`
- **TrueUp** (`trueup`) — aggregator, free, PK sometimes — suggested by `g,deepseek,p`
- **Wellfound (formerly AngelList)** (`wellfound`) — job-board, free, PK sometimes — suggested by `g,deepseek,p,chatgpt`
- **YC Work at a Startup** (`yc-work-at-a-startup`) — job-board, free, PK sometimes — suggested by `g,deepseek,p`
- **ZipRecruiter** (`ziprecruiter`) — job-board, free, PK often — suggested by `g,deepseek,chatgpt`
- **BambooHR Careers** (`bamboohr`) — ats, free, PK sometimes — suggested by `g,deepseek,p,chatgpt`
- **Built In** (`built-in`) — job-board, free, PK sometimes — suggested by `g,deepseek,p`
- **Cutshort** (`cutshort`) — job-board, free, PK sometimes — suggested by `g,deepseek,p`
- **Dice** (`dice`) — job-board, free, PK sometimes — suggested by `g,deepseek,p`
- **Dover** (`dover`) — ats, paid, PK sometimes — suggested by `g,deepseek`
- **Glassdoor** (`glassdoor`) — job-board, free, PK sometimes — suggested by `g,deepseek,chatgpt`
- **Google for Jobs** (`google-for-jobs`) — aggregator, free, PK sometimes — suggested by `g,p`
- **Hasjob** (`hasjob`) — job-board, free, PK sometimes — suggested by `g,deepseek,p`
- **Homerun** (`homerun`) — ats, paid, PK sometimes — suggested by `g,deepseek`
- **iCIMS** (`icims`) — ats, free-tier, PK sometimes — suggested by `g,deepseek,chatgpt`
- **Instahyre** (`instahyre`) — job-board, free, PK sometimes — suggested by `g,deepseek,p`
- **Join.com** (`join-com`) — ats, paid, PK sometimes — suggested by `g,deepseek`
- **Key Values** (`key-values`) — job-board, free, PK sometimes — suggested by `g,deepseek`
- **Manatal** (`manatal`) — ats, paid, PK sometimes — suggested by `g,deepseek`
- **Monster** (`monster`) — job-board, free, PK sometimes — suggested by `g,deepseek,chatgpt`
- **Nodesk** (`nodesk`) — job-board, free, PK often — suggested by `g,deepseek`
- **Pinpoint** (`pinpoint`) — ats, paid, PK sometimes — suggested by `g,deepseek`
- **PowerToFly** (`powertofly`) — job-board, free, PK sometimes — suggested by `g,deepseek,p`
- **Remote.co** (`remote-co`) — job-board, free, PK sometimes — suggested by `p`
- **Taleo / Oracle Recruiting** (`taleo-oracle`) — ats, free-tier, PK sometimes — suggested by `g,deepseek,chatgpt`
- **Teamtailor** (`teamtailor`) — ats, free, PK sometimes — suggested by `g,deepseek,p`
- **Welcome to the Jungle** (`welcome-to-the-jungle`) — job-board, free, PK sometimes — suggested by `g,deepseek`
- **Workday Career Sites (CXS)** (`workday`) — ats, free, PK sometimes — suggested by `g,deepseek,chatgpt`
- **Zoho Recruit** (`zoho-recruit`) — ats, free-tier, PK sometimes — suggested by `g,deepseek`
- **Avature** (`avature`) — ats, paid, PK sometimes — suggested by `g,deepseek`
- **Comeet** (`comeet`) — ats, paid, PK sometimes — suggested by `g,deepseek`
- **Eightfold AI** (`eightfold`) — ats, paid, PK sometimes — suggested by `g,deepseek`
- **Freshteam** (`freshteam`) — ats, paid, PK sometimes — suggested by `g,deepseek`
- **JazzHR** (`jazzhr`) — ats, free, PK sometimes — suggested by `g,deepseek,p`
- **Paycor** (`paycor`) — ats, paid, PK sometimes — suggested by `g,deepseek`
- **Phenom** (`phenom`) — ats, paid, PK sometimes — suggested by `g,deepseek`
- **Polymer** (`polymer`) — ats, paid, PK sometimes — suggested by `g,deepseek`
- **Rippling** (`rippling`) — ats, paid, PK sometimes — suggested by `g,deepseek`
- **SAP SuccessFactors** (`successfactors`) — ats, paid, PK sometimes — suggested by `g,deepseek`
- **UKG** (`ukg`) — ats, paid, PK sometimes — suggested by `g,deepseek`

## Paid-optional (4)

- **JobsPipe** (`jobspipe`) — aggregator, paid, PK unknown — suggested by `deepseek`
- **Jobvite** (`jobvite`) — ats, free, PK sometimes — suggested by `g,deepseek,chatgpt`
- **FlexJobs** (`flexjobs`) — job-board, paid, PK sometimes — suggested by `g,deepseek,p,chatgpt`
- **TheirStack** (`theirstack`) — aggregator, paid, PK unknown — suggested by `deepseek`

## Skip (14)

Dead boards, spray-apply tools, trackers that are not listing feeds, or enterprise APIs that are not usable as a personal listing feed.

- **Huntr** (`huntr`) — tracker, free-tier, PK unknown — suggested by `g,deepseek,p`
- **Remote Job RSS Aggregator Pattern** (`remote-job-rss-aggregator-pattern`) — rss-or-api, free, PK sometimes — suggested by `p`
- **Simplify** (`simplify`) — ai-apply-saas, free, PK unknown — suggested by `g,deepseek,p`
- **Teal** (`teal`) — tracker, free-tier, PK unknown — suggested by `g,deepseek,p`
- **ApplyPass** (`applypass`) — ai-apply-saas, paid, PK sometimes — suggested by `g,deepseek`
- **Gem** (`gem`) — ats, paid, PK sometimes — suggested by `g,deepseek`
- **GitHub Jobs** (`github-jobs`) — aggregator, free, PK rarely — suggested by `chatgpt`
- **JOBO ATS Provider Reference** (`jobo-ats-reference`) — other, unknown, PK unknown — suggested by `p`
- **Jobscan** (`jobscan`) — ai-apply-saas, free-tier, PK unknown — suggested by `g,deepseek,p`
- **Kula** (`kula`) — ats, paid, PK sometimes — suggested by `g,deepseek`
- **LazyApply** (`lazyapply`) — ai-apply-saas, paid, PK sometimes — suggested by `g,deepseek,p`
- **LoopCV** (`loopcv`) — ai-apply-saas, free-tier, PK sometimes — suggested by `g,deepseek,p`
- **Massive** (`massive`) — ai-apply-saas, paid, PK sometimes — suggested by `g,deepseek`
- **Sonara** (`sonara`) — ai-apply-saas, paid, PK sometimes — suggested by `g,deepseek`

## Models disagreed (verify before building)

**Official listing API**

- `avature`: g=False, deepseek=True
- `bamboohr`: p=False, g=False, chatgpt=True, deepseek=False
- `breezy`: p=False, g=True, deepseek=True
- `comeet`: g=False, deepseek=True
- `dover`: g=False, deepseek=True
- `echojobs`: g=False, deepseek=True
- `eightfold`: g=False, deepseek=True
- `freshteam`: g=False, deepseek=True
- `gem`: g=False, deepseek=True
- `himalayas`: p=True, g=False, deepseek=True
- `hn-who-is-hiring`: g=False, deepseek=True
- `homerun`: g=False, deepseek=True
- `huntr`: p=False, g=False, deepseek=True
- `jazzhr`: p=False, g=False, deepseek=True
- `jobvite`: g=False, chatgpt=True, deepseek=False
- `join-com`: g=False, deepseek=True
- `kula`: g=False, deepseek=True
- `landing-jobs`: p=False, g=False, deepseek=True
- `loopcv`: p=False, g=False, deepseek=True
- `manatal`: g=False, deepseek=True
- `paycor`: g=False, deepseek=True
- `personio`: p=False, g=True, deepseek=True
- `phenom`: g=False, deepseek=True
- `pinpoint`: g=False, deepseek=True
- `polymer`: g=False, deepseek=True
- `recruitee`: p=False, g=True, deepseek=True
- `remote-ok`: p=False, g=True, chatgpt=True, deepseek=True
- `rippling`: g=False, deepseek=True
- `successfactors`: g=False, deepseek=True
- `teamtailor`: p=True, g=False, deepseek=True
- `the-muse`: p=False, g=False, deepseek=True
- `ukg`: g=False, deepseek=True
- `ziprecruiter`: g=False, chatgpt=True, deepseek=False
- `zoho-recruit`: g=False, deepseek=True

**Verdict before merge**

- `arbeitnow` merged to `watch`: p=watch, g=watch, deepseek=paste-url
- `ashby` merged to `watch`: p=watch, g=watch, chatgpt=watch, deepseek=paste-url
- `avature` merged to `paste-url`: g=paste-url, deepseek=skip
- `bamboohr` merged to `paste-url`: p=paste-url, g=watch, chatgpt=skip, deepseek=paste-url
- `bayt` merged to `paste-url`: p=paste-url, g=paste-url, chatgpt=paste-url, deepseek=watch
- `breezy` merged to `watch`: p=paste-url, g=watch, deepseek=paste-url
- `built-in` merged to `paste-url`: p=paste-url, g=paste-url, deepseek=watch
- `comeet` merged to `paste-url`: g=paste-url, deepseek=skip
- `cutshort` merged to `paste-url`: p=paste-url, g=paste-url, deepseek=watch
- `dice` merged to `paste-url`: p=paste-url, g=paste-url, deepseek=watch
- `dover` merged to `paste-url`: g=paste-url, deepseek=skip
- `eightfold` merged to `paste-url`: g=paste-url, deepseek=skip
- `flexjobs` merged to `paid-optional`: p=paid-optional, g=paid-optional, chatgpt=skip, deepseek=skip
- `freshteam` merged to `paste-url`: g=paste-url, deepseek=skip
- `glassdoor` merged to `paste-url`: g=paste-url, chatgpt=watch, deepseek=watch
- `greenhouse` merged to `watch`: p=watch, g=watch, chatgpt=watch, deepseek=paste-url
- `gulftalent` merged to `paste-url`: p=paste-url, g=paste-url, chatgpt=paste-url, deepseek=watch
- `hasjob` merged to `paste-url`: p=watch, g=paste-url, deepseek=skip
- `himalayas` merged to `watch`: p=watch, g=paste-url, deepseek=paste-url
- `hn-who-is-hiring` merged to `watch`: g=paste-url, deepseek=watch
- `homerun` merged to `paste-url`: g=paste-url, deepseek=skip
- `huntr` merged to `skip`: p=skip, g=paid-optional, deepseek=skip
- `indeed` merged to `paste-url`: g=paste-url, chatgpt=watch, deepseek=watch
- `jazzhr` merged to `paste-url`: p=paste-url, g=paste-url, deepseek=skip
- `jobscan` merged to `skip`: p=paid-optional, g=paid-optional, deepseek=skip
- `jobvite` merged to `paid-optional`: g=paste-url, chatgpt=paid-optional, deepseek=paste-url
- `join-com` merged to `paste-url`: g=paste-url, deepseek=skip
- `key-values` merged to `paste-url`: g=paste-url, deepseek=watch
- `levels-fyi-jobs` merged to `paste-url`: p=paste-url, g=paste-url, deepseek=watch
- `lever` merged to `watch`: p=watch, g=watch, chatgpt=watch, deepseek=paste-url
- `linkedin` merged to `paste-url`: g=paste-url, chatgpt=skip, deepseek=watch
- `loopcv` merged to `skip`: p=paid-optional, g=skip, deepseek=skip
- `manatal` merged to `paste-url`: g=paste-url, deepseek=skip
- `monster` merged to `paste-url`: g=paste-url, chatgpt=paste-url, deepseek=watch
- `naukri` merged to `paste-url`: g=paste-url, chatgpt=paste-url, deepseek=watch
- `naukrigulf` merged to `paste-url`: p=paste-url, g=paste-url, deepseek=watch
- `nodesk` merged to `paste-url`: g=paste-url, deepseek=watch
- `otta` merged to `paste-url`: g=paste-url, deepseek=watch
- `paycor` merged to `paste-url`: g=paste-url, deepseek=skip
- `personio` merged to `watch`: p=paste-url, g=watch, deepseek=paste-url
- `phenom` merged to `paste-url`: g=paste-url, deepseek=skip
- `pinpoint` merged to `paste-url`: g=paste-url, deepseek=skip
- `polymer` merged to `paste-url`: g=paste-url, deepseek=skip
- `powertofly` merged to `paste-url`: p=paste-url, g=paste-url, deepseek=watch
- `recruitee` merged to `watch`: p=watch, g=watch, deepseek=paste-url
- `remote-ok` merged to `watch`: p=watch, g=watch, chatgpt=watch, deepseek=paste-url
- `remotive` merged to `watch`: p=watch, g=watch, deepseek=paste-url
- `rippling` merged to `paste-url`: g=paste-url, deepseek=skip
- `rozee` merged to `paste-url`: p=paste-url, g=paste-url, deepseek=watch
- `simplify` merged to `skip`: p=paid-optional, g=paid-optional, deepseek=skip
- `smartrecruiters` merged to `watch`: p=watch, g=watch, chatgpt=watch, deepseek=paste-url
- `successfactors` merged to `paste-url`: g=paste-url, deepseek=skip
- `teal` merged to `skip`: p=skip, g=paid-optional, deepseek=skip
- `teamtailor` merged to `paste-url`: p=watch, g=paste-url, deepseek=paste-url
- `trueup` merged to `paste-url`: p=paste-url, g=paste-url, deepseek=watch
- `ukg` merged to `paste-url`: g=paste-url, deepseek=skip
- `usajobs` merged to `watch`: p=watch, g=skip, chatgpt=watch, deepseek=watch
- `we-work-remotely` merged to `watch`: p=watch, g=watch, deepseek=paste-url
- `welcome-to-the-jungle` merged to `paste-url`: g=paste-url, deepseek=watch
- `wellfound` merged to `paste-url`: p=paste-url, g=paste-url, chatgpt=watch, deepseek=watch
- `workable` merged to `watch`: p=watch, g=watch, chatgpt=watch, deepseek=paste-url
- `yc-work-at-a-startup` merged to `paste-url`: p=paste-url, g=paste-url, deepseek=watch
- `ziprecruiter` merged to `paste-url`: g=paste-url, chatgpt=watch, deepseek=watch
- `zoho-recruit` merged to `paste-url`: g=paste-url, deepseek=skip

Notable fights: ChatGPT claimed a free ZipRecruiter seeker API and Indeed RSS; Grok did not treat those as a solid poll source. DeepSeek marked many paid enterprise ATS APIs as official even when they require customer credentials. BambooHR official vs incidental JSON is unresolved.

## Direct company watchlist

The JSON includes a merged `example_companies` list from Grok and DeepSeek (Stripe, Figma, Notion, Linear, Vercel, GitLab, etc.). Re-verify tokens before polling; they change.

## Open questions

- Workday CXS stability
- SmartRecruiters / Workable unauthenticated coverage
- Himalayas / Landing.jobs / EchoJobs / The Muse current docs
- Regional board APIs (Rozee, Bayt, GulfTalent)
- ZipRecruiter seeker API claim
