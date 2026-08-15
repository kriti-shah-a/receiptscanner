"use client";
import Link from "next/link";
import type { Receipt } from "@/lib/types";
import { formatDate, formatMoney } from "@/lib/utils/format";
export function TransactionList({ receipts, compact = false }: { receipts: Receipt[]; compact?: boolean }) {
  if (!receipts.length) return <div className="empty-state"><div className="empty-icon">▧</div><h3>No receipts yet</h3><p>Your saved receipts will appear here.</p></div>;
  return <div className="transaction-list">{receipts.map((receipt) => <Link className="transaction-row" href={`/transactions/${receipt.id}`} key={receipt.id}><div className="merchant-avatar">{receipt.merchant.charAt(0).toUpperCase()}</div><div className="transaction-main"><strong>{receipt.merchant}</strong><span>{formatDate(receipt.transactionDate)}{receipt.cardName ? ` · ${receipt.cardName} •${receipt.cardLastFour}` : ""}</span>{!compact && <span className="category-chip">{receipt.category}</span>}</div><strong className="amount">{formatMoney(receipt.amount)}</strong><span className="chevron" aria-hidden="true">›</span></Link>)}</div>;
}
