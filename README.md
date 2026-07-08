# LendWise Docs

Public documentation site for [LendWise](https://lendwise.fi) — product guide, GraphQL API reference, research, and blog. Built with [VitePress](https://vitepress.dev).

## Develop

```bash
pnpm install
pnpm dev        # http://localhost:5173
pnpm build      # static build → .vitepress/dist
pnpm preview    # serve the built site locally
```

## Structure

```
.vitepress/config.ts   site config: nav, sidebar, search, theme
index.md               home (hero + features)
guide/                 what-is-lendwise · getting-started · optimization · methodology
api/                   GraphQL API overview + schema & queries
research/              research paper landing (fill in the PDF + abstract)
blog/                  index + acquisition posts
public/                logo.svg, favicon.svg, and any PDFs/images
```

## Adding content

- **Blog post:** add `blog/my-post.md` with frontmatter (`title`, `description`), then link it from `blog/index.md` and the sidebar in `.vitepress/config.ts`.
- **Guide page:** add under `guide/` and register in the sidebar.
- **Research PDF:** drop it in `public/` and link as `/your-file.pdf`.

## Deploy (Vercel)

Import the repo as a new Vercel project. Vercel auto-detects **VitePress**:

- **Build command:** `vitepress build` (or `pnpm build`)
- **Output directory:** `.vitepress/dist`
- No `vercel.json` needed.

Suggested domain: `docs.lendwise.fi`.

pnpm 11 note: native-build approval for esbuild lives in `pnpm-workspace.yaml` (`allowBuilds:`), not `package.json`.
