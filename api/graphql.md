# Schema & queries

Reference for the LendWise GraphQL API. Endpoint: `POST https://lendwise.fi/api/graphql`.

## Queries

```graphql
type Query {
  supplyApyHourly(filters: HourlyFilters, first: Int = 100, skip: Int = 0,
                  orderBy: String = "hour", orderDirection: OrderDirection = asc): SupplyHourlyResponse!
  supplyApyDaily(filters: DailyFilters, first: Int = 100, skip: Int = 0,
                 orderBy: String = "date", orderDirection: OrderDirection = asc): SupplyDailyResponse!
  borrowApyHourly(filters: BorrowHourlyFilters, first: Int = 100, skip: Int = 0,
                  orderBy: String = "hour", orderDirection: OrderDirection = asc): BorrowHourlyResponse!
  borrowApyDaily(filters: BorrowDailyFilters, first: Int = 100, skip: Int = 0,
                 orderBy: String = "date", orderDirection: OrderDirection = asc): BorrowDailyResponse!
}
```

## Filters

```graphql
input DailyFilters {
  productId: String        # exact market, e.g. "aave:v3:ethereum:reserve:0x…:supply"
  protocol: ProtocolName   # aave | morpho | compound
  market: String           # native market name, e.g. "AaveV3Ethereum"
  chainId: Int             # 1, 10, 137, 8453, 42161, 43114, 59144, 56
  asset: String            # loan asset symbol, e.g. "USDC", "WETH"
  from: String             # ISO date, inclusive
  to: String               # ISO date, inclusive
  range: String            # shorthand: 7d | 30d | 90d | 180d | 1y (default 30d)
}
```

Borrow filters additionally accept `collateral: String`. Hourly filters default to the last 24h when no range is given.

## The APY breakdown

Every result carries a direction-aware net APY plus its components:

```graphql
type DailyApyBreakdown {
  base: Float!         # protocol IRM rate, before fees, without rewards
  net: Float!          # primary field for comparisons
  rewards: Float!      # summed reward APY (already APR→APY converted)
  fees: Float!         # protocol fee APY
  rewardItems: [RewardItem!]!
}

type RewardItem {
  token: RewardToken!
  apr: Float!          # raw APR from the source, for traceability
  apy: Float!          # (1 + apr/365)^365 - 1
  source: RewardSource!  # protocol | merkl | merit
  program: String
}
```

::: tip
`net` is a fraction: `0.0489` = **4.89% APY**. Multiply by 100 for display.
:::

## Examples

### Best USDC supply rate today

```graphql
{
  supplyApyDaily(
    filters: { asset: "USDC" }
    first: 5
    orderBy: "net"
    orderDirection: desc
  ) {
    items {
      asset
      protocol
      chainId
      apy { net base rewards }
      market { supplyAssetsUsd utilizationRate }
    }
  }
}
```

### Same asset across every venue (the spread)

```graphql
{
  supplyApyDaily(
    filters: { asset: "USDC" }
    first: 50
    orderBy: "net"
    orderDirection: desc
  ) {
    items {
      protocol
      chainId
      apy { net }
      market { supplyAssetsUsd }
    }
    pagination { countTotal }
  }
}
```

Take the first and last `net` — that gap is the [optimizer's](/guide/optimization) core signal.

### Cheapest place to borrow USDC against WETH

```graphql
{
  borrowApyDaily(
    filters: { asset: "USDC", collateral: "WETH" }
    first: 5
    orderBy: "net"
    orderDirection: asc
  ) {
    items {
      protocol
      chainId
      apy { net }
      collaterals { symbol }
      market { borrowAssetsUsd utilizationRate }
    }
  }
}
```

### 30-day net APY history for one market

```graphql
{
  supplyApyDaily(
    filters: { productId: "aave:v3:ethereum:reserve:0x…:supply", range: "30d" }
    orderBy: "date"
    orderDirection: asc
  ) {
    items {
      date
      apy { net }
    }
  }
}
```

## Responses & pagination

Every query returns `{ items, pagination }`:

```graphql
type PaginationInfo {
  count: Int!       # items in this page
  countTotal: Int!  # total matching the filters (ignoring first/skip)
  limit: Int!       # the first argument
  skip: Int!        # the skip argument
}
```

Page by increasing `skip` in steps of `first` until `skip + count >= countTotal`.

## Enums

```graphql
enum ProtocolName { aave  morpho  compound }
enum OrderDirection { asc  desc }
enum RewardSource { protocol  merkl  merit }
```

## Notes

- **Supported chain IDs:** 1 (Ethereum), 10 (Optimism), 137 (Polygon), 8453 (Base), 42161 (Arbitrum), 43114 (Avalanche), 59144 (Linea), 56 (BSC). Avalanche, Linea, and BSC are Aave-only today.
- **Filter chains by `chainId`, not name** — adapter chain names are inconsistent.
- **Rates are always APY**, direction-aware; see [Methodology](/guide/methodology).
