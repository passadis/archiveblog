# Build Plan

Phased task list. Work top to bottom unless I tell you otherwise.
Tick `[ ]` to `[x]` as tasks are completed. Each phase ends in a
checkpoint — stop, summarize, and confirm with me before moving on.

---

## Phase 1 — Project scaffold

- [x] Run `npm create astro@latest .` in this directory. Pick the
      "Empty" template. Yes to TypeScript (strict). Yes to git init
      only if `.git` doesn't already exist.
- [x] Add Tailwind: `npx astro add tailwind`. Accept the default config.
- [x] Add MDX support (we may not use it, but it's cheap and useful for
      escape hatches): `npx astro add mdx`.
- [x] Add the sitemap integration: `npx astro add sitemap`.
- [x] Create `src/content/config.ts` with the Zod schema from
      `@docs/migration-context.md`.
      *Note: Astro 6 requires this file at `src/content.config.ts`
      (not `src/content/config.ts`); also uses the `glob` loader API
      since the legacy `type: 'content'` was removed in v5.*
- [x] Verify the existing `src/content/blog/` files validate against
      the schema by running `npm run build`.

**Checkpoint 1:** Build is green. 42 posts validate. Stop here.

---

## Phase 2 — Routing and basic pages

- [x] Create `src/pages/index.astro` — homepage listing all posts in
      reverse-chronological order. For now, list every post (42 fits
      on one page). Show: title, date, excerpt, categories. Link to
      the post page.
      *Hero + featured most-recent card + year-grouped 2-col grid.
      Top categories as pills below the hero. Actual post count is 41
      (docs said 42 — 2024 has 17 not 18).*
- [x] Create `src/pages/[year]/[month]/[day]/[slug].astro` — the post
      detail page, using `getStaticPaths()` to generate routes from
      the `date` and `slug` of each post. URLs MUST match the original
      WordPress permalink structure: `/YYYY/MM/DD/<slug>/`. This is
      non-negotiable; see `@docs/redirects.md`.
- [x] Create `src/pages/category/[category].astro` — list posts by
      category. Slugify category names for URLs (e.g.
      "Microsoft365" → `/category/microsoft365/`).
- [x] Create `src/pages/tag/[tag].astro` — list posts by tag.
- [x] Create `src/layouts/BaseLayout.astro` — `<html>`, `<head>`,
      site-wide meta tags, header, footer. Pull `<title>` and meta
      description from props.
      *Includes Astro `<ClientRouter />` for view transitions, OG
      meta, canonical, and a tiny inline script that respects
      `localStorage.theme` for an optional manual override.*
- [x] Create `src/layouts/PostLayout.astro` for post pages, extending
      BaseLayout. Show frontmatter (title, date, author, categories,
      tags) cleanly above the content.
- [x] Run `npm run build` and verify all 42 posts produce HTML files
      at the right URLs. *Build is green — 128 pages: 41 posts +
      home + 404 + 5 categories + ~80 tags + sitemap.*

**Checkpoint 2:** Site builds, all posts have correct URLs, navigation
works. Stop here. I want to look at it before we style.

---

## Phase 3 — Visual design

Done together with Phase 2 at user's request ("modern stylish using
the capabilities of Astro and your creativity").

- [x] Propose 2–3 visual directions with rationale.
      *Picked: Aurora Cloud — modern technical, dark-by-default with
      subtle aurora gradient backdrop, Inter + JetBrains Mono.*
- [x] Implement direction across BaseLayout, PostLayout, the
      homepage, and the category/tag pages.
- [x] Style code blocks. *Shiki dual theme: `github-light` /
      `github-dark-dimmed`, switched via CSS class on `<html>`.*
- [x] Verify mobile rendering. *Tailwind v4 responsive grid; cards
      collapse to 1 column under sm.*

**Checkpoint 3:** Design is locked. Stop here.

---

## Phase 4 — RSS feed and sitemap

- [ ] Add `@astrojs/rss`. Create `src/pages/rss.xml.js` that emits all
      posts. Title and description from site config.
- [ ] Verify `sitemap` integration is producing `/sitemap-index.xml`
      and `/sitemap-0.xml` correctly.
- [ ] Add `<link rel="alternate" type="application/rss+xml">` to
      BaseLayout.
- [ ] Add `<link rel="canonical">` per page (point to current URL by
      default; for the post page, can optionally point to
      `originalUrl` if we want to flag that legacy content lives
      elsewhere — but probably not, since old site is shutting down).

**Checkpoint 4:** Feeds work. Stop here.

---

## Phase 5 — Static Web Apps deployment configuration

- [ ] Create `staticwebapp.config.json` at repo root. Configure:
  - Default route fallback to 404 page (which Astro builds at
    `/404.html`).
  - 301 redirects per `@docs/redirects.md` (these redirect
    archive.cloudblogger.eu legacy patterns; they're a safety net,
    most URLs will already match).
  - Strip trailing slash inconsistency — pick one (Astro defaults to
    `trailingSlash: 'ignore'`; SWA can normalize).
- [ ] Create `.github/workflows/azure-static-web-apps.yml` matching
      what the SWA portal would auto-generate. Inputs: `app_location:
      "/"`, `output_location: "dist"`. Build command: `npm run build`.
- [ ] Add `.gitignore` entries: `dist/`, `node_modules/`, `.astro/`,
      `.env*`.
- [ ] Document deployment process in README.md.

**Checkpoint 5:** Deployable. Stop here. I'll connect to Azure SWA
manually and do the first deploy.

---

## Phase 6 — Image migration (deferred)

Treat this as a separate mini-project. Don't start until I bring it
up. The plan when we do:

- [ ] Decide hosting: Astro `public/` folder vs Azure Blob + CDN.
- [ ] Bulk-download `/wp-content/uploads/` from the old site
      (`wget --mirror` or Azure CLI from the App Service file system,
      whichever's accessible).
- [ ] Place images and run a sed/script across `src/content/blog/`
      to rewrite paths.
- [ ] If using `public/`, switch to Astro `<Image />` component for
      automatic optimization.

---

## Phase 7 — Optional: search

- [ ] Add Pagefind (`pagefind`) — runs at build time, no runtime cost,
      works on static sites. Integrate into header.

---

## After everything

- [ ] Final review: run Lighthouse, check accessibility, verify all
      301 redirects work, check broken-link report.
- [ ] Update README with the live URL.
- [ ] Tag a `v1.0.0` release in git.
