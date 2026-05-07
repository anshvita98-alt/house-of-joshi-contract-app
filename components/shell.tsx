"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useAccount, useDisconnect, useSwitchChain } from "wagmi";
import { targetChain } from "../lib/contract";
import { shortAddress } from "../lib/utils";

const nav = [
  { href: "/", label: "Dashboard" },
  { href: "/mint", label: "Mint" },
  { href: "/collection", label: "Collection" },
  { href: "/slots", label: "Slots" },
  { href: "/rewards", label: "Rewards" },
  { href: "/fractional", label: "Fractions" }
];

export function GoldConnectButton({ compact = false }: { compact?: boolean }) {
  return (
    <ConnectButton.Custom>
      {({ account, chain, mounted, openAccountModal, openChainModal, openConnectModal }) => {
        const connected = mounted && account && chain;
        if (!connected) {
          return (
            <button className={compact ? "connect compact" : "connect"} type="button" onClick={openConnectModal}>
              {compact ? "Connect" : "Connect Wallet"}
            </button>
          );
        }
        if (chain.unsupported) {
          return (
            <button className={compact ? "connect compact" : "connect"} type="button" onClick={openChainModal}>
              Wrong Network
            </button>
          );
        }
        return (
          <button className={compact ? "connect compact" : "connect"} type="button" onClick={openAccountModal}>
            {account.displayName}
          </button>
        );
      }}
    </ConnectButton.Custom>
  );
}

export function SidebarWallet() {
  const account = useAccount();
  const { disconnect } = useDisconnect();
  const { switchChainAsync } = useSwitchChain();

  useEffect(() => {
    if (account.isConnected && account.chainId && account.chainId !== targetChain.id) {
      switchChainAsync({ chainId: targetChain.id }).catch(() => {});
    }
  }, [account.chainId, account.isConnected, switchChainAsync]);

  return (
    <div className="sidebar-wallet">
      <GoldConnectButton />
      <p>{account.isConnected ? shortAddress(account.address) : "Not connected"}</p>
      {account.isConnected && account.chainId !== targetChain.id && (
        <button className="outline" type="button" onClick={() => switchChainAsync({ chainId: targetChain.id })}>
          Switch to {targetChain.name}
        </button>
      )}
      {account.isConnected && (
        <button className="outline" type="button" onClick={() => disconnect()}>
          Disconnect
        </button>
      )}
    </div>
  );
}

export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <main className="console-shell">
      <aside className="sidebar">
        <Link className="sidebar-brand" href="/">
          <img src="/hoj-shield.svg" alt="" />
          <span>
            <strong>House of Joshi</strong>
            <small>HOJ NFT Console</small>
          </span>
        </Link>
        <nav className="sidebar-nav" aria-label="House of Joshi navigation">
          {nav.map((item) => (
            <Link className={pathname === item.href ? "active" : ""} href={item.href} key={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
        <SidebarWallet />
      </aside>

      <section className="content">
        <div className="top-connect">
          <GoldConnectButton compact />
        </div>
        {children}
      </section>
    </main>
  );
}

export function PageIntro({ eyebrow, title, children }: { eyebrow: string; title: string; children: React.ReactNode }) {
  return (
    <section className="page-intro">
      <p className="eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      <p>{children}</p>
    </section>
  );
}

export function InfoCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <article className="info-card">
      <h2>{title}</h2>
      <p>{children}</p>
    </article>
  );
}

export function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <article className="info-card stat-card">
      <p>{label}</p>
      <strong>{value}</strong>
    </article>
  );
}
