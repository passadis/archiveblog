# CloudBlogger Archive

Static archive of [CloudBlogger@2025](https://archive.cloudblogger.eu),
covering posts from 2022 through 2024. Built with Astro, hosted on
Azure Static Web Apps.

## What this is

The original CloudBlogger site ran on WordPress + MySQL on an Azure
Web App. Older content was migrated to this Astro site so the
WordPress instance can be retired. Newer posts (2025+) live on a
separate active site.

## Develop

Requires Node 20+ (LTS).

```sh
npm install
npm run dev      # local dev server on :4321
npm run build    # static build into dist/
npm run preview  # serve the production build locally
```

## Deploy

Pushes to `main` trigger an Azure Static Web Apps deployment via
GitHub Actions. The workflow file is in
`.github/workflows/azure-static-web-apps.yml`. Configuration for
routing and redirects lives in `staticwebapp.config.json`.

## Project layout

```
.
├── CLAUDE.md                       # Instructions for Claude Code
├── docs/
│   ├── migration-context.md        # How content got here
│   ├── build-plan.md               # Phased task list
│   └── redirects.md                # URL redirect rules
├── src/
│   ├── content/blog/<slug>/        # 42 migrated posts
│   ├── content/config.ts           # Zod schema
│   ├── pages/
│   ├── layouts/
│   └── components/
├── public/                          # static assets
├── staticwebapp.config.json         # SWA routing
└── astro.config.mjs
```

## Content

Posts live in `src/content/blog/<slug>/index.md`. Each post is its own
folder so images can be co-located. See
[`docs/migration-context.md`](docs/migration-context.md) for the full
frontmatter schema and migration notes.

## License

Content © Konstantinos Passadis. Code: see `LICENSE`.
