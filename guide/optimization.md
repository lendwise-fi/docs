# The optimizer

Lendwise uses standardized rates to calculate allocation scenarios based on user-selected markets, diversification constraints and rate horizons.

## Rate horizon

For both lending and borrowing, the user selects a rate horizon of 1D, 7D, 1M or 1Y. The rate horizon determines the APY window used to evaluate each market. Shorter horizons reflect more recent rates, while longer horizons provide a broader view of historical rates.

## Lending side

The user first selects an asset to lend, such as USDC, and a diversification level:

- **High diversification**: distributes the allocation across a larger number of eligible markets.
- **Medium diversification**: applies moderate diversification constraints.
- **Low diversification**: allows greater concentration across a smaller number of eligible markets.

The optimizer calculates an allocation scenario for the selected asset across eligible markets on different protocols and chains. It maximizes the APY calculated over the selected rate horizon, subject to the selected diversification constraints.

## Borrowing side

The user first selects a loan asset, such as USDC, and a collateral asset, such as WBTC. The optimizer calculates borrowing scenarios across eligible markets based on the user-selected objective and parameters.

### Price buffer and initial LTV

A borrowing position becomes subject to liquidation when a decline in the collateral value causes its LTV to reach the market’s liquidation LTV. The price buffer defines the decline in the collateral price that the position is able to absorb before reaching this threshold.

Lendwise calculates a historical reference buffer based on the worst daily return of the collateral asset relative to the loan asset observed over the previous year:

Historical reference buffer = −min(0%, minimum daily return over one year)

When borrowing USDC against WBTC, for example, the calculation is based on the daily returns of the WBTC price expressed in USDC. If the worst daily return over the previous year was −30%, the resulting historical reference buffer is 30%. This historical metric is not a recommendation, forecast or guarantee against liquidation.

Each market has its own liquidation LTV. Lendwise uses this threshold and the historical reference buffer to calculate the corresponding initial LTV for each borrowing position:

**Initial LTV = liquidation LTV × (1 − buffer)**

A larger buffer therefore results in a lower initial LTV. The user can adjust both the buffer and the initial LTV calculated for each market.

### Optimization objective

The user then chooses between two optimization inputs: a target loan amount or an available collateral amount.

**Target loan amount**

The user specifies the amount to borrow, for example 100,000 USDC. The optimizer returns a range of calculated borrowing scenarios between two objectives:

- **Minimum borrowing cost**: minimizes the overall borrowing cost for the target loan amount.
- **Minimum collateral**: minimizes the amount of collateral required to borrow the target loan amount.

Intermediate scenarios represent different trade-offs between borrowing cost and collateral requirements.

**Available collateral**

The user specifies the amount of collateral available, for example 1 WBTC. The optimizer returns a range of calculated borrowing scenarios between two objectives:

- **Minimum borrowing cost**: minimizes the overall borrowing cost using the available collateral.
- **Maximum loan**: maximizes the amount that can be borrowed using the available collateral.

Intermediate scenarios represent different trade-offs between borrowing cost and borrowing capacity. For each scenario, Lendwise displays how the collateral and loan amounts would be distributed across eligible markets under the selected parameters.

:::warning Disclaimer
All calculations and scenarios are provided for informational purposes only. They do not constitute investment advice or a recommendation.
:::