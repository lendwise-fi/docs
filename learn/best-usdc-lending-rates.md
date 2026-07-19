---
title: How collateralized loans actually work in DeFi
description: Collateral, borrowing limits and liquidations in DeFi.
date: 2026-07-07
author: Lendwise
---
## How collateralized loans work in DeFi

Every collateralized loan follows the same principle: deposit an asset as collateral, borrow against part of its value, and risk liquidation if the position becomes undercollateralized. In DeFi, these rules are enforced entirely by smart contracts rather than by a centralized intermediary. While Aave V3, Compound V3 and Morpho Blue all follow this model, they make very different design choices that directly affect risk, capital efficiency and user experience.

# Managing collateral

Collateral can be handled in two ways. It can either remain idle, serving only as security, or it can be lent out while simultaneously backing the borrower's debt. This second approach is known as collateral rehypothecation, and it is one of the main architectural differences between lending protocols.

Aave V3 rehypothecates collateral by default. Deposited assets immediately enter the shared liquidity pool used by borrowers, allowing them to earn interest from the moment they are supplied. Enabling an asset as collateral does not change this behavior: the asset continues earning yield while securing the borrower's debt. Aave also supports cross-collateralization, allowing multiple supplied assets to jointly secure a single borrowing position.

Two features refine this default behavior. Isolation Mode limits newer or riskier assets by allowing them to act only as standalone collateral, subject to a debt ceiling and a restricted set of borrowable assets. eMode targets highly correlated assets, such as stablecoins or ETH derivatives, by increasing both borrowing capacity and liquidation thresholds within the same category.

Compound V3 does not rehypothecate collateral. Each deployment revolves around a single borrowable asset, while every collateral asset remains locked as security, earning no yield and never being lent to other users.

Morpho Blue also does not rehypothecate collateral, as every market consists of a single collateral asset paired with a single loan asset. A borrower using the wstETH/USDC market, for example, is completely isolated from every other market. There is no cross-collateralization, no shared collateral pool, and no risk sharing across markets. Borrowing against multiple collateral assets simply means opening independent positions in separate markets.

Morpho Vaults improve the depositor experience without changing this architecture. A curator allocates users' deposits across multiple Morpho markets sharing the same loan asset according to predefined allocation limits. Depositors benefit from a single, Aave-like deposit experience, while the underlying markets remain fully isolated.

# How much you can borrow

Every collateralized loan defines a maximum amount that can be borrowed against a given collateral value. This limit is expressed through the maximum loan-to-value ratio, usually written as `maxLTV`. For example, with a `maxLTV` of 70%, depositing $100 of Bitcoin allows borrowing up to $70.

`max_borrow = collateral_value × maxLTV`

Compound V3 follows the same approach, with a dedicated `maxLTV` defined for each collateral asset.

Morpho Blue does not define a separate `maxLTV`. Unlike Aave and Compound, there is no protocol-imposed borrowing limit below the liquidation threshold. Borrowers, or vault curators acting on their behalf, are responsible for maintaining their own safety margin.

# Liquidation and `LLTV`

`LLTV` (Liquidation Loan-to-Value) defines the point at which a position becomes eligible for liquidation.

Continuing the previous example, a borrower opening a position with a `maxLTV` of 70% and an `LLTV` of 80% can initially borrow up to $70 against $100 of Bitcoin. If Bitcoin's price later falls and the debt reaches 80% of the collateral's value, the position becomes liquidatable. A liquidator repays part of the debt in exchange for purchasing the collateral at a discount.

Aave and Compound intentionally separate `maxLTV` from `LLTV`, creating a safety buffer between the maximum borrowing limit and the liquidation threshold. Morpho Blue has no such distinction: because there is no `maxLTV`, `LLTV` is the only borrowing constraint.

# Adjustable or immutable risk parameters

On Aave and Compound, both `maxLTV` and `LLTV` are governance parameters that can be updated after a market is launched as market conditions evolve.

Morpho Blue follows a different philosophy. A market's `LLTV` is fixed when the market is created and cannot be modified afterward, regardless of future governance decisions.

# Comparing lending markets

Comparing lending markets goes far beyond comparing headline APYs. The yield offered by a market is only one side of the equation; understanding the underlying risks is equally important.

Two markets may offer the same APY while exposing users to very different risks. Collateral management, rehypothecation, liquidation rules and governance all shape the risk profile of a lending market.

A meaningful comparison therefore requires evaluating both return and risk, rather than looking at yield alone.