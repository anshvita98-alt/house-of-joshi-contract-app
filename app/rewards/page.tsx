"use client";

import { useState } from "react";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { PageIntro, Shell, Stat } from "../../components/shell";
import { HOUSE_OF_JOSHI_CONTRACT, houseOfJoshiAbi } from "../../lib/contract";
import { formatTimestamp } from "../../lib/utils";

export default function RewardsPage() {
  const account = useAccount();
  const { writeContractAsync, isPending } = useWriteContract();
  const [status, setStatus] = useState("Claim once daily while holding a Joshi NFT.");
  const { data: balance } = useReadContract({ address: HOUSE_OF_JOSHI_CONTRACT, abi: houseOfJoshiAbi, functionName: "balanceOf", args: account.address ? [account.address] : undefined, query: { enabled: Boolean(account.address) } });
  const { data: lastClaim } = useReadContract({ address: HOUSE_OF_JOSHI_CONTRACT, abi: houseOfJoshiAbi, functionName: "lastClaim", args: account.address ? [account.address] : undefined, query: { enabled: Boolean(account.address) } });

  async function claim() {
    try {
      const hash = await writeContractAsync({ address: HOUSE_OF_JOSHI_CONTRACT, abi: houseOfJoshiAbi, functionName: "claimRewards" });
      setStatus(`Claim submitted: ${hash}`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Claim failed.");
    }
  }

  return (
    <Shell>
      <PageIntro eyebrow="Rewards" title="Passive Rewards">Claim reward eligibility from the contract once a day.</PageIntro>
      <section className="stats-grid"><Stat label="Your NFTs" value={balance?.toString() || "0"} /><Stat label="Last Claim" value={formatTimestamp(lastClaim)} /><Stat label="Reward Token" value="$KINGJOSHI ready" /></section>
      <section className="form-panel"><h2>Daily Claim</h2><p>{status}</p><div className="actions"><button type="button" disabled={isPending} onClick={claim}>Claim Rewards</button></div></section>
    </Shell>
  );
}
