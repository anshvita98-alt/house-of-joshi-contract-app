"use client";

import { useState } from "react";
import { useReadContract, useWriteContract } from "wagmi";
import { PageIntro, Shell, Stat } from "../../components/shell";
import { HOUSE_OF_JOSHI_CONTRACT, hasContractAddress, houseOfJoshiAbi } from "../../lib/contract";
import { shortAddress } from "../../lib/utils";

export default function FractionalPage() {
  const { writeContractAsync, isPending } = useWriteContract();
  const [tokenId, setTokenId] = useState("1");
  const [shards, setShards] = useState("10");
  const [status, setStatus] = useState("Only Big Boy tier owners can split.");
  const parsed = tokenId ? BigInt(tokenId) : BigInt(0);
  const { data: owner } = useReadContract({ address: HOUSE_OF_JOSHI_CONTRACT, abi: houseOfJoshiAbi, functionName: "ownerOf", args: parsed > BigInt(0) ? [parsed] : undefined, query: { enabled: hasContractAddress && parsed > BigInt(0), retry: false } });
  const { data: tier } = useReadContract({ address: HOUSE_OF_JOSHI_CONTRACT, abi: houseOfJoshiAbi, functionName: "tokenTier", args: parsed > BigInt(0) ? [parsed] : undefined, query: { enabled: hasContractAddress && parsed > BigInt(0), retry: false } });
  const { data: fractions } = useReadContract({ address: HOUSE_OF_JOSHI_CONTRACT, abi: houseOfJoshiAbi, functionName: "totalFractions", args: parsed > BigInt(0) ? [parsed] : undefined, query: { enabled: hasContractAddress && parsed > BigInt(0), retry: false } });

  async function split() {
    if (!hasContractAddress || !HOUSE_OF_JOSHI_CONTRACT) {
      setStatus("Add your NFT contract address in NEXT_PUBLIC_CONTRACT_ADDRESS before splitting.");
      return;
    }
    try {
      const hash = await writeContractAsync({ address: HOUSE_OF_JOSHI_CONTRACT, abi: houseOfJoshiAbi, functionName: "splitNFT", args: [BigInt(tokenId), BigInt(shards)] });
      setStatus(`Split submitted: ${hash}`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Split failed.");
    }
  }

  return (
    <Shell>
      <PageIntro eyebrow="Fractions" title="Big Boy Shards">Set the shard count for a tier 3 NFT you own.</PageIntro>
      <section className="form-panel">
        <h2>Split NFT</h2>
        <div className="form-grid">
          <label>Token ID<input type="number" min="1" value={tokenId} onChange={(event) => setTokenId(event.target.value)} /></label>
          <label>Shards<input type="number" min="1" value={shards} onChange={(event) => setShards(event.target.value)} /></label>
        </div>
        <div className="actions"><button type="button" disabled={isPending || !hasContractAddress} onClick={split}>Split NFT</button><span className="status">{status}</span></div>
      </section>
      <section className="stats-grid"><Stat label="Owner" value={shortAddress(owner)} /><Stat label="Tier" value={tier?.toString() || "-"} /><Stat label="Fractions" value={fractions?.toString() || "-"} /></section>
    </Shell>
  );
}
