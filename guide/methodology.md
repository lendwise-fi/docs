# Data and methodology

Lendwise collects lending market data from protocol APIs and chain-specific subgraphs. The data is standardized across protocols and chains.

## Data Sources

Each protocol is connected through a dedicated adapter:

- **Aave V3**: official [Aave GraphQL API](https://api.v3.aave.com/graphql).
- **Morpho**: official [Morpho API](https://api.morpho.org/graphql).
- **Compound V3**: chain-specific [subgraphs](https://thegraph.com/explorer).
- **Incentives**: protocol rewards and external campaigns from [Merkl](https://app.merkl.xyz/).

Each adapter processes its source independently, so a source failure does not block updates from the other protocols. See the adapter guide to add a protocol.

## Data collection

Lendwise collects a **spot APY snapshot** for every market every 10 minutes. These snapshots are aggregated into hourly averages and then into daily averages for each market.

Hourly averages reduce the impact of individual noisy observations. Daily values include a completeness score based on the number of hourly observations collected.

Missing observations are detected and recovered automatically. Recovered values are marked internally.

## Market identification

Each market is identified through structured `productId` and structured fields, including its protocol, numeric chain ID, asset and market type, as well as its collateral asset when applicable. Chain names are used only for display.

Filters use these structured fields rather than parsing market names.

## Data quality

Each adapter is validated before its data is included. Its output is checked for structure, valid values and consistency between markets and APY snapshots.

## Known limitations

Rates are collected as snapshots every 10 minutes and are not streamed in real time.

A newly launched market may not appear until the next indexing cycle.

When a protocol’s official API and interface display different values, Lendwise uses the official API as its source.

## Query the data

Hourly and daily APYs, market states and product metadata are available through the Lendwise GraphQL API.