# SeekerKit

**The SKR-era production kit for Solana Mobile (Seeker) dApps.**
Go from zero to a *published, monetized, Sybil-resistant* Seeker app — not a devnet demo.

> Status: early / work in progress. The Genesis Token gating module is functional today;
> the rest lands across three milestones (see Roadmap). MIT licensed.

## Why

Solana Mobile's own React Native scaffold stops at "connect a wallet and sign a devnet
transaction," and it predates everything the ecosystem now runs on. Since **SKR launched
(Jan 2026)**, the Seeker ecosystem is built around the **Genesis Token** (soulbound
proof-of-device NFT), **Seeker ID** (`.skr`), and SKR rewards — but the integration path
is raw (a bare verification script, no reusable module). SeekerKit is the missing
production layer: the pieces you need to ship a real, SKR-native app, extracted and
hardened from **7 apps already live on the dApp Store**.

## Modules

| Module | What it does | Status |
|---|---|---|
| `genesis-gate` | Verify a wallet holds a **Seeker Genesis Token** → gate rewards/features to real device owners (**Sybil resistance**), with anti-double-claim | **working (WIP)** |
| `seeker-id` | Resolve `.skr` identity; flag verified users | Milestone 1 |
| `signing` | Seed Vault `TransactionModifyingSigner` (mutating-wallet-safe) | Milestone 1 |
| `monetization` | On-chain USDC one-time unlock + subscription | Milestone 2 |
| `push` | FCM + Notifee + backend trigger template | Milestone 2 |
| publishing | dApp Store publisher/app/release-NFT tool + guide | Milestone 3 |

## Quick look — Genesis Token gating

~~~js
import { hasGenesisToken, isFreshClaim } from 'seekerkit';

// rpcUrl: a Helius mainnet URL with your API key, read from env — never hardcode it.
const rpcUrl = process.env.HELIUS_RPC_URL;

const { owns, mints } = await hasGenesisToken(walletAddress, { rpcUrl });
if (!owns) return deny('Seeker device owners only');

// Block transfer-and-reclaim: persist claimed mints yourself (DB/KV).
if (!isFreshClaim(mints[0], alreadyClaimedMints)) return deny('Reward already claimed');

grantReward(walletAddress);
~~~

## Roadmap

- **M1 — Core + identity:** Expo base · MWA connect · Seed Vault signing · Genesis Token gating (hardened) · Seeker ID · branded UI shell.
- **M2 — Monetize + retain:** USDC unlock + subscription · FCM/Notifee push + backend · example app.
- **M3 — Ship + publish:** dApp Store publishing tool + guide · docs · `npx create-seeker-app`.

## Proof of work

Built by [ochinimus / seekdaseek](https://github.com/seekdaseek) — 6 apps live on the
Solana dApp Store on this exact stack (StakeStreak, SolWatch, DeepWork, RiskGuard,
MarketBell, ShadowDrop), plus AgentFeed (x402 paid-data API) and x402-wallet
(dual-rail x402 payer library with real mainnet settlements).

## License

MIT — see [LICENSE](./LICENSE).
