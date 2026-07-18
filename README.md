# Lendwise Docs

**[Lendwise](https://lendwise.fi)** is a DeFi lending yield aggregator and optimizer. It tracks the supply and borrow markets of **Aave V3**, **Morpho**, and **Compound V3** across **8 chains**, standardizes every rate to one net-APY methodology, and shows you where your capital earns the most — or costs the least to borrow.

This repository contains the source of the public documentation site, live at **[lendwise.fi/docs](https://lendwise.fi/docs/)**.

## Why Lendwise?

Every protocol reports "APY" differently: some include rewards, some don't; some quote base rates, some net rates; fees may or may not be subtracted. Comparing two lending opportunities usually means comparing two numbers that were never computed the same way. Lendwise fixes that with **one standard** — every rate is a net APY computed the same way for every protocol, so the comparison is finally apples to apples.

## Where to start

New to Lendwise? Read in this order:

1. **[What is Lendwise](https://lendwise.fi/docs/guide/what-is-lendwise)** — the problem it solves and how it solves it.
2. **[Getting started](https://lendwise.fi/docs/guide/getting-started)** — open the app, filter markets, read rates correctly. No wallet or account needed for research.
3. **[The optimizer](https://lendwise.fi/docs/guide/optimization)** — turn comparable rates into an allocation, based on your risk profile and investment horizon.
4. **[Data & methodology](https://lendwise.fi/docs/guide/methodology)** — where every number comes from: sources, update cadence, and exactly how net APY is computed.

## Explore the docs

| Section | What you'll find |
| --- | --- |
| [Guide](https://lendwise.fi/docs/guide/what-is-lendwise) | Product walkthrough — concepts, app usage, optimizer, methodology |
| [GraphQL API](https://lendwise.fi/docs/api/) | Free public API for the full standardized dataset — hourly/daily APY, rate breakdowns, market state. No API key needed |
| [Learn](https://lendwise.fi/docs/learn/) | Educational articles on DeFi lending and yield — protocol comparisons, why the same asset yields differently across markets |
| [Research](https://lendwise.fi/docs/research/) | Original research on yield dispersion across DeFi lending markets |

**Builders:** the [GraphQL API](https://lendwise.fi/docs/api/) exposes the same data that powers the app at `https://lendwise.fi/api/graphql`, with an interactive GraphiQL explorer — just open the endpoint in a browser.

## Community

- **App:** [lendwise.fi](https://lendwise.fi)
- **X / Twitter:** [@lendwisefi](https://x.com/lendwisefi)
- Found an error or something unclear in the docs? Open an issue or a pull request — contributions are welcome.

## Contributing to the docs

The site is built with [VitePress](https://vitepress.dev). To run it locally:

```bash
pnpm install
pnpm dev        # http://localhost:5173
```

- **Fix a page:** every page is a Markdown file (`guide/`, `api/`, `learn/`, `research/`) — edit and open a PR. `pnpm build` checks the site compiles.
- **Add a Learn post:** add `learn/my-post.md` with frontmatter (`title`, `description`, `date`, `author`) — the sidebar and homepage list pick it up automatically.
- **Add a Guide page:** add the file under `guide/` and register it in the sidebar in `.vitepress/config.ts`.

See [CLAUDE.md](CLAUDE.md) for the full architecture notes (content pipeline, CMS, deployment).
