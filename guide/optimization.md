# The optimizer

The optimizer turns a clean cross-protocol rate feed into a short list of **actions worth taking**. It answers one question: _given what you hold, where should your capital sit?_

## The core insight: same asset, different yield

The same token pays different rates in different places at the same moment. USDC might earn 4.9% on one protocol and 6.8% on another — for holding **the identical asset**. That gap is the single largest, lowest-risk source of leaked yield in DeFi lending, because you're not taking on a new asset or a new risk category to capture it — just a better venue.

Lendwise computes, per asset, the **widest spread** between its best and worst qualifying venue:

```
spread = best_net_apy − worst_net_apy
```

and ranks assets by that spread. A wide spread on a large, liquid asset is the strongest "you're in the wrong market" signal there is.

## What the optimizer surfaces

The optimizer runs over the normalized daily dataset and highlights a rotating set of stories:

| Signal | What it finds | Why it matters |
| --- | --- | --- |
| **Widest spread** | The asset with the largest best-vs-worst net-APY gap across venues | The clearest arbitrage of your own capital — same asset, more yield |
| **Best stablecoin yield** | The highest net supply APY among stablecoin markets | Where idle stables should go today |
| **Biggest mover** | The market whose net APY changed most since yesterday | Rates that just repriced — opportunity or warning |
| **Biggest market** | The largest supply market by TVL | Deep, liquid venues where size can move without slippage |

## Quality gates

Not every high number is a real opportunity. A tiny pool spiking to 30% because one whale borrowed against it is noise, not yield. The optimizer filters aggressively before surfacing anything:

- **Minimum market size** — markets below a TVL floor are ignored, so dust pools with anomalous rates never headline.
- **Data completeness** — a day is only used if enough hourly observations were collected for it; thin days are marked unreliable and dropped.
- **Direction-aware** — supply and borrow are never mixed; a "best rate" for a lender is computed only from supply markets.

## Why net APY, always

The optimizer only ever compares **net** APY, because a base rate and a net rate are different currencies:

- **Supply net** = base − fees + rewards
- **Borrow net** = base + fees − rewards

Two markets quoting "5%" can differ by hundreds of basis points once rewards and fees are accounted for. By normalizing everything to net before ranking, the optimizer compares what you actually earn or pay — not what a protocol chose to advertise.

## From signal to action

Each surfaced signal is a concrete, executable move: _"USDC pays 4.9% here and 6.8% there — move it."_ Lendwise identifies the opportunity; you execute it on the underlying protocol. See [Getting started](/guide/getting-started) for the workflow.

For the exact ingestion, aggregation, and APY-conversion rules behind these numbers, see [Data & methodology](/guide/methodology).
