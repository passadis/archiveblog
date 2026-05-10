# Migration Context

This document captures the full story of how the content in
`src/content/blog/` came to be, so that any decision touching the
content layer can be made with full information.

## The source

- **Origin:** `https://archive.cloudblogger.eu` (Azure Web App, WordPress
  6.8.2 + MySQL)
- **Reason for migration:** The Azure Web App is being retired to cut
  costs. WordPress is the wrong tool for an immutable archive of past
  posts.
- **What was migrated:** All posts published before `2025-01-01`.
  Newer posts (2025+) had already been moved elsewhere by the owner
  before this project began.

## How the migration happened

1. A direct SQL query was run against the WordPress MySQL database
   (default `wp_` table prefix) to extract post fields, joined with
   categories, tags, author, and featured-image URL from the standard
   WP schema (`wp_posts`, `wp_term_relationships`, `wp_term_taxonomy`,
   `wp_terms`, `wp_postmeta`, `wp_users`).
2. Result was exported as CSV (UTF-8). The exporting client did not
   escape embedded double-quotes inside the `post_content` field, so
   the CSV was not RFC 4180-compliant. A custom parser was used to
   re-tokenize records by anchoring on the leading numeric ID and the
   `post_status` enum, then trimming the broken-quote-wrapped
   `post_content` from the middle.
3. Gutenberg block comments (`<!-- wp:paragraph -->` etc.) were
   stripped — they're noise for static rendering.
4. HTML content was converted to Markdown via the
   [`markdownify`](https://pypi.org/project/markdownify/) Python
   library, with `heading_style="ATX"`, `bullets="-"`, and
   `<script>`/`<style>` stripped.
5. Each post was written to `src/content/blog/<slug>/index.md`. The
   per-post folder structure means images can later be co-located with
   the post and referenced relatively (`./hero.png`).

## Inventory

42 posts total:

| Year | Count |
|------|-------|
| 2022 | 10    |
| 2023 | 14    |
| 2024 | 18    |

All published, all unique slugs, all from author `editor` (Konstantinos).

Categories present: Azure (36), Devops (18), Microsoft365 (7),
Co Pilot (2), Uncategorized (1). Posts can have multiple categories.

## Frontmatter Zod schema

Drop this into `src/content/config.ts`:

```ts
import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    date: z.coerce.date(),
    author: z.string(),
    excerpt: z.string().optional(),
    categories: z.array(z.string()).default([]),
    tags: z.array(z.string()).default([]),
    featuredImage: z.string().optional(),
    originalUrl: z.string().url().optional(),
    wordpressId: z.number().optional(),
  }),
});

export const collections = { blog };
```

## Known issues in the migrated content

- **Code blocks have no language tag.** WordPress didn't track
  language, so fenced blocks render as ` ``` ` with no hint. Don't
  retrofit this in bulk; only add language hints where it's worth the
  effort (for high-traffic posts).
- **Image references are absolute paths to the old site.** Every
  `featuredImage` and inline `<img src>` points to
  `/wp-content/uploads/...`. Until images are migrated, the new site
  will need to either: (a) prefix them with
  `https://archive.cloudblogger.eu` so they load from the old host,
  or (b) wait until image migration completes. See build plan.
- **Internal links between posts are absolute** (point to
  `archive.cloudblogger.eu`). Once the new domain is live, a search
  and replace turns them into internal `/YYYY/MM/DD/<slug>/` paths.
- **A few posts have empty `<p></p>` paragraphs at the end** —
  artifacts of the WP editor. Cosmetic, low priority.

## What deliberately wasn't migrated

- Comments
- Categories pages structure (we'll generate fresh from the Zod data)
- WordPress media library (deferred — image hosting is a separate
  decision)
- Pagination metadata, related-posts widgets, sidebar content (we'll
  build these from the Astro side)
- Drafts, revisions, trashed posts, custom post types
