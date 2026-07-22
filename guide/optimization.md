# The optimizer

Lendwise turns standardized rates into capital allocation. Based on the selected markets, risk profile and investment horizon, the optimizer determines how capital should be split across markets.

## Investment horizon

For both lending and borrowing, the user selects an investment horizon of 1D, 7D, 1M or 1Y. The investment horizon determines the APY window used to evaluate each market. Shorter horizons reflect more recent rates, while longer horizons provide a more stable view of historical performance.

## Lending side

The user first selects an asset to lend, such as USDC, and a risk profile associated with a level of diversification:

- **Conservative**: lower risk, stable yields and higher diversification.
- **Balanced**: optimized risk/reward with moderate diversification.
- **Aggressive**: maximum yield, higher risk and limited diversification.

The optimizer allocates the selected asset across eligible markets on different protocols and chains. It maximizes expected yield while satisfying the diversification level associated with the selected risk profile.

## Borrowing side

The user first selects a loan asset, such as USDC, and a collateral asset, such as WBTC. The borrowing optimizer determines borrowing positions across eligible markets based on the user’s objective and risk profile.

### Price buffer and initial LTV

A borrowing position becomes eligible for liquidation when a decline in the collateral value causes its LTV to reach the market’s liquidation LTV. The price buffer defines the decline in the collateral price that the position is able to absorb before reaching this threshold.

Lendwise recommends a minimum buffer based on the worst daily return of the collateral asset relative to the loan asset observed over the previous year:

**Minimum recommended buffer = −min(0%, minimum daily return over one year)**

When borrowing USDC against WBTC, for example, the recommendation is based on the daily returns of the WBTC price expressed in USDC. If the worst daily return over the previous year was −30%, the minimum recommended buffer is 30%.

Each market has its own liquidation LTV. Lendwise uses this threshold and the selected buffer to calculate a suggested initial LTV for each borrowing position:

**Initial LTV = liquidation LTV × (1 − buffer)**

A larger buffer therefore results in a lower initial LTV. The user can adjust both the buffer and the initial LTV calculated for each market.

### Optimization objective

The user then chooses between two optimization inputs: a target loan amount or an available collateral amount.

**Target loan amount**

The user specifies the amount to borrow, for example 100,000 USDC. The optimizer returns a range of optimal borrowing positions between two objectives:

- **Minimum borrowing cost**: minimizes the overall borrowing cost for the target loan amount.
- **Minimum collateral**: minimizes the amount of collateral required to borrow the target loan amount.

Intermediate solutions represent different trade-offs between borrowing cost and collateral requirements.

**Available collateral**

The user specifies the amount of collateral available, for example 1 WBTC. The optimizer returns a range of optimal borrowing positions between two objectives:

- **Minimum borrowing cost**: minimizes the overall borrowing cost using the available collateral.
- **Maximum loan**: maximizes the amount that can be borrowed using the available collateral.

Intermediate solutions represent different trade-offs between borrowing cost and borrowing capacity. For each solution, Lendwise determines how the collateral and loan amounts should be distributed across eligible markets.