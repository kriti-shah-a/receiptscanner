"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { Receipt } from "@/lib/types";
import { formatMoney } from "@/lib/utils/format";
import { PageHeader } from "./PageHeader";
import { TransactionList } from "./TransactionList";
export function Dashboard() {
  const [receipts, setReceipts] = useState<Receipt[]>([]); const [loading, setLoading] = useState(true); const [error, setError] = useState("");
  useEffect(() => { fetch("/api/receipts").then(async (response) => { if (!response.ok) throw new Error(); return response.json(); }).then(setReceipts).catch(() => setError("We couldn't load your receipts. Check the app setup and try again.")).finally(() => setLoading(false)); }, []);
  const now = new Date(); const monthReceipts = receipts.filter((r) => { const d = new Date(r.transactionDate); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear(); }); const yearReceipts = receipts.filter((r) => new Date(r.transactionDate).getFullYear() === now.getFullYear()); const stats = { monthTotal: monthReceipts.reduce((sum, r) => sum + Number(r.amount), 0), monthCount: monthReceipts.length, yearTotal: yearReceipts.reduce((sum, r) => sum + Number(r.amount), 0) };
  return <div><PageHeader eyebrow="Your spending" title="Good to see you" description={now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })} action={<Link href="/add" className="button primary header-action">＋ Add Receipt</Link>} /><Link href="/add" className="mobile-add-card"><span className="camera-circle">＋</span><span><strong>Add a receipt</strong><small>Take a photo or choose one</small></span><b>›</b></Link>{error && <div className="notice error">{error}</div>}<section className="stat-grid" aria-label="Spending summary"><article className="stat-card featured"><p>This month</p><strong>{loading ? "—" : formatMoney(stats.monthTotal)}</strong><span>{stats.monthCount} {stats.monthCount === 1 ? "receipt" : "receipts"}</span></article><article className="stat-card"><p>This year</p><strong>{loading ? "—" : formatMoney(stats.yearTotal)}</strong><span>{now.getFullYear()}</span></article></section><section className="section-block"><div className="section-heading"><div><p className="eyebrow">Latest activity</p><h2>Recent receipts</h2></div><Link href="/transactions">See all</Link></div>{loading ? <div className="loading-card">Loading your receipts…</div> : <TransactionList receipts={receipts.slice(0, 5)} compact />}</section></div>;
}
