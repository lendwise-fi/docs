# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Public documentation site for Lendwise (DeFi lending yield aggregator across Aave/Morpho/Compound on 8 chains), built with VitePress. Deployed to `docs.lendwise.fi` and rewritten under `lendwise.fi/docs` by a separate dashboard project (see `base: '/docs/'` in config and the `/docs/:path*` rewrite in `vercel.json`).

## Commands

```bash
pnpm install
pnpm dev        # http://localhost:5173
pnpm build      # static build → .vitepress/dist
pnpm preview    # serve the built site locally
```

No test suite or linter is configured. `pnpm build` (which runs VitePress's Vue/TS compile + markdown build) is the closest thing to a correctness check — run it after touching `.vitepress/config.ts` or theme components.

Package manager is pnpm (see `pnpm-workspace.yaml`, `pnpm-lock.yaml`). Native-build approval for esbuild lives in `pnpm-workspace.yaml`'s `allowBuilds:`, not `package.json`.

## Structure

```
.vitepress/config.ts        site config: nav, sidebar, markdown pipeline, SEO/OG head injection
.vitepress/learn.ts         dependency-free helpers shared by config.ts, learn.data.ts, and theme components
.vitepress/learn.data.ts    VitePress content loader — builds the Learn post list (HomePosts, LearnIndex)
.vitepress/theme/           custom theme: Layout override + registered global components
index.md                    home (hero + features)
guide/                      what-is-lendwise · getting-started · optimization · methodology
api/                        GraphQL API overview + schema & queries
research/                   research paper landing
learn/                      Lendwise Learn — educational posts, one file per post + index.md
public/                     logo.svg, favicon.svg, images, PDFs
```

## Architecture notes

**Learn posts are content-managed, not hand-coded.** They're authored via Pages CMS (config in `.pages.yml`, pointed at the `learn/` collection) with YAML frontmatter (`title`, `titleShort?`, `description`, `date`, `author`, `image?`) and no required H1 in the body. Several mechanisms exist specifically to make CMS-authored posts render correctly without manual per-post work:

- `injectPostHeader` (a markdown-it core rule in `config.ts`) synthesizes an H1 from frontmatter `title` when the body has none, then injects `<PostMeta>` (author/read-time/date/share bar) right after the H1, plus the frontmatter `image` as a cover image.
- `learnSidebarItems()` in `config.ts` builds the `/learn/` sidebar by reading every file in `learn/` at build time and sorting by date — new posts appear automatically without touching the sidebar config. Sidebar label is `titleShort` if set, else `shortTitle(title)` (text before the first colon).
- `transformPageData` in `config.ts` derives Open Graph tags (`og:title`, `og:description`, `og:image`) from frontmatter for any page under `learn/`, so authors publishing through the CMS never write a `head:` block by hand.
- `.vitepress/learn.data.ts` is the second, independent source of the post list (used by `HomePosts`/`LearnIndex` Vue components via VitePress's `createContentLoader`) — it duplicates some of the same date-normalization and reading-time logic as `config.ts`. If you change frontmatter shape or date handling, update both.
- Post dates are date-only (`yyyy-MM-dd`) and always formatted in UTC (`formatDate` in `learn.ts`) — parsing/formatting in local time would show the wrong day for visitors west of UTC and would desync SSR/hydration.

**`.vitepress/learn.ts` has no Node imports on purpose** — it's imported from `config.ts` (Node context), `learn.data.ts` (build context), and Vue theme components (browser context) alike, so keep it dependency-free.

**Adding a Learn post:** either use Pages CMS, or add `learn/my-post.md` by hand with the frontmatter fields above and link it — the sidebar and homepage list pick it up automatically at build time.

**Adding a Guide page:** add under `guide/` and register it in the `sidebar['/guide/']` array in `config.ts` (unlike Learn, Guide sidebar entries are not auto-generated).

**GraphQL API docs (`api/`):** documents Lendwise's public read API at `https://lendwise.fi/api/graphql` (a separate service, not part of this repo). Key domain facts worth preserving in doc edits: all rates are net APY and are floats-as-fractions on the wire (`0.0489` = 4.89%), chains are filtered by numeric `chainId` not name, and `productId` is opaque — don't imply it should be parsed.

**Comments:** Giscus (`GiscusComments.vue`) is enabled on every Learn post automatically via the `Layout` override in `.vitepress/theme/index.ts`, unless frontmatter sets `comments: false`.
