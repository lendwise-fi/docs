# Data & methodology

Every rate LendWise shows is produced by the same pipeline, so numbers are comparable across protocols and chains. This page documents exactly how.

## Sources

For each protocol, LendWise reads from the most authoritative source available and reconciles on-chain and off-chain data:

- **Aave V3** — protocol subgraphs + on-chain reserve data.
- **Morpho** — Blue markets and MetaMorpho vaults via the Morpho API + on-chain.
- **Compound V3** — per-chain subgraphs (schemas differ by chain) + on-chain.

When multiple sources are aggregated, one source failing never blocks the others — partial data is better than no data.

## Cadence

```
Every 10 minutes   → collect a spot APY snapshot for every market → apy_hourly
Daily (00:10 UTC)  → aggregate the day's hourly rows → apy_daily
```

- **Hourly** rows are a running average per market per hour — resilient to a single noisy read.
- **Daily** rows are a single averaged value per market per day, and carry a **completeness** score: how many of the day's expected hourly slots were actually captured. Days below the reliability threshold are flagged and excluded from comparisons.

## APR → APY

Protocols report rewards as APR. LendWise converts every APR to APY with daily compounding before it's ever stored or compared:

```
APY = (1 + APR / 365) ^ 365 − 1
```

This matters: a raw 20% reward APR is ~22.1% APY. Comparing an APR from one protocol to an APY from another silently mis-ranks markets. LendWise never does this.

## Net APY

All rates are stored and compared as **net APY**, direction-aware:

- **Supply net** = base − fees + rewards
- **Borrow net** = base + fees − rewards

Each rate also keeps its full breakdown — base, total rewards, fees, and every individual reward token (with source: protocol, Merkl, or Merit) — so you can audit any headline number.

## Normalization rules

A few rules keep cross-protocol data honest:

- **Chains are identified by chain ID, never by name.** Adapters spell the same chain differently ("Ethereum" vs "ethereum"); only the numeric chain ID is canonical.
- **Product identity is structured, not parsed.** Every market has typed fields — provider, chain, asset, kind (supply/borrow) — rather than a string that gets sliced. Filters hit indexed columns, not substrings.
- **Rates are always APY.** No mixing of APR and APY anywhere in the dataset.

## Known limitations

- Rates are snapshots on a 10-minute cadence, not real-time streaming.
- A market appears only once it's been indexed; brand-new markets may lag by up to a cycle.
- Occasional discrepancies between a protocol's official API and its own UI are resolved in favor of the official API. Documented cases are tracked publicly.

## Query it yourself

Everything above is exposed through the [GraphQL API](/api/) — hourly and daily APY, the full breakdown, market state (TVL, utilization, price), and product metadata.
