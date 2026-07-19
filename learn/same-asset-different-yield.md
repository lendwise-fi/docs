---
title: "Same asset, different yield: the biggest inefficiency in DeFi lending"
description: Why USDC pays 4.9% in one place and 6.8% in another at the same
  moment — and how to capture the gap without taking on new risk.
date: 2026-07-08
author: Lendwise
---
# Same asset, different yield: the biggest inefficiency in DeFi lending

Here's a number that should bother you more than it does: at almost any moment, the exact same stablecoin earns wildly different yields depending on where you park it. USDC might pay **4.9%** on one lending market and **6.8%** on another — for holding the identical asset, at the identical time.

That gap isn't a glitch. It's a structural feature of how DeFi lending is organized, and it's the single largest source of quietly leaked yield for on-chain lenders.

Hello

$$r_{base}$$

## Why the gap exists

Lending markets are fragmented three ways at once:

- **Across protocols.** Aave, Morpho, and Compound each price risk with their own interest-rate models and utilization curves. The same asset lands at different equilibrium rates.
- **Across chains.** USDC on Base, Arbitrum, and Ethereum are separate markets with separate supply and demand. Rates diverge.
- **Across incentives.** Reward programs (protocol emissions, Merkl, Merit) layer extra APY on some markets and not others — and they turn on and off.

Capital doesn't instantly flow to close these gaps, because moving it costs gas, attention, and a mental tax most people never pay. So the spread persists.

## Why it's the *lowest-risk* yield in DeFi

Most ways to earn more yield mean taking on more risk: a riskier asset, a longer lockup, a newer protocol, leverage. Capturing the same-asset spread means **none of that**. You already hold the asset. You already accept lending risk. You're just choosing a better venue for the same position.

That's what makes it the most attractive optimization available: more yield, same risk surface.

## How to read the spread correctly

There's a catch. To compare two lending rates honestly, they have to be computed the same way — and protocols don't cooperate:

- One quotes a **base rate**, another a **net rate**.
- One includes **rewards**, another doesn't.
- Rewards are quoted as **APR**, base as **APY** — different units entirely.

Compare a net-with-rewards number to a base-without-rewards number and you'll "optimize" your way into a worse position. The only honest comparison is **net APY**, direction-aware:

- **Supply net** = base − fees + rewards
- **Borrow net** = base + fees − rewards

…with every reward APR converted to compounded APY first: `(1 + APR/365)^365 − 1`.

## Doing it in practice

1. Pick your asset (say USDC).
2. List every market for it across protocols and chains.
3. Normalize all of them to net APY.
4. Sort. The spread between top and bottom is your opportunity.
5. Move the position to the top venue — on the underlying protocol.

Steps 2–4 are exactly what Lendwise does automatically, and its [optimizer](/guide/optimization) surfaces the widest same-asset spreads each day so you don't have to scan hundreds of markets by hand.

## The takeaway

If your stablecoins are sitting in "a lending protocol" rather than "the best lending market for them right now," you're almost certainly under-earning — not because you took the wrong risk, but because capital is sticky and rates aren't. The spread is real, it's persistent, and it's yours to capture.

---

**See where your capital should sit → [lendwise.fi](https://lendwise.fi)**

*Not financial advice. DeFi lending carries smart-contract, oracle, and market risk.*