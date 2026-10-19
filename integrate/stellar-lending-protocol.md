# Integrate a Stellar lending protocol

A Stellar lending protocol joins Lendwise by implementing **one adapter**, in the
[Lendwise repository](https://github.com/lendwise-fi/lendwise). The adapter translates your
contracts into Lendwise's data model; the pipeline, the tables, the optimizer, the portfolio, the
bridge entry point and the monitoring take it from there. Blend v2.1 is integrated this way, and
nothing in the platform names Blend outside its own adapter folder.

## What the adapter provides

| Surface          | Interface                                 | Required | What it feeds                                                                  |
| ---------------- | ----------------------------------------- | -------- | ------------------------------------------------------------------------------ |
| Spot market data | `YieldAdapter.getProducts` / `getApySpot` | yes      | Rates every 10 minutes into `apy_hourly`, daily averages, tables, API, ranking |
| History          | `StellarHistoryDecoder` → `getApyHistory` | no       | Backfill from the market's first day; nightly gap healing                      |
| User positions   | `StellarPositionsAdapter`                 | no       | Supply and borrow rows in the portfolio                                        |
| Risk weights     | `StellarPositionsAdapter.getRiskAccounts` | no       | The health factor of each pool, computed by Lendwise's shared module           |

Each surface is independent: a protocol can start with spot data only and add the others later.

## Identity

| Field       | Rule                                                                                                           | Blend v2.1                                      |
| ----------- | -------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| `id`        | `${provider}_${version}`, unique; it is the registry key and the `protocol_name` in the database               | `blend_v2.1`                                    |
| `provider`  | groups the versions of one protocol                                                                            | `blend`                                         |
| `version`   | the deployment label                                                                                           | `v2.1`                                          |
| `chains`    | Stellar has no EVM chain id; it uses chain id **`-1`**, slug `stellar`                                         | `{ '-1': { slug: 'stellar' } }`                 |
| `productId` | deterministic and timeless: `{provider}:{version}:stellar:{type}:{market}:{asset}:{supply\|borrow}`, lowercase | `blend:v2.1:stellar:pool:<pool>:<asset>:supply` |

Write the **native identifiers** you will need later (contract ids, asset ids) into
`protocol.meta` at `getProducts` time. History and positions read them back from the catalogue
row; nothing ever parses a `productId`.

## 1. Spot market data

```ts
export interface YieldAdapter {
  id: string // 'blend_v2.1'
  name: string // 'Blend v2.1'
  provider: string // 'blend'
  version: string // 'v2.1'
  chains: Record<number, AdapterChain> // { '-1': { slug: 'stellar' } }
  ingestion?: IngestionFloors
  /** false when the protocol cannot enumerate its own markets on-chain. */
  ownsMarketDiscovery?: boolean

  getProducts(opts?: FetchOpts): Promise<(SupplyProduct | BorrowProduct)[]>
  getApySpot(opts?: FetchOpts): Promise<SpotPayload[]>
  getApyHistory?(params: HistoryParams): Promise<HistoryDataPoint[] | HistoryResult>
}
```

- **`getProducts`** returns one catalogue entry per market and side: asset, protocol
  (`provider`, `version`, `chain: { id: -1, name: 'stellar' }`, contract address) and your
  `meta`.
- **`getApySpot`** returns one `SpotPayload` per product: `apy.base`, `apy.rewards`,
  `apy.fees`, `apy.net` as **fractions** (`0.05` = 5 %), and the market state (`supplyAssets`,
  `supplyAssetsUsd`, `utilizationRate`, `assetPriceUsd`, plus the borrow fields for a borrow
  product). Unknown is `null`, never `0`.
- **No on-chain pool list?** Set `ownsMarketDiscovery: false`. The pipeline then passes the
  pools it already knows from the catalogue in `FetchOpts.poolIds` (uppercase strkeys).
- **Rate limits.** Soroban RPC endpoints refuse bursts. Space your reads; Lendwise's own Blend
  adapter serializes every RPC call behind a minimum interval
  ([`createPacedQueue`](https://github.com/lendwise-fi/lendwise/blob/main/src/lib/net/paced-queue.ts)).
  A refused call must **throw**, so the collector retries; returning an empty list records a gap.

The shape is checked in CI: `pnpm adapter:test <id>` validates products and spot payloads
against the strict schemas in `src/lib/protocols/core/validation.ts`.

## 2. History: the Hubble decode hook

Stellar lending protocols publish no history API. Lendwise rebuilds past market state from
[Stellar Hubble](https://developers.stellar.org/docs/data/analytics/hubble), the public BigQuery
mirror of the ledger: every write to a contract's storage is a row; the module replays those rows
into one storage snapshot per hour (or day) and hands each snapshot to **your decoder**. Everything
protocol-specific lives in the decoder; nothing in the module knows any protocol.

```ts
export interface StellarHistoryDecoder {
  /** The Soroban contract that holds this product's state, or null if unknown. */
  contractId(target: HistoryTarget): string | null
  /** The storage keys `decode` reads for this contract. Only these are fetched. */
  ledgerKeys(contractId: string, targets: HistoryTarget[]): xdr.LedgerKey[]
  /** Storage snapshot → history points for one product (one, or none). */
  decode(ctx: {
    contractId: string
    target: HistoryTarget
    bucket: StellarHistoryBucket
  }): HistoryDataPoint[]
  /** No relevant write predates this — bounds the seed scan. */
  stateSince?: Date
  /** Also fetch the contract's events. Off by default: it is a second scan. */
  events?: boolean
}
```

- `target.meta` is the `meta` you wrote at `getProducts` time: read your contract id from it.
- `bucket.state` maps `ledgerKeyHash(key)` to the entry's value at the end of the bucket. Name
  your keys with the helpers `ledgerKeyHash` and `contractInstanceKey`.
- `decode` returns the same `HistoryDataPoint` as the spot pipeline would have produced for that
  hour: same rates, same market fields. Return nothing before the market existed.

With a decoder, `getApyHistory` is one call:

```ts
getApyHistory: async (params) =>
  fetchStellarHubbleHistory({
    client, // a BigQuery client
    targets, // your products, from the catalogue (params.targets when given)
    startTimestamp: params.startTimestamp,
    endTimestamp: params.endTimestamp,
    interval: params.interval, // 'HOUR' | 'DAY'
    decoder: myDecoder,
    onProgress: params.onProgress,
  }),
```

`fetchStellarHubbleHistory` returns `{ points, failures }`: a product with no point is a named
failure, never silence. A query over its byte budget (`HUBBLE_MAX_BYTES_BILLED`, 20 GiB by
default) fails the same way, and the nightly reconcile falls back to neighbouring hours.
`HUBBLE_DRY_RUN=1` prices a query without running it. Blend's decoder is a complete example:
[`blendHistoryDecoder`](https://github.com/lendwise-fi/lendwise/blob/main/src/lib/protocols/blend/common/apy-history.ts).

## 3. Positions and risk weights

```ts
export interface StellarPositionsAdapter {
  getUserSupplyPositions(p: { addresses: string[] }): Promise<SupplyPosition[]>
  getUserBorrowPositions(p: { addresses: string[] }): Promise<BorrowPosition[]>
  getRiskAccounts?(p: { addresses: string[] }): Promise<RiskAccount[]>
}

/** A pool or market a user borrows against — liquidated on its own. */
export interface RiskAccount {
  id: string // `${protocol}:${chainId}:${poolId}:${user}`
  protocol: string
  chainFamily: 'evm' | 'stellar'
  chainId: number // -1
  poolId: string
  user: string
  reserves: RiskReserve[]
}

export interface RiskReserve {
  priceKey: { productId: string; leg: 'asset' | 'collateral' }
  symbol: string
  collateral: number // whole tokens, ≥ 0
  liability: number // whole tokens, ≥ 0
  /** Liquidation-side weight in [0, 1]: Blend c_factor. */
  collateralWeight: number | null
  /** In (0, 1]: Blend l_factor as stored on chain. */
  liabilityWeight: number | null
}
```

- Addresses are `G…` strkeys. Lendwise routes them by wallet family: an EVM adapter never sees a
  Stellar address, and the other way round.
- Return one `RiskAccount` per isolated pool. Lendwise computes the health factor itself:

  `HF = Σ(collateral × price × collateralWeight) / Σ(liability × price ÷ liabilityWeight)`

  Prices come from the oracle prices your spot data already wrote (`priceKey` = the reserve's
  `productId`); there is no second oracle round. A reserve with exposure and no price makes the
  account **unknown**, never zero.

- Give each position its `riskAccountId` so the portfolio shows the right health factor per row.
- An RPC failure must **throw**: the portfolio then shows the rest of the user's data with a
  "partial data" banner instead of a silent empty list.

## 4. Register the adapter

Registration is explicit — three fragments, three registries:

| File                                                 | Add                                                                                                                  |
| ---------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `src/lib/protocols/<name>/<version>/meta.ts`         | `{ '<id>': { displayName, versionName, provider } }`, spread into `PROTOCOLS_META` in `src/config/protocols-meta.ts` |
| `src/lib/protocols/<name>/<version>/presentation.ts` | optional display hooks (pool name, app link), spread into `src/config/protocols-presentation.ts`                     |
| `src/config/protocols-server.ts`                     | the loader in `YIELD_ADAPTERS`; the positions loader in `stellarPositionAdapters()`                                  |

`YIELD_ADAPTERS` is typed by `PROTOCOLS_META`: the compiler refuses a meta entry without a loader.

## 5. Test against the fixture

Lendwise ships a **fixture Stellar adapter** (`stellar_fixture`) that implements the same
contract with constant data. It is what the CI uses to prove that a Stellar venue is ranked next
to EVM venues and covered by the nightly reconcile, without depending on any live protocol. Its
code is the shortest complete example of the contract:
[`src/lib/protocols/stellar/fixture/`](https://github.com/lendwise-fi/lendwise/tree/main/src/lib/protocols/stellar/fixture).
It is registered only on a non-production deployment that opts in (`STELLAR_YIELD_FIXTURE=1`,
read by `isStellarYieldFixtureEnabled`), never in production.

Before opening a pull request:

```bash
pnpm test                       # unit tests, including your adapter's
pnpm adapter:test <id>          # products/spot schemas and targeted history, live
pnpm stellar:history -- --protocol <id> --contract C… --days 30 --dry-run   # prices your decoder's Hubble queries
pnpm stellar:history -- --protocol <id> --contract C… --days 30             # writes the rebuilt series as CSV
```

## What works with no further code

Once the adapter is registered and its rows reach `apy_hourly`:

- **Tables and API.** Your markets appear in the supply and borrow tables, under the `stellar`
  network filter, and in the public GraphQL API. Daily averages aggregate every product of the
  hourly table, whatever its protocol.
- **Ranking.** Rows are ranked by the same rule as Aave, Morpho and Compound, and carry their
  chain family. The family does not change the rank.
- **Bridge.** Every USDC row of the tables, Stellar or EVM, shows a **"Bridge to Stellar"** action
  next to the protocol's own link, which stays. A USDC market on Stellar links into the guided
  CCTP flow with the product pre-filled (`/bridge/stellar?asset=USDC&product=<productId>`), so
  the flow names your venue as the next step once native USDC reaches the user's Stellar wallet.
  An EVM USDC row pre-fills its chain as `source=` when it is a supported CCTP source chain, and
  no source otherwise. See [CCTP bridge architecture](./cctp-bridge).
- **Monitoring.** The nightly reconcile detects missing hours, refetches them through your
  `getApyHistory`, and reports them under the `stellar` family of its report, next to the EVM
  protocols.
- **Portfolio and health factor.** Positions show next to the user's EVM positions, with a
  health factor per pool from your risk weights.
