# Schema & queries

Reference for the Lendwise GraphQL API. Endpoint: `POST https://lendwise.fi/api/graphql`.

## Queries

```graphql
type Query {
  # "Right now" — the single most recent snapshot per product (last 6 hours).
  latestSupplyApy(filters: LatestFilters, first: Int = 100, skip: Int = 0,
                  orderBy: SupplyApyOrderBy = apyNet, orderDirection: OrderDirection = desc): SupplyHourlyResponse!
  latestBorrowApy(filters: LatestBorrowFilters, first: Int = 100, skip: Int = 0,
                  orderBy: BorrowApyOrderBy = apyNet, orderDirection: OrderDirection = asc): BorrowHourlyResponse!

  # Time series. `first` is capped at 500.
  supplyApyHourly(filters: HourlyFilters, first: Int = 100, skip: Int = 0,
                  orderBy: SupplyApyOrderBy = time, orderDirection: OrderDirection = asc): SupplyHourlyResponse!
  supplyApyDaily(filters: DailyFilters, first: Int = 100, skip: Int = 0,
                 orderBy: SupplyApyOrderBy = time, orderDirection: OrderDirection = asc): SupplyDailyResponse!
  borrowApyHourly(filters: BorrowHourlyFilters, first: Int = 100, skip: Int = 0,
                  orderBy: BorrowApyOrderBy = time, orderDirection: OrderDirection = asc): BorrowHourlyResponse!
  borrowApyDaily(filters: BorrowDailyFilters, first: Int = 100, skip: Int = 0,
                 orderBy: BorrowApyOrderBy = time, orderDirection: OrderDirection = asc): BorrowDailyResponse!

  # Metadata.
  products(filters: ProductFilters, first: Int = 100, skip: Int = 0): ProductsResponse!
  productFacets(filters: ProductFilters): ProductFacets!
  productAvailability(productId: String!): [AvailabilityPeriod!]!
}
```

`orderBy` is an **enum**, not a string:

```graphql
enum SupplyApyOrderBy { time  apyNet  apyBase  supplyAssetsUsd  utilizationRate }
enum BorrowApyOrderBy { time  apyNet  apyBase  supplyAssetsUsd  borrowAssetsUsd  utilizationRate }
```

`time` resolves to the hour (hourly queries) or the date (daily queries).

## Filters

```graphql
input DailyFilters {
  productId: String        # exact market, e.g. "aave:v3:ethereum:reserve:0x…:supply"
  productIds: [String!]    # batch of exact productIds — max 50
  protocol: ProtocolName   # aave | morpho | compound
  market: String           # native market name, e.g. "AaveV3Ethereum"
  chainId: Int             # 1, 10, 137, 8453, 42161, 43114, 59144, 56
  asset: String            # loan asset symbol, e.g. "USDC", "WETH"
  minTvlUsd: Float         # ignore markets below this supplied TVL
  includeIneligible: Boolean # raw-data escape hatch: include dust pools & absurd rates
  from: String             # ISO date, inclusive
  to: String               # ISO date, inclusive
  range: String            # shorthand: 7d | 30d | 90d | 180d | 1y (default 30d)
}
```

- Borrow filters additionally accept `collateral: String`.
- Hourly filters are the same minus `range`, and default to the last 24h.
- `LatestFilters` has no `from` / `to` / `range` — the latest queries always read the most recent snapshot within a fixed 6-hour window.
- `ProductFilters` (for `products` / `productFacets`): `productId`, `kind` (supply | borrow), `protocol`, `market`, `chainId`, `asset`, `active` (default true).

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

### Best USDC supply rates right now

```graphql
{
  latestSupplyApy(filters: { asset: "USDC" }, first: 5) {
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

(Default ordering is already `apyNet` descending.)

### Same asset across every venue (the spread)

```graphql
{
  latestSupplyApy(filters: { asset: "USDC" }, first: 50) {
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
  latestBorrowApy(filters: { asset: "USDC", collateral: "WETH" }, first: 5) {
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

(Default ordering is already `apyNet` **ascending** — borrow net is a cost, so cheapest is best. This is the mirror of `latestSupplyApy`, which defaults to descending.)

### 30-day net APY history for one market

```graphql
{
  supplyApyDaily(
    filters: { productId: "aave:v3:ethereum:reserve:0x…:supply", range: "30d" }
    orderBy: time
    orderDirection: asc
  ) {
    items {
      date
      apy { net }
    }
  }
}
```

::: tip Plotting a series?
Also query `productAvailability(productId: …)` and split the series on listing
boundaries — otherwise a chart will draw a line across stretches where the
market didn't exist.
:::

### Discover valid filter values

```graphql
{
  productFacets {
    assets { symbol count }
    chains { id name count }
    protocols { name count }
  }
}
```

## Responses & pagination

Every list query returns `{ items, pagination }`:

```graphql
type PaginationInfo {
  count: Int!       # items in this page
  countTotal: Int!  # total matching the filters (ignoring first/skip)
  limit: Int!       # the first argument
  skip: Int!        # the skip argument
}
```

Page by increasing `skip` in steps of `first` until `skip + count >= countTotal`. `first` is capped at 500.

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
- **Rate limit:** 60 requests/min per IP.
- **Dust filtering:** empty markets and absurd rates are excluded by default; `includeIneligible: true` disables the filter.
