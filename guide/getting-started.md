# Getting started

A wallet is not required to explore Lendwise and track lending markets. Connect one only to monitor and rebalance your positions.

## 1. Open the app

Open the **[lendwise.fi](https://lendwise.fi)** app to access all markets. Use the Supply and Borrow views to identify lending opportunities and assess borrowing costs. Filter and sort markets based on your objective.

## 2. Understand standardized rates

Every rate is standardized into a comparable net APY, with a detailed breakdown of its components:

- **Net Supply APY** = base APY − fees APY + rewards APY
- **Net Borrow APY** = base APY + fees APY − rewards APY

This makes rates directly comparable across protocols and chains. Expand any market to view its base, fees and incentives APY.

## 3. Manage your positions

Connect your wallet to monitor your lending and borrowing positions across protocols and chains. Lendwise helps you identify potential rebalancing opportunities across markets.

Both EVM and Stellar wallets are supported. For Stellar, choose **Connect Wallet → Stellar Wallet**, then Freighter, xBull, Lobstr or Albedo. Signing in uses [SEP-10](https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0010.md): your wallet signs a challenge transaction that proves you control the address. That transaction is never submitted to the network — no fee, no funds moved. The session is verified by the Lendwise server and survives a page refresh.

## 4. Build with the data

The data powering Lendwise is available through the [GraphQL API](/api/graphql). Use it to build alerts, dashboards or allocation tools. Public queries do not require an API key.

## Next

- [The optimizer](/guide/optimization) — understand how capital allocations are calculated.
- [Data & methodology](/guide/methodology) — understand how rates are standardized.
