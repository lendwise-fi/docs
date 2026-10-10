# Data and methodology

Lendwise collects lending market data from protocol APIs, chain-specific subgraphs and — for Stellar — the ledger itself. The data is standardized across protocols and chains.

## Data Sources

Each protocol is connected through a dedicated adapter:

- **Aave V3**: official [Aave GraphQL API](https://api.v3.aave.com/graphql).
- **Morpho**: official [Morpho API](https://api.morpho.org/graphql).
- **Compound V3**: chain-specific [subgraphs](https://thegraph.com/explorer).
- **Blend** (Stellar): the pool contracts themselves, read through Soroban RPC with the [Blend SDK](https://www.npmjs.com/package/@blend-capital/blend-sdk). Blend stores each reserve's inputs, not its rates, so supply and borrow APYs are computed from that state exactly as Blend's own app computes them. Lendwise collects Blend's **v2.1** deployment; the v1 and v2 pools, all frozen or on ice, are no longer collected, and their history stays available.
- **Incentives**: protocol rewards and external campaigns from [Merkl](https://app.merkl.xyz/).

Each adapter processes its source independently, so a source failure does not block updates from the other protocols. See the adapter guide to add a protocol.

## Data collection

Lendwise collects a **spot APY snapshot** for every market every 10 minutes. These snapshots are aggregated into hourly averages and then into daily averages for each market.

Hourly averages reduce the impact of individual noisy observations. Daily values include a completeness score based on the number of hourly observations collected.

Missing observations are detected and recovered automatically. Recovered values are marked internally.

## Stellar history

Blend has no subgraph and no history API, so its past market state cannot be fetched from an endpoint. Lendwise reconstructs it from the ledger, using [Stellar Hubble](https://developers.stellar.org/docs/data/analytics/hubble) — the public BigQuery mirror of Stellar:

1. Every write to a pool contract's storage is a row in Hubble. Lendwise reads the rows of the keys that determine a market — the pool's configuration and each reserve's configuration and data.
2. Those writes are replayed into one snapshot of the contract's storage per hour (or per day).
3. Each snapshot is decoded with the same math as the live collection, giving the same standardized fields: supply and borrow APY, supplied and borrowed liquidity, utilization.

The reconstruction is generic across Stellar lending protocols; each protocol only supplies the decoding of its own storage. It fills gaps in Lendwise's own collection and backfills a market's history from its first day. A published sample — every hour of the Blend v2.1 Fixed pool since its deployment — sits in the [Lendwise repository](https://github.com/lendwise-fi/lendwise/tree/main/docs/data/stellar-history).

Two things are not reconstructed: BLND emissions (the reward APY is 0 in rebuilt history) and USD values, which come from another protocol's same-day price of the asset where one exists.

## Market identification

Each market is identified through structured `productId` and structured fields, including its protocol, numeric chain ID, asset and market type, as well as its collateral asset when applicable. Chain names are used only for display. Stellar has no EVM chain ID: its markets use chain ID `-1`, e.g. `blend:v2.1:stellar:pool:<pool>:<asset>:supply`.

Filters use these structured fields rather than parsing market names.

## Data quality

Each adapter is validated before its data is included. Its output is checked for structure, valid values and consistency between markets and APY snapshots.

## Known limitations

Rates are collected as snapshots every 10 minutes and are not streamed in real time.

A newly launched market may not appear until the next indexing cycle.

When a protocol’s official API and interface display different values, Lendwise uses the official API as its source.

## Query the data

Hourly and daily APYs, market states and product metadata are available through the Lendwise GraphQL API.