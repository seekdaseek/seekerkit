// SeekerKit — Seed Vault signing   [Milestone 1]
// Seed Vault can MUTATE a transaction before signing (e.g. compute-unit price), so the
// signer MUST be a TransactionModifyingSigner. A naive PartialSigner staples the signature
// onto the ORIGINAL message and fails silently. This wraps MWA into the correct signer.
export function createSeedVaultSigner(/* mwaSession */) {
  throw new Error('seekerkit: createSeedVaultSigner lands in Milestone 1');
}
