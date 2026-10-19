# Integrate with Lendwise

Lendwise compares lending markets across EVM chains and Stellar with one standardized dataset. A
lending protocol plugs in **once**, through one adapter contract. From then on it gets everything
the platform does for Aave, Morpho and Compound, with no further work on Lendwise's side.

## Two integration surfaces

| You are…                             | Read                                                               | What you get                                                                                                                                                                                                                                                                  |
| ------------------------------------ | ------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A **Stellar lending protocol**       | [Integrate a Stellar lending protocol](./stellar-lending-protocol) | Your rates in the comparison tables and the [GraphQL API](/api/), hourly history rebuilt from Stellar Hubble, nightly gap healing, user positions and health factor in the portfolio, a ranked entry next to Aave, Morpho and Compound, and the bridge entry point on your USDC markets |
| A **builder moving USDC to Stellar** | [CCTP bridge architecture](./cctp-bridge)                          | How Lendwise moves native USDC from Ethereum, Base, Arbitrum and Optimism into a Stellar wallet with Circle CCTP V2, and the safety rules the flow enforces                                                                                                                    |

## Source code

Lendwise is open source: [github.com/lendwise-fi/lendwise](https://github.com/lendwise-fi/lendwise).
The adapter contract lives in
[`src/lib/protocols/core/types.ts`](https://github.com/lendwise-fi/lendwise/blob/main/src/lib/protocols/core/types.ts),
the contributor guide in
[`src/lib/protocols/README.md`](https://github.com/lendwise-fi/lendwise/blob/main/src/lib/protocols/README.md),
and the bridge in
[`src/lib/execution/cctp/`](https://github.com/lendwise-fi/lendwise/tree/main/src/lib/execution/cctp).

Questions or a protocol to add? Open an issue on the repository.
