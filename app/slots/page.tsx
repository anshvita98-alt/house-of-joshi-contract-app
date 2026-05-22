"use client";

import { useEffect, useState } from "react";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { PageIntro, Shell, Stat } from "../../components/shell";
import { HOUSE_OF_JOSHI_CONTRACT, hasContractAddress, houseOfJoshiAbi } from "../../lib/contract";
import { formatTimestamp } from "../../lib/utils";

interface Participant {
  id: string;
  name: string;
  image: string;
}

const DEFAULT_PARTICIPANTS: Participant[] = [
  { id: "1", name: "Alice", image: "" },
  { id: "2", name: "Bob", image: "" },
  { id: "3", name: "Charlie", image: "" },
  { id: "4", name: "Diana", image: "" },
];

export default function SlotsPage() {
  const account = useAccount();
  const { writeContractAsync, isPending } = useWriteContract();
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState<Participant | null>(null);
  const [status, setStatus] = useState("NFT holders can spin once every 24 hours to select a random winner.");
  const [spinnerRotation, setSpinnerRotation] = useState(0);
  const [participants, setParticipants] = useState<Participant[]>(DEFAULT_PARTICIPANTS);
  const [newName, setNewName] = useState("");
  const [newImage, setNewImage] = useState("");

  // Load participants from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("spinnerParticipants");
    if (saved) {
      try {
        setParticipants(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load participants", e);
      }
    }
  }, []);

  // Save participants to localStorage
  const saveParticipants = (newParticipants: Participant[]) => {
    setParticipants(newParticipants);
    localStorage.setItem("spinnerParticipants", JSON.stringify(newParticipants));
  };

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

  function addParticipant() {
    if (!newName.trim()) {
      setStatus("Please enter a participant name.");
      return;
    }

    const newParticipant: Participant = {
      id: Date.now().toString(),
      name: newName,
      image: newImage
    };

    const updated = [...participants, newParticipant];
    saveParticipants(updated);
    setNewName("");
    setNewImage("");
    setStatus(`Added ${newName} to spinner!`);
  }

  function removeParticipant(id: string) {
    const updated = participants.filter((p) => p.id !== id);
    saveParticipants(updated);
  }

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setNewImage(base64);
      };
      reader.readAsDataURL(file);
    }
  }

  async function spin() {
    if (!hasContractAddress || !HOUSE_OF_JOSHI_CONTRACT) {
      setStatus("Add your NFT contract address in NEXT_PUBLIC_CONTRACT_ADDRESS before spinning.");
      return;
    }

    if (!balance || balance === 0n) {
      setStatus("You must hold a House of Joshi NFT to spin.");
      return;
    }

    if (participants.length === 0) {
      setStatus("Add participants to the spinner first.");
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
      const randomIndex = Math.floor(Math.random() * participants.length);
      const selectedWinner = participants[randomIndex];
      setWinner(selectedWinner);

      // Call contract
      const hash = await writeContractAsync({
        address: HOUSE_OF_JOSHI_CONTRACT,
        abi: houseOfJoshiAbi,
        functionName: "dailySpin"
      });
      setStatus(`🎉 Winner: ${selectedWinner.name}! Spin submitted: ${hash}`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Spin failed.");
    } finally {
      setIsSpinning(false);
    }
  }

  const segmentAngle = 360 / Math.max(participants.length, 1);

  return (
    <Shell>
      <PageIntro eyebrow="Slots" title="Joshi Slots">
        Spin the wheel once daily to randomly select a lucky winner from the community.
      </PageIntro>

      <section className="stats-grid">
        <Stat label="Your NFTs" value={balance?.toString() || "0"} />
        <Stat label="Last Spin" value={formatTimestamp(lastSpin)} />
        <Stat label="Winner" value={winner?.name || "Spin to win"} />
      </section>

      <section className="spinner-container">
        <div
          className={`spinner ${isSpinning ? "spinning" : ""}`}
          style={{
            transform: `rotate(${spinnerRotation}deg)`,
            transition: isSpinning ? "transform 3s cubic-bezier(0.25, 0.46, 0.45, 0.94)" : "none"
          }}
        >
          {participants.map((participant, index) => (
            <div
              key={participant.id}
              className="spinner-segment"
              style={{
                transform: `rotate(${index * segmentAngle}deg)`,
              }}
            >
              {participant.image ? (
                <img
                  src={participant.image}
                  alt={participant.name}
                  style={{
                    width: "60px",
                    height: "60px",
                    borderRadius: "50%",
                    transform: `rotate(${segmentAngle / 2}deg) translateY(-85px)`,
                    border: "2px solid var(--gold-bright)",
                  }}
                />
              ) : (
                <span
                  style={{
                    transform: `rotate(${segmentAngle / 2}deg) translateY(-90px)`,
                    writingMode: "vertical-rl",
                    textOrientation: "mixed",
                    fontSize: "13px",
                    fontWeight: "600",
                  }}
                >
                  {participant.name}
                </span>
              )}
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

      <section className="form-panel">
        <h2>Manage Participants</h2>
        <div className="form-grid">
          <label>
            Participant Name
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Enter name"
            />
          </label>
          <label>
            NFT Image
            <input type="file" accept="image/*" onChange={handleImageUpload} />
          </label>
        </div>
        <div className="actions">
          <button
            type="button"
            onClick={addParticipant}
            className="primary"
          >
            Add Participant
          </button>
        </div>
      </section>

      <section className="form-panel">
        <h2>Current Participants ({participants.length})</h2>
        <div className="participants-table">
          <table>
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {participants.map((participant) => (
                <tr key={participant.id}>
                  <td className="participant-image">
                    {participant.image ? (
                      <img src={participant.image} alt={participant.name} />
                    ) : (
                      <div className="no-image">No Image</div>
                    )}
                  </td>
                  <td>{participant.name}</td>
                  <td>
                    <button
                      type="button"
                      onClick={() => removeParticipant(participant.id)}
                      className="delete-btn"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </Shell>
  );
}
