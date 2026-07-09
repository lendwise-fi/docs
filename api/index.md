# GraphQL API

Lendwise exposes its entire normalized dataset through a single GraphQL endpoint. Query hourly and daily APY, full rate breakdowns, market state, and product metadata — the same data that powers the app.

## Endpoint

```
POST https://lendwise.fi/api/graphql
```

Public read queries require no API key. The endpoint speaks standard GraphQL, so any client works — `fetch`, URQL, Apollo, or the built-in explorer.

## Try it

Open the endpoint in a browser to use the interactive GraphiQL explorer, or send a request directly:

```bash
curl -s https://lendwise.fi/api/graphql \
  -H 'Content-Type: application/json' \
  -d '{"query":"{ supplyApyDaily(filters:{asset:\"USDC\"}, first:5, orderBy:\"net\", orderDirection:desc){ items { asset protocol chainId apy { net } } } }"}'
```

## What you can query

| Query | Returns |
| --- | --- |
| `supplyApyHourly` | Latest hourly APY snapshots for supply products |
| `supplyApyDaily` | Daily aggregated APY for supply products |
| `borrowApyHourly` | Latest hourly APY snapshots for borrow pools |
| `borrowApyDaily` | Daily aggregated APY for borrow pools |

Every query supports **filters** (protocol, chain, asset, market, date range), **pagination** (`first`, `skip`), and **ordering** (`orderBy`, `orderDirection`).

## Core concepts

- **All rates are net APY** unless you drill into the breakdown — see [Methodology](/guide/methodology).
- **Rates are fractions in intent, floats on the wire** — `net: 0.0489` means 4.89%.
- **Chains are filtered by numeric `chainId`**, never by name.
- **`productId`** is a stable, structured identifier — filter by it for an exact market, but don't parse it; use the typed `protocol` / `chainId` / `asset` filters instead.

Continue to [Schema & queries](/api/graphql) for the full type reference and copy-paste examples.
