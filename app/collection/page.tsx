"use client";

import { useState } from "react";
import { useReadContract } from "wagmi";
import { PageIntro, Shell, Stat } from "../../components/shell";
import { HOUSE_OF_JOSHI_CONTRACT, hasContractAddress, houseOfJoshiAbi, tiers } from "../../lib/contract";
import { shortAddress } from "../../lib/utils";

export default function CollectionPage() {
  const [tokenId, setTokenId] = useState("1");
  const { data: owner } = useReadContract({
    address: HOUSE_OF_JOSHI_CONTRACT,
    abi: houseOfJoshiAbi,
    functionName: "ownerOf",
    args: tokenId ? [BigInt(tokenId)] : undefined,
    query: { enabled: hasContractAddress && Boolean(tokenId), retry: false }
  });
  const { data: uri } = useReadContract({
    address: HOUSE_OF_JOSHI_CONTRACT,
    abi: houseOfJoshiAbi,
    functionName: "tokenURI",
    args: tokenId ? [BigInt(tokenId)] : undefined,
    query: { enabled: hasContractAddress && Boolean(tokenId), retry: false }
  });
  const { data: tier } = useReadContract({
    address: HOUSE_OF_JOSHI_CONTRACT,
    abi: houseOfJoshiAbi,
    functionName: "tokenTier",
    args: tokenId ? [BigInt(tokenId)] : undefined,
    query: { enabled: hasContractAddress && Boolean(tokenId), retry: false }
  });

  return (
    <Shell>
      <PageIntro eyebrow="Collection" title="Heirloom Lookup">
        Inspect minted token ownership, metadata URI, and tier data from the House of Joshi contract.
      </PageIntro>
      <section className="card-grid">
        {tiers.map((item) => (
          <Stat key={item.tier} label={item.name} value={`${item.price} ETH`} />
        ))}
      </section>
      <section className="form-panel">
        <h2>Token Lookup</h2>
        {!hasContractAddress && <p>Add your NFT contract address later to enable live token lookup.</p>}
        <div className="form-grid">
          <label>
            Token ID
            <input type="number" min="1" value={tokenId} onChange={(event) => setTokenId(event.target.value)} />
          </label>
        </div>
        <section className="stats-grid">
          <Stat label="Owner" value={shortAddress(owner)} />
          <Stat label="Tier" value={tier?.toString() || "-"} />
          <Stat label="Token URI" value={uri || "Not loaded"} />
        </section>
      </section>
    </Shell>
  );
}
