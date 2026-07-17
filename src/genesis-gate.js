// SeekerKit — Genesis Token gating
// Verify a wallet owns a Seeker Genesis Token (SGT) so an app can gate rewards,
// airdrops, or features to REAL Seeker device owners (Sybil resistance).
//
// Method (per Solana Mobile docs): list the wallet's Token-2022 accounts via Helius
// getTokenAccountsByOwnerV2, then confirm membership in the SGT token group. Pair with
// isFreshClaim() to block transfer-to-new-wallet-and-reclaim double claims.
//
// The RPC key MUST come from the environment — never hardcode it.

import { unpackMint, getTokenGroupMemberState } from '@solana/spl-token';
import { Connection, PublicKey } from '@solana/web3.js';

// Official Seeker Genesis Token constants (Solana Mobile docs).
export const SGT = {
  TOKEN_2022_PROGRAM: 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb',
  MINT_AUTHORITY: 'GT2zuHVaZQYZSyQMgJPLzvkmyztfyXg2NJunqFp4p3A4',
  GROUP_MINT: 'GT22s89nU4iWFkNXj1Bw6uYhJJWDRPpShHt4Bk8f99Te',
};

/**
 * hasGenesisToken(walletAddress, { rpcUrl })
 * -> { owns: boolean, mints: string[] }  (the SGT mint(s) held by the wallet)
 * rpcUrl: a Helius mainnet URL carrying your API key, read from env.
 */
export async function hasGenesisToken(walletAddress, { rpcUrl } = {}) {
  if (!rpcUrl) throw new Error('seekerkit: rpcUrl required (Helius mainnet, key from env)');
  const connection = new Connection(rpcUrl);

  const candidates = [];
  let paginationKey = null;
  do {
    const body = {
      jsonrpc: '2.0',
      id: 'seekerkit-sgt',
      method: 'getTokenAccountsByOwnerV2',
      params: [
        walletAddress,
        { programId: SGT.TOKEN_2022_PROGRAM },
        { encoding: 'jsonParsed', limit: 1000, ...(paginationKey ? { paginationKey } : {}) },
      ],
    };
    const res = await fetch(rpcUrl, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    });
    const json = await res.json();
    const accounts = json?.result?.accounts ?? json?.result?.value ?? [];
    for (const acc of accounts) {
      const info = acc?.account?.data?.parsed?.info;
      const amount = info?.tokenAmount?.uiAmount;
      if (info?.mint && amount > 0) candidates.push(info.mint);
    }
    paginationKey = json?.result?.paginationKey ?? null;
  } while (paginationKey);

  const mints = [];
  for (const mint of candidates) {
    if (await isSgtMint(connection, mint)) mints.push(mint);
  }
  return { owns: mints.length > 0, mints };
}

// Confirm a Token-2022 mint belongs to the SGT group.
// NOTE (Milestone 1 hardening): finalize the group-membership decode against the
// live SGT group + validate the mint authority; this is the documented shape.
async function isSgtMint(connection, mintAddress) {
  try {
    const acc = await connection.getAccountInfo(new PublicKey(mintAddress));
    if (!acc) return false;
    const mint = unpackMint(new PublicKey(mintAddress), acc, new PublicKey(SGT.TOKEN_2022_PROGRAM));
    const member = getTokenGroupMemberState(mint);
    return member?.group?.toBase58?.() === SGT.GROUP_MINT;
  } catch {
    return false;
  }
}

/**
 * isFreshClaim(mint, usedMints)
 * Anti-double-claim: false if this SGT mint already claimed. Persist usedMints yourself
 * (DB/KV) so a token can't be transferred to a new wallet and reused.
 */
export function isFreshClaim(mint, usedMints) {
  const set = usedMints instanceof Set ? usedMints : new Set(usedMints || []);
  return !set.has(mint);
}
