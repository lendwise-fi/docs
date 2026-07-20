---
title: What actually moves DeFi lending rates
description: DeFi interest rates are market-driven, set directly by supply and
  demand for liquidity.
date: 2026-07-08
author: Lendwise
---
# What Actually Moves DeFi Lending Rates

Interest rates in traditional finance are typically set by central banks or negotiated between counterparties. In DeFi, the main lending markets operate differently: rates are market-driven, produced in shared liquidity pools by the ongoing interaction between lenders and borrowers, without any intermediary in between. That mechanism sits at the core of every DeFi lending market, and understanding it is the starting point for reading any rate.

## Supply and demand for liquidity

Lenders deposit capital into a shared liquidity pool, and borrowers draw their loans from it. Neither side is matched with a specific counterparty: both interact with the pool itself, rather than with each other directly.

Because supply and demand are aggregated in one place, the pool's utilization rate captures their balance in a single variable:

`U = B / S`

where `S` is total supplied and `B` is total borrowed. A market with $10M supplied and $6M borrowed, for instance, runs at a utilization rate of 60%.

## Interest rate as a function of utilization

The borrow rate is set as an increasing function of utilization. As more of the pool's liquidity is lent out, the remaining liquidity becomes scarcer, and the rate rises to reflect that scarcity.

This rate adjustment acts as a feedback loop. A higher rate discourages new borrowing and attracts new supply, pulling utilization back down. A lower rate has the opposite effect: it encourages borrowing and eases supply pressure. Through this loop, the rate continuously pushes the pool toward equilibrium between supply and demand for liquidity.

## The Aave model

The Aave interest-rate model is an industry standard. Its curve is built around a kink: a threshold called optimal utilization (`U*`), where the rate's behavior changes sharply.

The kink exists because of liquidity risk. If utilization approached 100%, no liquidity would remain available for lenders wishing to withdraw, and unlike a bank, a lending pool holds no external reserves to fall back on. In practice, `U*` is typically set around 90%, a trade-off between maximizing capital utilization and keeping a buffer available for withdrawals. That buffer equals `(1 − U*)`.

Below the kink, while `U < U*`, the borrow rate rises moderately along a first slope:

`r_borrow = r_base + (U / U*) × r_slope1`

Above the kink, once `U >= U*`, it rises steeply along a second slope set much larger than the first:

`r_borrow = r_base + r_slope1 + (U − U*) / (1 − U*) × r_slope2`

This steep segment is deliberate. It makes borrowing above `U*` prohibitively expensive, which pushes utilization back below the kink and restores the buffer.

## Borrow rate vs. lending rate

The borrow rate and the lending rate measure two different things. The borrow rate is what borrowers pay on the liquidity they draw. The lending rate is what suppliers earn on the capital they deposit. The lending rate is derived from the borrow rate:

`r_lend = r_borrow × U × (1 − phi)`

The `U` factor reflects the fact that only the borrowed share of the pool generates interest. The `(1 − phi)` factor subtracts the protocol's fee: the share of interest retained by the treasury, which typically funds operations and backstops the protocol against bad debt.

Since utilization is always below 100%, the lending rate is therefore always lower than the borrow rate. The spread between the two is the cost of the pool's liquidity buffer, plus the protocol's fee.

## The Morpho model

Morpho's interest-rate model relies on a kink structure too, but incorporates a dynamic feature on top of it. On Aave, the curve's parameters (`r_base`, `U*`, `r_slope1`, `r_slope2`) are fixed and only move when governance votes to update them, a process that can take days or weeks. On Morpho, they adjust automatically as the market moves, closing that lag.

Its AdaptiveCurveIRM adjusts continuously, based on the gap between observed utilization and a target utilization of 90%. When utilization stays above target, the whole curve shifts upward and rates increase. When utilization stays below target, the curve shifts downward and rates decrease.

Instead of relying on governance to recalibrate parameters manually, the model self-adjusts and converges toward a rate that keeps the market close to its target utilization.

## What this means when reading rates

Rates in these markets are never fixed. They move with supply and demand for liquidity in the pool and can update as often as every block: a single large deposit or repayment is enough to shift them immediately.

Periods of high interest rates are synonymous with liquidity stress: borrowers are competing for scarce liquidity, and the buffer available for withdrawals is thinning. These periods call for careful monitoring, not just an attractive yield.