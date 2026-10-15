# CCTP bridge architecture

Lendwise moves **native USDC** from an EVM chain into a user's Stellar wallet with
[Circle CCTP V2](https://developers.circle.com/cctp): USDC is burned on the source chain and
minted on Stellar, with no wrapped asset, no liquidity pool and no third-party bridge. The flow
stops at native USDC in the wallet and in the Lendwise portfolio; supplying it to a Stellar venue
is the user's next step, so the bridge serves any protocol integrated through the
[adapter contract](./stellar-lending-protocol).

Open it at [lendwise.fi/bridge/stellar](https://lendwise.fi/bridge/stellar). A link may carry
`amount`, `source` (a source chain slug: `ethereum`, `base`, `arbitrum` or `optimism`) and
`product` (the venue to name as the next step). Without a `source`, no chain is preselected: the
user picks one.

## Networks and contracts

Stellar is CCTP **domain 27**, on mainnet and testnet. A CCTP domain is not a chain id.

| Contract (Stellar)     | Mainnet                                                    | Testnet                                                    |
| ---------------------- | ---------------------------------------------------------- | ---------------------------------------------------------- |
| `TokenMessengerMinter` | `CAE2G5Z77UP7GYPYGFOWFGW7C7J6I4YP2AFGSADRKQY62SYUFLPNFTXL` | `CDNG7HXAPBWICI2E3AUBP3YZWZELJLYSB6F5CC7WLDTLTHVM74SLRTHP` |
| `MessageTransmitter`   | `CACMENFFJPJMSDAJQLX4R7K3SFZIW2LJSE3R2UMLGSWHFHS353FVXAZV` | `CBJ6MTCKKZG73PMDZCJMSFRD7DQEMI4FKDH7CGDSV4W6FHCRBCQAVVJY` |
| `CctpForwarder`        | `CBZL2IH7F6BIDAA3WBNXYKIXSATJGMSW7K5P5MJ6STX5RXN47TZJDF5T` | `CA66Q2WFBND6V4UEB7RD4SAXSVIWMD6RA4X3U32ELVFGXV5PJK4T4VSZ` |
| USDC issuer            | `GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN` | `GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5` |

| Source chain | Domain | Testnet counterpart | `TokenMessengerV2` (mainnet / testnet)                                                       |
| ------------ | ------ | ------------------- | -------------------------------------------------------------------------------------------- |
| Ethereum     | 0      | Sepolia             | `0x28b5a0e9C621a5BadaA536219b3a228C8168cf5d` / `0x8FE6B999Dc680CcFDD5Bf7EB0974218be2542DAA` |
| Base         | 6      | Base Sepolia        | same                                                                                         |
| Arbitrum     | 3      | Arbitrum Sepolia    | same                                                                                         |
| Optimism     | 2      | —                   | same                                                                                         |

Attestations come from Circle's Iris API: `https://iris-api.circle.com` (mainnet),
`https://iris-api-sandbox.circle.com` (testnet). Each network's addresses are constants in
[`src/lib/execution/cctp/config.ts`](https://github.com/lendwise-fi/lendwise/blob/main/src/lib/execution/cctp/config.ts),
selected by one switch per deployment; no environment variable can point a mainnet burn at a
testnet contract.

## The flow

```text
 quote ─▶ preflight ─▶ (ChangeTrust) ─▶ approve ─▶ burn ─▶ attestation ─▶ mint ─▶ portfolio
   │          │              │              │         │          │            │
 Iris fees  Horizon     user signs      user signs  user signs  Iris poll   user signs
            (Stellar)   (Stellar)       (EVM)       (EVM)       (server)    (Stellar)
```

1. **Quote.** The fee for the pair comes from `GET /v2/burn/USDC/fees/{sourceDomain}/27`.
2. **Preflight** of the recipient's Stellar account, before anything is signed on the EVM side.
3. **ChangeTrust**, only if the account has no USDC trustline.
4. **Approve** the exact amount to `TokenMessengerV2`, only if the allowance is lower.
5. **Burn** with `depositForBurnWithHook`.
6. **Attestation**: Lendwise polls Iris until the message is attested, then validates it.
7. **Mint**: the user signs `mint_and_forward` on the forwarder.
8. The portfolio refreshes and shows the USDC in the wallet.

The recipient is always the Stellar account the user signed in with (SEP-10). It is never typed
in, so it cannot be mistyped.

## Why the forwarder

A Stellar account cannot receive a mint the way an EVM address receives an ERC-20 `mint(to,
amount)`: CCTP messages carry a 32-byte recipient, which Stellar reads as a **contract**. Circle
deploys a `CctpForwarder` for this. The burn sets **both** `mintRecipient` and `destinationCaller`
to the forwarder, and puts the real recipient in the hook data. On Stellar, `mint_and_forward`
validates the message, has `MessageTransmitter.receive_message` mint the USDC to the forwarder
through `TokenMessengerMinter`, and transfers it to the recipient, atomically.

Circle's documentation is explicit: a burn with the user's address as `mintRecipient`, or with the
wrong `destinationCaller`, leaves the funds **permanently unrecoverable**. Lendwise builds the burn
on its server from the network constants above; the browser only signs it.

Hook data, as Circle specifies it:

| Bytes       | Content                                        |
| ----------- | ---------------------------------------------- |
| 0–23        | reserved, all zeros                            |
| 24–27       | version, `0` (uint32)                          |
| 28–31       | length `L` of the recipient (uint32)           |
| 32…(32+L−1) | recipient strkey (`G…`)                        |
| 32+L…       | optional integrator payload (unused)           |

## Decimals

USDC has 6 decimals on every EVM chain and in every CCTP message, and **7 on Stellar**. The amount
is rescaled in the transfer logic, not in the display: a burn of `amount` (6 decimals) mints
`(amount − feeExecuted) × 10` units of Stellar USDC (7 decimals). Lendwise reads the amount the
recipient actually received from the mint transaction's events and stores it next to the
expected amount.

## Trustline before burn

A Stellar account can hold USDC only after a `ChangeTrust` operation, which locks 0.5 XLM of
its reserve. EVM has no equivalent. A mint to an account without a trustline fails — and that
failure would only appear **after** the burn was attested. So the check gates the burn:

| State               | Condition                                                             | What the user sees                                  |
| ------------------- | --------------------------------------------------------------------- | --------------------------------------------------- |
| `unfunded`          | the account does not exist on the ledger                              | how much XLM to send it (testnet: a Friendbot link) |
| `missing-trustline` | no USDC trustline from the network's issuer                           | "Add USDC" — a ChangeTrust to sign                  |
| `insufficient-xlm`  | available XLM < reserve of the new trustline (0.5) + 0.1 XLM for fees | how much XLM is missing                             |
| `limit-too-low`     | trustline limit − balance < amount to receive                         | a ChangeTrust raising the limit                     |
| `not-authorized`    | the issuer has not authorized the trustline                           | the transfer is blocked                             |
| `ready`             | none of the above                                                     | the burn is unlocked                                |

The burn button stays disabled until the state is `ready`. If the trustline disappears between
burn and mint, `mint_and_forward` reverts as a whole: the attested message stays unconsumed and the
mint can be retried once the trustline is back.

## Finality tier and fee

CCTP V2 has two tiers: **Fast** (`minFinalityThreshold = 1000`) and **Standard** (`2000`).
Stellar finalizes in about 5 seconds, so the attestation wait on the source chain dominates the
transfer time; Lendwise uses **Fast by default**:

- Fast when the quote offers the 1000 tier and its fee is at most **5 bps**, Standard otherwise
  (Standard costs 0);
- `maxFee = ⌈amount × feeBps × 1.2 / 10 000⌉`: Circle charges at most `maxFee`, and a `maxFee`
  below the actual fee would revert the burn, so a 20 % margin is added;
- the quote, the tier and the **minimum received** `(amount − maxFee) × 10` are shown before the
  user signs.

Quoted on 2026-10-14: 1 bps from Ethereum, 1.3 bps from Base and Optimism, 1.4 bps from Arbitrum.
If Circle attests a Fast burn at Standard finality instead, the flow keeps waiting and says so.

Limits: at least **1 USDC** per transfer; on mainnet, at most `CCTP_MAX_AMOUNT_USDC` (1,000 USDC by
default), enforced on the server.

## Message validation

Before preparing a mint, Lendwise parses the attested message (148-byte header + `BurnMessageV2`
body) and checks every field it relies on. Iris returns `null` for Stellar addresses in its
decoded view, so the raw bytes are parsed:

| Part   | Field               | Expected                                                                 |
| ------ | ------------------- | ------------------------------------------------------------------------ |
| header | `sourceDomain`      | the source chain's domain                                                |
| header | `destinationDomain` | 27                                                                       |
| header | `recipient`         | Stellar `TokenMessengerMinter`                                           |
| header | `destinationCaller` | `CctpForwarder`                                                          |
| body   | `burnToken`         | USDC of the source chain                                                 |
| body   | `mintRecipient`     | `CctpForwarder`                                                          |
| body   | `amount`            | the planned amount                                                       |
| body   | `messageSender`     | the burn's `depositor`, as its `DepositForBurn` event reports it         |
| body   | `maxFee`            | the planned `maxFee`; `feeExecuted ≤ maxFee`                             |
| body   | `hookData`          | decodes to the signed-in Stellar account                                 |

The sender is the event's `depositor`, not the transaction's `from`: for a burn sent through a
smart account (ERC-4337), the depositor is the smart account, so those burns validate too.

A mismatch stops the flow before any mint. `finalityThresholdExecuted` is recorded, not required
to be 1000.

## Signing and relaying

The user signs every transaction in their own wallets; Lendwise holds no key and pays no fee:

- EVM: approve and burn are signed with the connected wallet, on the source chain (the app asks
  the wallet to switch chain when needed);
- Stellar: ChangeTrust and `mint_and_forward` are prepared by the server, signed by the wallet
  (Freighter, xBull, Lobstr, Albedo), then **validated** by the server before it relays them: one
  operation, the expected contract and function, the stored message and attestation as
  arguments, the signed-in account as source, a valid signature for the configured network.

## Resume and audit

Every transfer is a row in the `bridge_transfers` table, written by the server at each step:

| Status           | Reached when                                                   |
| ---------------- | -------------------------------------------------------------- |
| `planned`        | the burn is planned (quote and preflight re-checked)           |
| `burn_submitted` | the wallet returned the burn transaction hash                  |
| `burn_confirmed` | the server verified the receipt and its `DepositForBurn` event |
| `attested`       | Iris attested the message and it passed validation             |
| `mint_submitted` | the mint transaction was relayed                               |
| `completed`      | the mint succeeded; the received amount is recorded            |
| `failed`         | a step failed; after a burn, the transfer stays resumable      |

The row holds every hash (ChangeTrust, approval, burn, mint), the Iris nonce, the fee executed and
the amount received. It is the audit log, and it is what makes the flow **resumable**: after a
reload, on another device or after a failure, the bridge page lists the signed-in account's
unfinished transfers with "Resume". A burn made outside the page can be imported from its
transaction hash, provided its hook data names the signed-in account. Once a burn exists, the
page never offers to start over — only to resume, so a transfer is never burned twice.

A burn is unique **per owner**: the table's unique index is
`(source_domain, burn_tx_hash, stellar_address)`. A burn hash is public, so a global index would
let anyone register a victim's hash first and block them from importing their own burn.

A relayed mint that Soroban still does not know after its transaction's validity window (300
seconds) plus 30 seconds did not land: the transfer is marked failed (`mint-not-found`) and can
be signed again.

The attestation wait is a series of short server calls, one Iris request each, spaced by a
paced queue: Iris allows 35 requests per second and blocks a client for 5 minutes beyond that.

## Testnet mode

A dedicated staging deployment runs the whole flow on **Stellar testnet** and **Sepolia, Base
Sepolia and Arbitrum Sepolia**, against Circle's sandbox, so anyone can try it without real
funds. One switch per deployment (`NEXT_PUBLIC_STELLAR_NETWORK`) moves the sign-in, the wallet
kit, Horizon, Soroban RPC, the CCTP contracts, Iris and the EVM chains together; production is
always mainnet. A "Testnet" badge in the navigation bar marks the staging deployment, so nobody
mistakes it for lendwise.fi. To try it you need a Stellar wallet set to testnet, testnet XLM from
Friendbot, and testnet USDC from [Circle's faucet](https://faucet.circle.com).
