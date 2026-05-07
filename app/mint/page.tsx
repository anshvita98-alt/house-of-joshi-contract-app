"use client";

import { useState } from "react";
import { parseEther } from "viem";
import { useAccount, useWriteContract } from "wagmi";
import { PageIntro, Shell } from "../../components/shell";
import { FIXED_TX_WALLET, HOUSE_OF_JOSHI_CONTRACT, hasContractAddress, houseOfJoshiAbi, tiers } from "../../lib/contract";

export default function MintPage() {
  const account = useAccount();
  const { writeContractAsync, isPending } = useWriteContract();
  const [selectedTier, setSelectedTier] = useState<(typeof tiers)[number]>(tiers[0]);
  const [uri, setUri] = useState("");
  const [status, setStatus] = useState("Choose a tier and add token metadata URI.");
  const recipient = FIXED_TX_WALLET;

  async function mint() {
    if (!hasContractAddress || !HOUSE_OF_JOSHI_CONTRACT) {
      setStatus("Add your NFT contract address in NEXT_PUBLIC_CONTRACT_ADDRESS before minting.");
      return;
    }
    if (!uri) {
      setStatus("Connect wallet and enter metadata URI.");
      return;
    }
    try {
      const hash = await writeContractAsync({
        address: HOUSE_OF_JOSHI_CONTRACT,
        abi: houseOfJoshiAbi,
        functionName: "mint",
        args: [recipient as `0x${string}`, uri, selectedTier.tier],
        value: parseEther(selectedTier.price)
      });
      setStatus(`Mint submitted: ${hash}`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Mint failed.");
    }
  }

  return (
    <Shell>
      <PageIntro eyebrow="Mint" title="Royal Mint">
        Mint directly from the HouseOfJoshiNFT contract using Comm, Elite, or Big Boy tier pricing.
      </PageIntro>
      <section className="tier-grid">
        {tiers.map((tier) => (
          <button className={selectedTier.tier === tier.tier ? "tier-card active" : "tier-card"} key={tier.tier} type="button" onClick={() => setSelectedTier(tier)}>
            <span>Tier {tier.tier}</span>
            <strong>{tier.name}</strong>
            <small>{tier.price} ETH</small>
            <p>{tier.note}</p>
          </button>
        ))}
      </section>
      <section className="form-panel">
        <h2>Mint Details</h2>
        <div className="form-grid">
          <div className="readonly-field">
            <label>Destination Wallet</label>
            <p>{FIXED_TX_WALLET}</p>
          </div>
          <label>Metadata URI<input value={uri} onChange={(event) => setUri(event.target.value)} placeholder="ipfs://.../1.json" /></label>
        </div>
        <div className="actions">
          <button type="button" disabled={isPending || !hasContractAddress} onClick={mint}>Mint {selectedTier.name}</button>
          <span className="status">{status}</span>
        </div>
      </section>
    </Shell>
  );
}
