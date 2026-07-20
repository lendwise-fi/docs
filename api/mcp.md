# MCP server

Connect an AI agent to Lendwise. [`@lendwise/mcp`](https://github.com/lendwise-fi/lendwise-mcp) exposes the standardized dataset through five curated [Model Context Protocol](https://modelcontextprotocol.io) tools, so an agent can answer *"I have $1,000 to place in DeFi for the next 6 months — what are the best markets?"* against real yield data in about four tool calls.

Read-only by design: it recommends, it never signs a transaction. No API key — the server holds no secrets and speaks only HTTPS to the public Lendwise API.

## Install

### Hosted (Streamable HTTP)

Point any MCP client at:

```
https://mcp.lendwise.fi/mcp
```

With Claude Code:

```bash
claude mcp add --transport http lendwise https://mcp.lendwise.fi/mcp
```

### Local (stdio)

```jsonc
// claude_desktop_config.json / .mcp.json
{
  "mcpServers": {
    "lendwise": {
      "command": "npx",
      "args": ["-y", "@lendwise/mcp"]
    }
  }
}
```

Requires Node ≥ 24.

## Tools

| Tool | Arguments | Returns |
| --- | --- | --- |
| `list_market_universe` | `kind?` (`supply` \| `borrow`, default `supply`) | Every asset, chain and protocol Lendwise tracks, with counts. **Call this first** — filter values for the other tools come from here, not from memory. |
| `find_best_markets` | `asset?`, `chainId?`, `protocol?` (`aave` \| `morpho` \| `compound`), `minTvlUsd?` (default `1000000`), `limit?` (default 10, max 50) | Current supply markets ranked by net APY. Filtering and sorting run server-side against the latest snapshot. |
| `get_market_details` | `productId` | One market in full: protocol metadata, accepted collaterals, and the current APY split into base / rewards / fees with individual reward items. |
| `get_market_history` | `productId`, `range?` (`7d` \| `30d` \| `90d` \| `180d`, default `90d`) | Daily net-APY series **plus mean / stddev / min / max** — the stability signal a long horizon needs. |
| `optimize_allocation` | `amountUsd`, `productIds` (2–20 markets), `diversification?` (0–100, default 80) | Per-market dollar amounts, blended APY, and a projected 6-month yield, computed by the Lendwise optimizer. |

## The intended flow

1. `list_market_universe` → the assets, chains and protocols that actually exist
2. `find_best_markets({ asset: "USDC" })` → top markets by net APY
3. `get_market_history({ productId, range: "180d" })` on the top candidates → mean/stddev separates a durable 6% from a 12% reward spike that ends next week
4. `optimize_allocation({ amountUsd: 1000, productIds: [...] })` → the split

## Defaults that matter

- **`find_best_markets` defaults to `minTvlUsd: 1000000`.** In a thin market a headline APY is mostly noise; the floor can be lowered deliberately, never silently.
- **`get_market_history` returns statistics, not just a series.** A snapshot cannot tell a durable yield from a reward programme that ends next week; a 180-day standard deviation can.
- **Data quality is surfaced, not hidden.** Every response carries the snapshot timestamp (`asOf`), rows with poor slot completeness are flagged `reliable: false`, and markets with no usable APY are reported as missing — never defaulted to 0.

## Rate limits & errors

The upstream API allows **60 GraphQL requests/min per IP** and **10 optimizer requests/min per IP**. A 429 is surfaced to the agent as an explicitly retryable error carrying `retryAfterSeconds` — clients should back off, not retry-storm.

## Local development

| Env var | Default | Purpose |
| --- | --- | --- |
| `LENDWISE_API_URL` | `https://lendwise.fi` | Point at a local Lendwise API instance instead of production. |

Source, tests and contribution guidelines live in the [lendwise-mcp repository](https://github.com/lendwise-fi/lendwise-mcp).

::: warning Not financial advice
Informational only. APYs are variable and historical yields do not predict future returns.
:::
