# GraphQL API

Lendwise exposes its entire standardized dataset through a single GraphQL endpoint. Query hourly and daily APY, full rate breakdowns, market state, and product metadata — the same data that powers the app.

## Endpoint

```
POST https://lendwise.fi/api/graphql
```

Public read queries require no API key, rate-limited at **60 requests/min per IP**. The endpoint speaks standard GraphQL, so any client works — `fetch`, URQL, Apollo, or the built-in explorer.

## Try it

Open the endpoint in a browser to use the interactive GraphiQL explorer, or send a request directly:

```bash
curl -s https://lendwise.fi/api/graphql \
  -H 'Content-Type: application/json' \
  -d '{"query":"{ latestSupplyApy(filters:{asset:\"USDC\"}, first:5){ items { asset protocol chainId apy { net } } } }"}'
```

(`latestSupplyApy` sorts by net APY descending by default — that one query is "best USDC rates right now".)

## What you can query

| Query | Returns |
| --- | --- |
| `latestSupplyApy` / `latestBorrowApy` | The most recent snapshot per product — "best markets right now" |
| `supplyApyHourly` / `borrowApyHourly` | Hourly APY time series |
| `supplyApyDaily` / `borrowApyDaily` | Daily aggregated APY time series |
| `products` | The product registry — every tracked market with typed metadata |
| `productFacets` | Distinct assets / chains / protocols that exist, with counts — call it first so you never guess a filter value |
| `productAvailability` | A market's listing history — needed to plot series without bridging delisted stretches |

Every list query supports **filters** (protocol, chain, asset, market, TVL floor, date range), **pagination** (`first`, `skip` — `first` capped at 500), and **ordering** (`orderBy` enum + `orderDirection`).

## Core concepts

- **All rates are net APY** unless you drill into the breakdown — see [Methodology](/guide/methodology).
- **Rates are fractions in intent, floats on the wire** — `net: 0.0489` means 4.89%.
- **Chains are filtered by numeric `chainId`**, never by name.
- **`productId`** is a stable, structured identifier — filter by it (or batch with `productIds`) for exact markets, but don't parse it; use the typed `protocol` / `chainId` / `asset` filters instead.
- **Dust is filtered by default** — pools below the TVL floor and absurd rates are excluded; pass `includeIneligible: true` for raw data.

Continue to [Schema & queries](/api/graphql) for the full type reference and copy-paste examples.

Building with an AI agent instead of writing queries by hand? The [MCP server](/api/mcp) exposes this same data as five curated tools.
