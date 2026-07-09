# What is Lendwise

Lendwise is a **DeFi lending yield aggregator and optimizer**. It tracks the supply and borrow markets of the major lending protocols, normalizes their rates onto a single methodology, and shows you where your capital earns the most — or costs the least to borrow.

## The problem

If you lend or borrow stablecoins on-chain, your yield is scattered across dozens of markets that don't agree on how to report it:

- **Aave V3**, **Morpho** (Blue + MetaMorpho vaults), and **Compound V3** each publish rates differently.
- The same asset — say USDC — trades at materially different rates on different protocols and chains at the same moment.
- "APY" from one protocol includes rewards; from another it doesn't. Some quote a base rate, some a net rate. Fees may or may not be subtracted.

The result: comparing two lending opportunities usually means comparing two numbers that were never computed the same way. Capital ends up parked in the wrong place, quietly under-earning.

## What Lendwise does

Lendwise ingests every tracked market on a fixed cadence and republishes it under **one consistent methodology**:

- **~700 active products** across **~120 assets**
- **8 chains** — Ethereum, Optimism, Polygon, Base, Arbitrum, Avalanche, Linea, and BSC (the last three are Aave-only today)
- **3 protocols** — Aave V3, Morpho (Blue & MetaMorpho), Compound V3
- Rates stored as **APY**, with rewards, fees, and direction handled explicitly (see [Methodology](/guide/methodology))

On top of that clean dataset, the [optimizer](/guide/optimization) highlights the moves that matter: the widest same-asset spreads, the best stablecoin venue right now, and markets that just moved.

## Who it's for

- **Yield-focused lenders** deciding where to supply stablecoins or ETH.
- **Borrowers** minimizing interest and picking the cheapest collateralized market.
- **Analysts and builders** who want a clean, cross-protocol rate feed via the [GraphQL API](/api/).

## Where to go next

- [Getting started](/guide/getting-started) — the fastest path from "curious" to "found a better rate".
- [The optimizer](/guide/optimization) — how Lendwise decides what to surface.
- [GraphQL API](/api/) — query the data yourself.

::: warning Not financial advice
Lendwise is an information tool. DeFi lending carries smart-contract, oracle, liquidation, and market risk. Always do your own research.
:::
