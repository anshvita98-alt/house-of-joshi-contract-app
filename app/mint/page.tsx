"use client";

import { useState } from "react";
import { parseEther } from "viem";
import { useAccount, useWriteContract } from "wagmi";
import { PageIntro, Shell } from "../../components/shell";
import { FIXED_TX_WALLET, HOUSE_OF_JOSHI_CONTRACT, hasContractAddress, houseOfJoshiAbi } from "../../lib/contract";

const DEFAULT_TIER = 1;
const DEFAULT_PRICE = "0.01";

export default function MintPage() {
  const account = useAccount();
  const { writeContractAsync, isPending } = useWriteContract();
  const [uri, setUri] = useState("");
  const [status, setStatus] = useState("Enter token metadata URI to mint.");
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
        args: [recipient as `0x${string}`, uri, DEFAULT_TIER],
        value: parseEther(DEFAULT_PRICE)
      });
      setStatus(`Mint submitted: ${hash}`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Mint failed.");
    }
  }

  return (
    <Shell>
      <PageIntro eyebrow="Mint" title="Royal Mint">
        Mint directly from the HouseOfJoshiNFT contract.
      </PageIntro>
      <section className="form-panel">
        <h2>Mint Details</h2>
        <div className="form-grid">
          <div className="readonly-field">
            <label>Destination Wallet</label>
            <p>{FIXED_TX_WALLET}</p>
          </div>
          <div className="readonly-field">
            <label>Mint Price</label>
            <p>{DEFAULT_PRICE} ETH</p>
          </div>
          <label>Metadata URI<input value={uri} onChange={(event) => setUri(event.target.value)} placeholder="ipfs://.../1.json" /></label>
        </div>
        <div className="actions">
          <button type="button" disabled={isPending || !hasContractAddress} onClick={mint}>Mint NFT</button>
          <span className="status">{status}</span>
        </div>
      </section>
    </Shell>
  );
}
