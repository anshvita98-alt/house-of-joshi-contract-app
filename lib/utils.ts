export function shortAddress(address?: string) {
  if (!address) return "Not set";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatTimestamp(seconds?: bigint) {
  if (!seconds || seconds === BigInt(0)) return "Never";
  return new Date(Number(seconds) * 1000).toLocaleString();
}
