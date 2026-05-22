"use client";

import { useState } from "react";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { PageIntro, Shell, Stat } from "../../components/shell";
import { HOUSE_OF_JOSHI_CONTRACT, hasContractAddress, houseOfJoshiAbi } from "../../lib/contract";
import { formatTimestamp } from "../../lib/utils";

const PARTICIPANTS = [
  "Alice", "Bob", "Charlie", "Diana", "Eve", "Frank", "Grace", "Henry",
  "Iris", "Jack", "Kate", "Leo", "Mia", "Noah", "Olivia", "Peter",
  "Quinn", "Rachel", "Sam", "Tina", "Uma", "Victor", "Wendy", "Xavier"
];

export default function SlotsPage() {
  const account = useAccount();
  const { writeContractAsync, isPending } = useWriteContract();
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [status, setStatus] = useState("NFT holders can spin once every 24 hours to select a random winner.");
  const [spinnerRotation, setSpinnerRotation] = useState(0);

  const { data: balance } = useReadContract({
    address: HOUSE_OF_JOSHI_CONTRACT,
    abi: houseOfJoshiAbi,
    functionName: "balanceOf",
    args: account.address ? [account.address] : undefined,
    query: { enabled: hasContractAddress && Boolean(account.address) }
  });

  const { data: lastSpin } = useReadContract({
    address: HOUSE_OF_JOSHI_CONTRACT,
    abi: houseOfJoshiAbi,
    functionName: "lastSpin",
    args: account.address ? [account.address] : undefined,
    query: { enabled: hasContractAddress && Boolean(account.address) }
  });

  async function spin() {
    if (!hasContractAddress || !HOUSE_OF_JOSHI_CONTRACT) {
      setStatus("Add your NFT contract address in NEXT_PUBLIC_CONTRACT_ADDRESS before spinning.");
      return;
    }

    if (!balance || balance === 0n) {
      setStatus("You must hold a House of Joshi NFT to spin.");
      return;
    }

    setIsSpinning(true);
    setWinner(null);

    try {
      // Animate the spinner
      const spins = 5 + Math.random() * 5; // 5-10 full rotations
      const randomRotation = Math.random() * 360;
      const totalRotation = spins * 360 + randomRotation;
      setSpinnerRotation(totalRotation);

      // Simulate spinning duration
      await new Promise((resolve) => setTimeout(resolve, 3000));

      // Select random winner
      const randomIndex = Math.floor(Math.random() * PARTICIPANTS.length);
      const selectedWinner = PARTICIPANTS[randomIndex];
      setWinner(selectedWinner);

      // Call contract
      const hash = await writeContractAsync({
        address: HOUSE_OF_JOSHI_CONTRACT,
        abi: houseOfJoshiAbi,
        functionName: "dailySpin"
      });
      setStatus(`🎉 Winner: ${selectedWinner}! Spin submitted: ${hash}`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Spin failed.");
    } finally {
      setIsSpinning(false);
    }
  }

  const segmentAngle = 360 / PARTICIPANTS.length;

  return (
    <Shell>
      <PageIntro eyebrow="Slots" title="Joshi Slots">
        Spin the wheel once daily to randomly select a lucky winner from the community.
      </PageIntro>

      <section className="stats-grid">
        <Stat label="Your NFTs" value={balance?.toString() || "0"} />
        <Stat label="Last Spin" value={formatTimestamp(lastSpin)} />
        <Stat label="Winner" value={winner || "Spin to win"} />
      </section>

      <section className="spinner-container">
        <div
          className={`spinner ${isSpinning ? "spinning" : ""}`}
          style={{ transform: `rotate(${spinnerRotation}deg)` }}
        >
          {PARTICIPANTS.map((name, index) => (
            <div
              key={name}
              className="spinner-segment"
              style={{
                transform: `rotate(${index * segmentAngle}deg)`,
                borderLeft: `2px solid rgba(200, 150, 100, 0.3)`,
              }}
            >
              <span style={{ transform: `rotate(${segmentAngle / 2}deg) translateY(-90px)` }}>
                {name}
              </span>
            </div>
          ))}
        </div>
        <div className="spinner-pointer"></div>
      </section>

      <section className="form-panel">
        <button
          type="button"
          disabled={isSpinning || isPending || !hasContractAddress || !balance || balance === 0n}
          onClick={spin}
          className="spin-button"
        >
          {isSpinning ? "Spinning..." : "Spin the Wheel"}
        </button>
        <p className="status">{status}</p>
      </section>
    </Shell>
  );
}
