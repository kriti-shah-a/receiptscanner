"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { Receipt } from "@/lib/types";
import { PageHeader } from "./PageHeader";
import { TransactionList } from "./TransactionList";
export function Transactions() {
  const [receipts, setReceipts] = useState<Receipt[]>([]); const [search, setSearch] = useState(""); const [month, setMonth] = useState("all"); const [year, setYear] = useState("all"); const [loading, setLoading] = useState(true);
  useEffect(() => { fetch("/api/receipts").then((r) => r.json()).then(setReceipts).finally(() => setLoading(false)); }, []);
  const years = [...new Set(receipts.map((r) => new Date(r.transactionDate).getFullYear()))].sort((a, b) => b - a);
  const filtered = receipts.filter((r) => { const date = new Date(r.transactionDate); return r.merchant.toLowerCase().includes(search.toLowerCase()) && (month === "all" || date.getMonth() === Number(month)) && (year === "all" || date.getFullYear() === Number(year)); });
  return <div><PageHeader eyebrow="Receipt history" title="All receipts" description="Search, browse, and update everything you've saved." action={<Link href="/add" className="button primary header-action">＋ Add Receipt</Link>} /><div className="filters"><label className="search-field"><span aria-hidden="true">⌕</span><input aria-label="Search by merchant" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by merchant" /></label><select aria-label="Filter by month" value={month} onChange={(e) => setMonth(e.target.value)}><option value="all">All months</option>{Array.from({ length: 12 }, (_, i) => <option key={i} value={i}>{new Date(2024, i).toLocaleString("en-US", { month: "long" })}</option>)}</select><select aria-label="Filter by year" value={year} onChange={(e) => setYear(e.target.value)}><option value="all">All years</option>{years.map((item) => <option key={item}>{item}</option>)}</select></div><div className="results-count">{loading ? "Loading…" : `${filtered.length} ${filtered.length === 1 ? "receipt" : "receipts"}`}</div>{loading ? <div className="loading-card">Loading your receipts…</div> : <TransactionList receipts={filtered} />}</div>;
}
