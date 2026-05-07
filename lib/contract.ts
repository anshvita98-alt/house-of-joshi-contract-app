import { base, baseSepolia } from "wagmi/chains";
import type { Address } from "viem";

const configuredContract = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS?.trim();

export const HOUSE_OF_JOSHI_CONTRACT = configuredContract ? (configuredContract as Address) : undefined;
export const hasContractAddress = Boolean(HOUSE_OF_JOSHI_CONTRACT);

export const targetChain = process.env.NEXT_PUBLIC_CHAIN === "base-sepolia" ? baseSepolia : base;

export const tiers = [
  { tier: 1, name: "Comm", price: "0.0005", note: "Entry mint access and holder utilities." },
  { tier: 2, name: "Elite", price: "0.02", note: "Premium mint with physical order event." },
  { tier: 3, name: "Big Boy", price: "0.08", note: "Top tier with fractional split support." }
] as const;

export const houseOfJoshiAbi = [
  {
    type: "function",
    name: "mint",
    stateMutability: "payable",
    inputs: [
      { name: "to", type: "address" },
      { name: "uri", type: "string" },
      { name: "tier", type: "uint8" }
    ],
    outputs: []
  },
  { type: "function", name: "dailySpin", stateMutability: "nonpayable", inputs: [], outputs: [] },
  { type: "function", name: "claimRewards", stateMutability: "nonpayable", inputs: [], outputs: [] },
  {
    type: "function",
    name: "splitNFT",
    stateMutability: "nonpayable",
    inputs: [
      { name: "tokenId", type: "uint256" },
      { name: "shards", type: "uint256" }
    ],
    outputs: []
  },
  {
    type: "function",
    name: "balanceOf",
    stateMutability: "view",
    inputs: [{ name: "owner", type: "address" }],
    outputs: [{ name: "", type: "uint256" }]
  },
  {
    type: "function",
    name: "ownerOf",
    stateMutability: "view",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [{ name: "", type: "address" }]
  },
  {
    type: "function",
    name: "tokenURI",
    stateMutability: "view",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [{ name: "", type: "string" }]
  },
  {
    type: "function",
    name: "tokenTier",
    stateMutability: "view",
    inputs: [{ name: "", type: "uint256" }],
    outputs: [{ name: "", type: "uint8" }]
  },
  {
    type: "function",
    name: "totalFractions",
    stateMutability: "view",
    inputs: [{ name: "", type: "uint256" }],
    outputs: [{ name: "", type: "uint256" }]
  },
  {
    type: "function",
    name: "lastSpin",
    stateMutability: "view",
    inputs: [{ name: "", type: "address" }],
    outputs: [{ name: "", type: "uint256" }]
  },
  {
    type: "function",
    name: "lastClaim",
    stateMutability: "view",
    inputs: [{ name: "", type: "address" }],
    outputs: [{ name: "", type: "uint256" }]
  },
  { type: "function", name: "tier1Price", stateMutability: "view", inputs: [], outputs: [{ name: "", type: "uint256" }] },
  { type: "function", name: "tier2Price", stateMutability: "view", inputs: [], outputs: [{ name: "", type: "uint256" }] },
  { type: "function", name: "tier3Price", stateMutability: "view", inputs: [], outputs: [{ name: "", type: "uint256" }] }
] as const;
