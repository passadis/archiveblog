# URL Redirects

## Strategy

The new site mirrors WordPress's permalink structure exactly:
`/YYYY/MM/DD/<slug>/`. Because of that, **most legacy URLs will work
without any redirect rule** — they map 1:1 to the new routes.

The redirects below cover the cases that DON'T map directly: category
archives, tag archives, paginated lists, and feed URLs.

## Where these go

In `staticwebapp.config.json` at the root of the repo. Azure Static Web
Apps reads this file at deploy time. Reference:
https://learn.microsoft.com/en-us/azure/static-web-apps/configuration

## Rules

```jsonc
{
  "routes": [
    // WordPress feed → new RSS feed
    { "route": "/feed", "redirect": "/rss.xml", "statusCode": 301 },
    { "route": "/feed/", "redirect": "/rss.xml", "statusCode": 301 },

    // WordPress category archives — note WP used /category/<slug>/
    // We keep that path. Slugs are the lowercased category name.
    // (Astro pages at src/pages/category/[category].astro handle these.)

    // WordPress tag archives — same: /tag/<slug>/. Pages at
    // src/pages/tag/[tag].astro handle these.

    // WordPress pagination on the homepage: /page/2/, /page/3/, etc.
    // If we don't paginate the homepage (42 posts fit), redirect these
    // back to home.
    { "route": "/page/*", "redirect": "/", "statusCode": 301 },

    // WordPress author archive — only one author. Send to home.
    { "route": "/author/*", "redirect": "/", "statusCode": 301 },

    // WordPress comments feed — gone, no replacement
    { "route": "/comments/feed/", "redirect": "/", "statusCode": 301 },

    // WP admin / login attempts — return 404
    { "route": "/wp-admin/*", "statusCode": 404 },
    { "route": "/wp-login.php", "statusCode": 404 },
    { "route": "/xmlrpc.php", "statusCode": 404 }
  ],
  "responseOverrides": {
    "404": { "rewrite": "/404.html" }
  },
  "trailingSlash": "auto"
}
```

## Slug normalization

WordPress sometimes had category slugs that didn't match the display
name (e.g., display "Co Pilot", slug `copilot`). Verify by checking
the original site's category pages. The migrated frontmatter has
display names, so the Astro `category/[category].astro` page must
generate URLs from the slug, not the display name. Use a slugify
helper:

```ts
function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/[\s_]+/g, '-');
}
```

Verify against the original WP category URLs to make sure the slugs
match. Known mappings:

| Display name | Original slug | Notes |
|---|---|---|
| Azure | `azure` | |
| Devops | `devops` | |
| Microsoft365 | `microsoft365` | |
| Co Pilot | `copilot` | space removed in WP slug |
| Uncategorized | `uncategorized` | |

If our slugifier doesn't produce these, hardcode the mapping.

## Things NOT to redirect

- `https://www.cloudblogger.eu/...` — that's a separate site (the new
  one the owner already moved some posts to). Not our concern.
- Direct media references like `/wp-content/uploads/...` — handle
  these in Phase 6 (image migration), not here.

## Testing

After deploy, hit each of these and verify the right behavior:

- `https://NEW-SITE/2024/12/16/graphql-api-unlimited-flexibility-for-your-ai-applications/`
  → 200, post page renders
- `https://NEW-SITE/category/azure/` → 200, list of Azure posts
- `https://NEW-SITE/tag/azure-ai/` → 200, list of tagged posts
- `https://NEW-SITE/feed/` → 301 → `/rss.xml`
- `https://NEW-SITE/page/2/` → 301 → `/`
- `https://NEW-SITE/wp-admin/` → 404
- `https://NEW-SITE/some-nonexistent-url` → 404 with the custom page
