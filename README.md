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

### First-time setup

1. **Create the Static Web App in Azure**
   - Azure Portal → *Create resource* → *Static Web App*.
   - Plan: Free.
   - Source: *Other* (we already have a workflow committed). Picking
     *GitHub* will make the portal try to commit its own workflow,
     which conflicts with the one in this repo.
   - Once created, open the resource → *Manage deployment token* →
     copy the token.

2. **Add the deployment token to GitHub**
   - In the GitHub repo → *Settings* → *Secrets and variables* →
     *Actions* → *New repository secret*.
   - Name: `AZURE_STATIC_WEB_APPS_API_TOKEN` (must match the workflow).
   - Value: the token from step 1.

3. **Push to `main`**
   - The workflow runs `npm ci`, `npm run build`, then deploys
     `dist/` to SWA.
   - PRs from the same repo also get a preview environment.

### What's deployed

| Path | Source |
| --- | --- |
| `staticwebapp.config.json` | Routes, redirects, security headers |
| `dist/` (built by Astro) | All static HTML, CSS, JS, images |

### Custom domain

After the first deploy, in Azure Portal → SWA resource → *Custom
domains*, add the domain (e.g. `archive.cloudblogger.eu`) and follow
the DNS validation steps. SWA issues a free managed cert.

## Project layout

```text
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
