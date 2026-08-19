# Perplexity batch 3 — job sources research (2026-08-19)

JSON: `research/job-sources-perplexity-batch-3.json`. Confidence: **moderate**. Focus: government, remote, regional, niche, salary-focused, and aggregator sources.

## Short summary

1. Yes, there are substantial remaining options.

2. The most important new addition is USAJOBS. It has an official REST API, stable federal identifiers, and full announcement text, but API-key registration is required.

3. USAJOBS should still be listed despite its low Pakistan eligibility score because the rule is to rank rather than exclude.

4. Arbeitnow is a strong European addition because it documents a free job-board API and includes remote-job information.

5. Rozee is the highest-priority manual source for Pakistan-specific jobs.

6. Bayt, GulfTalent, and Naukri Gulf are the most relevant additions for UAE, KSA, Qatar, and wider GCC relocation.

7. These regional boards did not have verified public APIs in this research pass, so they should be handled as user-initiated paste-URL sources.

8. That is still useful: a human can search, copy the listing URL, and the pipeline can fetch the public JD, prepare materials, and track status.

9. YC Work at a Startup and Wellfound are good startup discovery surfaces.

10. Use them to identify companies, then move the job into a direct company ATS watchlist.

11. Levels.fyi is more valuable for compensation and level context than for automated ingestion.

12. FlexJobs is a paid optional source and should not be part of a $0-first MVP.

13. The free core should now include Himalayas, Remote OK, Remotive, Arbeitnow, Greenhouse, Lever, Ashby, SmartRecruiters, and USAJOBS.

14. The manual regional layer should include Rozee, Bayt, GulfTalent, Naukri Gulf, Cutshort, and Instahyre.

15. A practical ranking for a Pakistan-based engineer is: Himalayas, Rozee, Bayt, GulfTalent, Naukri Gulf, Arbeitnow, Remotive, Remote OK, YC startups, then broader U.S.-centric boards.

16. “Remote” is still not equivalent to “remote from Pakistan.”

17. The tracker should store `remote_region`, `country_eligibility`, `citizenship_requirement`, and `visa_language`.

18. The best stable IDs come from USAJOBS and ATS feeds.

19. Regional boards and aggregators should be keyed primarily by canonical URL plus a title-company-location hash.

20. The remaining research gaps are mostly regional API verification, government portals outside the United States, university boards, and niche engineering boards.
