"use client";

import { useState } from "react";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { PageIntro, Shell, Stat } from "../../components/shell";
import { HOUSE_OF_JOSHI_CONTRACT, houseOfJoshiAbi } from "../../lib/contract";
import { formatTimestamp } from "../../lib/utils";

export default function SlotsPage() {
  const account = useAccount();
  const { writeContractAsync, isPending } = useWriteContract();
  const [status, setStatus] = useState("NFT holders can spin once every 24 hours.");
  const { data: balance } = useReadContract({ address: HOUSE_OF_JOSHI_CONTRACT, abi: houseOfJoshiAbi, functionName: "balanceOf", args: account.address ? [account.address] : undefined, query: { enabled: Boolean(account.address) } });
  const { data: lastSpin } = useReadContract({ address: HOUSE_OF_JOSHI_CONTRACT, abi: houseOfJoshiAbi, functionName: "lastSpin", args: account.address ? [account.address] : undefined, query: { enabled: Boolean(account.address) } });

  async function spin() {
    try {
      const hash = await writeContractAsync({ address: HOUSE_OF_JOSHI_CONTRACT, abi: houseOfJoshiAbi, functionName: "dailySpin" });
      setStatus(`Spin submitted: ${hash}`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Spin failed.");
    }
  }

  return (
    <Shell>
      <PageIntro eyebrow="Slots" title="Joshi Slots">Spin once daily if your wallet holds a House of Joshi NFT.</PageIntro>
      <section className="stats-grid"><Stat label="Your NFTs" value={balance?.toString() || "0"} /><Stat label="Last Spin" value={formatTimestamp(lastSpin)} /><Stat label="Result" value="Emitted on-chain" /></section>
      <section className="machine"><div>J</div><div>O</div><div>S</div><button type="button" disabled={isPending} onClick={spin}>Spin</button></section>
      <p className="status">{status}</p>
    </Shell>
  );
}
