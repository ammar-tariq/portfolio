# Manual SEO actions

Only items that cannot be finished in the repository. Search Console and Bing Webmaster Tools are already connected. Do not register them again.

## Google

- After this change is deployed, open URL Inspection for `https://ammartariq.com/` and `https://ammartariq.com/services`. Request indexing for `/services` (new) and for the homepage if the title or description changed.
- Confirm the live homepage title is `Ammar Tariq | Software Engineer | React Native, React & Node.js`. Site content is cached for about two minutes after the settings update.
- Google Analytics events are sent only if `GA_MEASUREMENT_ID` or `GTM_CONTAINER_ID` is already set. In GA4 Admin → Events, you can mark these as key events if you want them in conversion reports: `hire_me_click`, `email_click`, `linkedin_click`, `github_click`, `contact_click`, `resume_click`, `resume_download`, `project_view`. Nothing else is required for them to be collected.
- FAQ rich results are often not shown for personal sites. The questions are on the page for people and crawlers either way.

## Bing

- Webmaster Tools is already verified. No new token.
- The IndexNow key is already hosted at `https://ammartariq.com/576e4f1acea04a92b5accaebde487fc7.txt`.
- The previous sitemap was submitted and Bing returned 202. After `/services` is deployed, submit that URL once:

```text
https://www.bing.com/indexnow?url=https://ammartariq.com/services&key=576e4f1acea04a92b5accaebde487fc7&keyLocation=https://ammartariq.com/576e4f1acea04a92b5accaebde487fc7.txt
```

- In Bing Webmaster Tools, check URL submission to confirm the earlier batch was received. Receipt is not the same as indexing.

## AI systems

There is no submission form that puts a site into ChatGPT, Copilot, Perplexity, or Claude.

- Keep `robots.txt` allowing those crawlers. It already does.
- `/llms.txt` is generated from the site. Nothing to upload.
- When a profile bio links here, use `https://ammartariq.com` and the same name.

## Professional profiles

Update these so they match the site. The site cannot edit them.

- LinkedIn headline and About: software engineer, React Native, React, TypeScript, Node.js, Karachi, remote worldwide. Remove any line that implies a Gulf office or residence.
- GitHub profile website: `https://ammartariq.com`.
- Upwork overview: same availability. Do not list cities where you do not work on-site.
- Medium profile (`/blog` redirects there): link the author bio to `https://ammartariq.com`.

## External authority

Do not buy links or create city landing pages.

Worth doing when you have something real to say:

- Point GitHub repository descriptions and READMEs at the matching `/work/[slug]` page.
- Publish on the existing Medium account from a project you actually shipped.
- Use the same name and `https://ammartariq.com` anywhere you already have a profile.

Later, use Search Console queries to see which project pages are close to ranking. That is a content decision, not a setup step.
