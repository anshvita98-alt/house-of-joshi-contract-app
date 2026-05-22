"use client";

import Link from "next/link";
import { useAccount, useReadContract } from "wagmi";
import { InfoCard, PageIntro, Shell, Stat } from "../components/shell";
import { HOUSE_OF_JOSHI_CONTRACT, hasContractAddress, houseOfJoshiAbi, targetChain } from "../lib/contract";
import { shortAddress } from "../lib/utils";

export default function DashboardPage() {
  const account = useAccount();
  const { data: balance } = useReadContract({
    address: HOUSE_OF_JOSHI_CONTRACT,
    abi: houseOfJoshiAbi,
    functionName: "balanceOf",
    args: account.address ? [account.address] : undefined,
    query: { enabled: hasContractAddress && Boolean(account.address) }
  });

  return (
    <Shell>
      <PageIntro eyebrow="House of Joshi" title="Royal Member Portal">
        A gold-themed home for the House of Joshi collection, built for minting, holder access, rewards, and future
        community utilities.
      </PageIntro>

      <section className="welcome">
        <div className="welcome-copy">
          <p className="eyebrow">Welcome</p>
          <h2>House of Joshi NFT</h2>
          <p>
            Enter the House, connect your wallet, and explore the collection experience as it grows from minting into
            games, rewards, and member-only features.
          </p>
          <div className="hero-actions">
            <Link className="primary" href="/mint">
              Mint NFT
            </Link>
            <Link className="secondary" href="/collection">
              View Collection
            </Link>
          </div>
        </div>
        <div className="crest-card">
          <img src="/hoj-shield.svg" alt="House of Joshi crest" />
        </div>
      </section>

      <hr className="divider" />

      <section className="card-grid">
        <InfoCard title="Holder Utility">Use holder-only slots, rewards, and fraction controls from one console.</InfoCard>
        <InfoCard title="Royal Design">A clean golden dashboard made for the House of Joshi brand.</InfoCard>
      </section>

      <section className="stats-grid">
        <Stat label="Your NFTs" value={balance?.toString() || "0"} />
        <Stat label="Contract" value={shortAddress(HOUSE_OF_JOSHI_CONTRACT)} />
        <Stat label="Network" value={targetChain.name} />
      </section>
    </Shell>
  );
}
