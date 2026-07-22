<script setup>
import { data as stats } from '../.vitepress/stats.data'
</script>

# What is Lendwise

Lendwise is a DeFi lending intelligence platform that aggregates, standardizes and analyzes lending markets across protocols and blockchains. It provides a unified view of supply and borrow rates and helps users optimize their capital allocation.

## The problem

DeFi lending is fragmented across protocols, chains and assets. Protocols use different rate conventions, compounding methods, time windows, rewards and fees.

**Aave V3**, **Morpho Blue** and **Compound V3** each publish rates differently. For the same asset, such as USDC, reported APYs can then differ materially across protocols. An APY may include rewards on one protocol but exclude them on another. Some protocols display a base rate, while others display a net one. Fees may or may not be deducted.

As a result, lending markets are not directly comparable.

## What Lendwise does

Lendwise standardizes lending and borrowing data and optimizes capital allocation.

### One standard

Lendwise tracks {{ stats.lendingMarkets }} markets across Aave, Morpho and Compound on {{ stats.standardizedChains }} chains. Every rate is standardized into one comparable net APY, accounting for fees and rewards.

### One allocation

Standardized rates are the foundation for smart capital allocation. Our [optimizer](/guide/optimization) then determines how capital should be allocated across markets based on yield, risk preferences, diversification constraints and investment horizon.

## Who it is for

- **Lenders** looking for attractive yields across markets.
- **Borrowers** seeking to reduce borrowing costs across protocols and chains.
- **Analysts and builders** accessing standardized lending and borrowing data through the [GraphQL API](/api) and our [MCP server](/api/mcp).

## Where to go next

- **[Getting started](/guide/getting-started)** - explore lending markets and compare rates.
- **[The optimizer](/guide/optimization)** - understand how capital allocations are calculated.
- **[GraphQL API](/api/)** - access standardized data.
- **[MCP server](/api/mcp)** - integrate Lendwise into your applications.

<br />

::: warning NOT FINANCIAL ADVICE
Lendwise is an information tool. DeFi lending involves smart contract, oracle, liquidation and market risk. Always conduct your own research.
:::
