"use client";

import { useEffect, useState } from "react";
import { parseEther } from "viem";
import { useAccount, useBalance, useWriteContract } from "wagmi";
import { PageIntro, Shell, Stat } from "../../components/shell";
import { FIXED_TX_WALLET, HOUSE_OF_JOSHI_CONTRACT, hasContractAddress, houseOfJoshiAbi, targetChain } from "../../lib/contract";
import { shortAddress } from "../../lib/utils";

const DEFAULT_TIER = 1;
const DEFAULT_PRICE = "0.01";

export default function MintPage() {
  const account = useAccount();
  const { writeContractAsync, isPending } = useWriteContract();
  const [uri, setUri] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [metadataJson, setMetadataJson] = useState("");
  const [status, setStatus] = useState("Connect wallet and enter metadata URI to mint.");
  const [mintedCount, setMintedCount] = useState(0);
  const [showJsonInput, setShowJsonInput] = useState(false);

  const recipient = FIXED_TX_WALLET;
  const { data: balance } = useBalance({
    address: account.address,
  });

  const totalPrice = (parseFloat(DEFAULT_PRICE) * parseInt(quantity || "1")).toFixed(4);

  const handleJsonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const json = e.target.value;
    setMetadataJson(json);
    // If valid JSON, you could upload it to IPFS here
    if (json.trim() && isValidJson(json)) {
      setStatus("Valid JSON metadata. Ready to mint.");
    }
  };

  const isValidJson = (str: string) => {
    try {
      JSON.parse(str);
      return true;
    } catch {
      return false;
    }
  };

  async function mint() {
    if (!hasContractAddress || !HOUSE_OF_JOSHI_CONTRACT) {
      setStatus("NFT contract address not configured. Please contact support.");
      return;
    }

    if (!account.address) {
      setStatus("Please connect your wallet first.");
      return;
    }

    if (!uri.trim()) {
      setStatus("Please enter a metadata URI (e.g., ipfs://...)");
      return;
    }

    const qty = parseInt(quantity || "1");
    if (qty < 1 || qty > 100) {
      setStatus("Quantity must be between 1 and 100.");
      return;
    }

    if (balance && parseFloat(balance.formatted) < parseFloat(totalPrice)) {
      setStatus(`Insufficient balance. Need ${totalPrice} ${balance.symbol}, have ${balance.formatted}`);
      return;
    }

    setStatus("Processing mint...");

    try {
      for (let i = 0; i < qty; i++) {
        const uriWithId = uri.endsWith("/") ? `${uri}${i + 1}.json` : `${uri}?id=${i + 1}`;

        const hash = await writeContractAsync({
          address: HOUSE_OF_JOSHI_CONTRACT,
          abi: houseOfJoshiAbi,
          functionName: "mint",
          args: [recipient as `0x${string}`, uriWithId, DEFAULT_TIER],
          value: parseEther(DEFAULT_PRICE)
        });

        setMintedCount((prev) => prev + 1);
        setStatus(`Mint ${i + 1}/${qty} submitted: ${hash.slice(0, 20)}...`);
      }

      setStatus(`✨ Successfully minted ${qty} NFT(s)!`);
      setUri("");
      setQuantity("1");
      setMintedCount(0);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Mint failed. Please try again.");
    }
  }

  return (
    <Shell>
      <PageIntro eyebrow="Mint" title="Royal Mint">
        Mint House of Joshi NFTs directly from the blockchain.
      </PageIntro>

      <section className="stats-grid">
        <Stat label="Contract" value={shortAddress(HOUSE_OF_JOSHI_CONTRACT)} />
        <Stat label="Network" value={targetChain.name} />
        <Stat label="Your Wallet" value={shortAddress(account.address)} />
        <Stat label="Balance" value={balance ? `${balance.formatted} ${balance.symbol}` : "0"} />
      </section>

      <section className="form-panel">
        <h2>Mint Configuration</h2>
        <div className="form-grid">
          <div className="readonly-field">
            <label>Recipient Wallet</label>
            <p>{FIXED_TX_WALLET}</p>
          </div>
          <div className="readonly-field">
            <label>Price per NFT</label>
            <p>{DEFAULT_PRICE} ETH</p>
          </div>
          <label>
            Quantity
            <input
              type="number"
              min="1"
              max="100"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </label>
          <div className="readonly-field">
            <label>Total Cost</label>
            <p>{totalPrice} ETH</p>
          </div>
        </div>
      </section>

      <section className="form-panel">
        <h2>Metadata</h2>
        <div className="form-grid">
          <label>
            Metadata URI
            <input
              value={uri}
              onChange={(e) => setUri(e.target.value)}
              placeholder="ipfs://Qm... or https://..."
            />
          </label>
        </div>
        <div style={{ marginTop: "12px" }}>
          <button
            type="button"
            className="outline"
            onClick={() => setShowJsonInput(!showJsonInput)}
          >
            {showJsonInput ? "Hide JSON Editor" : "Show JSON Editor"}
          </button>
        </div>

        {showJsonInput && (
          <div style={{ marginTop: "16px" }}>
            <label>
              Metadata JSON
              <textarea
                value={metadataJson}
                onChange={handleJsonChange}
                placeholder='{"name": "NFT #1", "description": "...", "image": "ipfs://..."}'
                style={{
                  width: "100%",
                  minHeight: "150px",
                  padding: "10px",
                  borderRadius: "var(--radius)",
                  border: "1px solid var(--gold-line)",
                  background: "rgba(4, 3, 2, 0.72)",
                  color: "var(--cream)",
                  fontFamily: "monospace",
                  fontSize: "13px",
                  marginTop: "8px"
                }}
              />
            </label>
            <p style={{ fontSize: "13px", color: "var(--muted)", marginTop: "8px" }}>
              {isValidJson(metadataJson) ? "✓ Valid JSON" : "⚠ Invalid JSON"}
            </p>
          </div>
        )}
      </section>

      <section className="form-panel">
        <div className="actions">
          <button
            type="button"
            disabled={isPending || !hasContractAddress || !account.address || !uri.trim()}
            onClick={mint}
            className="primary"
            style={{ minHeight: "48px", fontSize: "16px" }}
          >
            {isPending ? "Minting..." : `Mint ${quantity} NFT${parseInt(quantity) !== 1 ? "s" : ""}`}
          </button>
        </div>
        <p className="status" style={{ marginTop: "16px" }}>
          {status}
        </p>
        {mintedCount > 0 && (
          <p style={{ color: "var(--gold-bright)", fontSize: "14px", marginTop: "8px" }}>
            Progress: {mintedCount} / {quantity}
          </p>
        )}
      </section>
    </Shell>
  );
}
