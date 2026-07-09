# Research

Lendwise is built on original research into how lending yield is priced, reported, and dispersed across DeFi protocols. This page hosts our work.

## Working paper

**Cross-Protocol Yield Dispersion in DeFi Lending Markets** _(working title)_

> **Abstract.** _Placeholder — replace with the paper abstract._ We study the dispersion of realized lending yields for identical assets across the major on-chain money markets (Aave V3, Morpho, Compound V3) over multiple chains. Using a normalized, direction-aware APY methodology that converts all reward APRs to compounded APY and nets protocol fees, we quantify the persistent same-asset spread available to lenders, characterize its drivers (incentive programs, utilization dynamics, and fragmentation across chains), and estimate the yield left on the table by capital that does not rebalance.

- **Authors:** _TBD_
- **Status:** Working paper — _draft_
- **Download:** _PDF link TBD — drop the file in `docs/public/` and link it here._

::: info Publishing checklist
1. Add the PDF to `docs/public/research-paper.pdf`.
2. Replace the abstract, authors, and status above.
3. Link the PDF: `[Download the PDF](/research-paper.pdf)`.
4. Add a citation block (BibTeX) below once there's a DOI or arXiv id.
:::

## What the paper formalizes

The research underpins three things you can see in the product:

1. **The same-asset spread is real and persistent** — not a fleeting arbitrage, but a structural feature of fragmented lending markets. This is the basis of the [optimizer](/guide/optimization).
2. **Naïve rate comparison is systematically wrong** — mixing APR with APY, or base with net, mis-ranks markets. Our normalization ([methodology](/guide/methodology)) removes that bias.
3. **Dispersion is measurable and trackable** — quantifying it over time is what the [GraphQL API](/api/) exposes.

## Citing this work

Once published, cite as:

```bibtex
@techreport{lendwise_yield_dispersion,
  title  = {Cross-Protocol Yield Dispersion in DeFi Lending Markets},
  author = {TBD},
  year   = {2026},
  note   = {Working paper, Lendwise},
  url    = {https://docs.lendwise.fi/research/}
}
```

_Have feedback on the methodology or want the dataset? Reach out on [X](https://x.com/lendwise_fi)._
