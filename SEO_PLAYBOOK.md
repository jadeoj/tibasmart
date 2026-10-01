# TibaSmart branded-search playbook

This document is an internal implementation and launch guide. It is **not linked from the public website** and is not included in the XML sitemap.

## What is already implemented in the site

- Canonical homepage: `https://tibasmart.co.ke/`
- Search title and description focused on TibaSmart HMIS and Kenya
- Open Graph and Twitter preview metadata
- Verified Facebook and Instagram profile links in the footer and Organization `sameAs`
- A Google Maps search action in the footer and a WhatsApp click-to-chat action using the business WhatsApp number
- `Organization`, `WebSite`, and `SoftwareApplication` JSON-LD on the homepage
- Crawlable initial HTML with a meaningful H1, H2, and feature list before JavaScript runs
- `robots.txt` allowing the public site while disallowing `/admin` and `/api/`
- `sitemap.xml` containing only the public homepage
- The admin route is excluded from the sitemap and receives a defensive `noindex,nofollow,noarchive` state in the app

## Important expectation

No implementation can guarantee 100% first-page ownership or a Google Knowledge Panel. Google decides what to show, and results vary by query, location, device, competition, entity confidence, and policy compliance. The realistic goal is to make TibaSmart’s entity signals consistent and strong enough that Google can confidently associate the brand, website, business profile, and third-party references.

## Launch sequence after hosting

### 1. Use one canonical brand identity

Use exactly the same details everywhere:

- Legal/business name: `TibaSmart Solutions Limited`
- Public brand: `TibaSmart`
- Website: `https://tibasmart.co.ke/`
- Email: `info@tibasmart.co.ke`
- Phone: `+254 722 777 069`
- Logo: the same crawlable logo file used by the site

If the company has a physical office, decide on the official public address, postal code, hours, and coordinates before adding them to the site or Google Business Profile. Do not publish placeholder location data.

### 2. Verify the website in Google Search Console

1. Add a **Domain property** for `tibasmart.co.ke`.
2. Verify ownership through the DNS TXT record supplied by Search Console.
3. Inspect `https://tibasmart.co.ke/` with URL Inspection.
4. Submit `https://tibasmart.co.ke/sitemap.xml` in the Sitemaps report.
5. Request indexing for the homepage after the DNS and hosting changes are live.
6. Monitor Page indexing, Enhancements, Manual actions, and Core Web Vitals.

Submitting a sitemap is a crawl hint, not a guarantee of indexing. Use URL Inspection to confirm what Google can fetch and what canonical it selected.

### 3. Claim and verify the Google Business Profile

Only create or claim a profile if TibaSmart is eligible under Google’s Business Profile rules.

1. Search Google Maps and Google Search for the business name and city.
2. Claim an existing profile or create one if it does not exist.
3. Use the same name, phone, website, and real-world address used in official business records.
4. Choose the most accurate primary category; add only relevant secondary categories.
5. Complete the verification method Google provides. Do not create duplicate profiles.
6. Add the website, hours, logo, cover image, services, and a concise business description.
7. Add real photos of the office/team/product where appropriate.
8. Ask genuine customers for honest reviews; never buy, gate, or fabricate reviews.

A Business Profile is not the same thing as Organization structured data. Use both when both are appropriate.

### 4. Complete the Maps and social entity layer

The footer now exposes the publicly discoverable Facebook page, Instagram profile, Google Maps search, and WhatsApp contact action. After hosting, make the profiles reinforce one entity rather than creating disconnected listings. Use the exact brand name, website, phone number, logo, and a short description everywhere. Link the profiles to the canonical website and link the website back to the official profiles.

For Google Maps, claim and verify the official Business Profile at the real operating location. The current footer Maps link is a search link, not a verified place ID, because the project does not yet have a confirmed street address or Google Business Profile URL. Once verified, replace the search link with the official Google Maps place URL and add the profile URL to the Organization `sameAs` array. Do not add a made-up address, coordinates, opening hours, or LocalBusiness markup.

### 5. Build branded entity corroboration

Create or update consistent official profiles and references:

- LinkedIn company page
- Facebook page
- X/Twitter profile
- YouTube channel for demos and explainers
- Local Kenyan business directories that are reputable and relevant
- Healthcare technology partnerships and customer case studies
- Press mentions, conference speaker pages, and association memberships

Link those profiles back to the canonical website and keep the name, URL, phone, and description consistent. Avoid low-quality directory blasts or paid links.

### 6. Publish pages that support branded and non-branded discovery

The homepage is the entity anchor. Add public pages over time for:

- `/about/` — company, team, mission, and operating region
- `/platform/` — what TibaSmart HMIS does
- `/modules/` — patient records, appointments, billing, insurance, pharmacy, inventory, diagnostics, and reporting
- `/integrations/` — verified integrations only
- `/security/` — actual security and privacy practices, not generic claims
- `/contact/` — accurate contact and location information
- Case studies and implementation stories with customer permission

Each indexable page needs its own useful title, description, H1, canonical URL, internal links, and sitemap entry. Do not create thin pages only to occupy more search results.

### 7. Create the sitelink-friendly information architecture

Keep important pages linked from the header or footer with descriptive labels. Use a simple hierarchy:

`Home → Platform → Modules → Integrations → Security → Contact`

Use descriptive anchor text, stable URLs, breadcrumbs on deeper pages, and one clear canonical URL per page. Sitelinks are selected by Google; they cannot be forced with a markup switch.

### 8. Measure the branded takeover

Create a baseline on launch day and check monthly for:

- `TibaSmart`
- `TibaSmart Solutions`
- `TibaSmart HMIS`
- `TibaSmart Kenya`
- `TibaSmart hospital management system`

Record whether the homepage, sitelinks, Business Profile panel, social profiles, and third-party pages appear. Track Search Console impressions/clicks and Business Profile views, calls, website clicks, direction requests, and reviews.

## Hosting checklist

Before launch:

- Point DNS to the final host and use HTTPS.
- Make `https://tibasmart.co.ke/` the only preferred public origin.
- Redirect alternate hostnames to the canonical origin.
- Confirm `/robots.txt` and `/sitemap.xml` return HTTP 200.
- Confirm the sitemap contains only canonical public URLs.
- Confirm `/admin` is not linked in public navigation and remains disallowed/noindex.
- Run URL Inspection after the final domain is live.

## Official references

- [Google Organization structured data](https://developers.google.com/search/docs/appearance/structured-data/organization)
- [Google LocalBusiness structured data](https://developers.google.com/search/docs/appearance/structured-data/local-business)
- [Google sitemap guidance](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)
- [Google Business Profile verification](https://support.google.com/business/answer/7107242)
- [Google Search Console](https://search.google.com/search-console)
