"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
const nav = [{ href: "/", label: "Home", icon: "⌂" }, { href: "/transactions", label: "Receipts", icon: "▤" }, { href: "/reports", label: "Reports", icon: "▥" }, { href: "/settings", label: "Cards", icon: "⚙" }];
export function AppShell({ children }: { children: React.ReactNode }) {
  const path = usePathname(); if (path === "/login") return <>{children}</>;
  return <><header className="topbar"><Link href="/" className="brand"><span className="brand-mark">R</span><span>Receipt Book</span></Link><nav className="desktop-nav" aria-label="Main navigation">{nav.map((item) => <Link key={item.href} href={item.href} className={path === item.href ? "active" : ""}>{item.label}</Link>)}</nav></header><main className="page-shell">{children}</main><nav className="bottom-nav" aria-label="Main navigation">{nav.map((item) => <Link key={item.href} href={item.href} className={path === item.href ? "active" : ""}><span aria-hidden="true">{item.icon}</span>{item.label}</Link>)}</nav></>;
}
