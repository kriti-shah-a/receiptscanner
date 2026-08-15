/* eslint-disable @next/next/no-img-element */
"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { categories, type Category } from "@/db/schema";
import type { Card, Receipt } from "@/lib/types";
import { formatDate, formatMoney } from "@/lib/utils/format";
import { PageHeader } from "./PageHeader";

export function ReceiptDetail({ id }: { id: string }) {
  const router = useRouter();
  const [receipt, setReceipt] = useState<Receipt>();
  const [cards, setCards] = useState<Card[]>([]);
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([fetch(`/api/receipts/${id}`).then((r) => r.json()), fetch("/api/cards").then((r) => r.json())])
      .then(([saved, savedCards]) => { setReceipt(saved); setCards(savedCards); })
      .catch(() => setError("This receipt couldn't be loaded."));
  }, [id]);

  if (!receipt) return <div className="loading-card">{error || "Loading receipt…"}</div>;

  async function update(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError("");
    const data = Object.fromEntries(new FormData(event.currentTarget));
    const response = await fetch(`/api/receipts/${id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify(data) });
    if (response.ok) {
      setReceipt((current) => current ? ({ ...current, merchant: String(data.merchant), amount: String(data.amount), transactionDate: `${data.transactionDate}T12:00:00.000Z`, cardId: String(data.cardId) || null, cardName: cards.find((c) => c.id === data.cardId)?.name ?? null, cardLastFour: cards.find((c) => c.id === data.cardId)?.lastFour ?? null, category: data.category as Category }) : current);
      setEditing(false);
    } else setError((await response.json()).error);
    setBusy(false);
  }

  async function remove() {
    if (!confirm("Delete this receipt and its photo? This cannot be undone.")) return;
    setBusy(true); const response = await fetch(`/api/receipts/${id}`, { method: "DELETE" });
    if (response.ok) router.push("/transactions"); else { setError("The receipt couldn't be deleted."); setBusy(false); }
  }

  return <div>
    <PageHeader eyebrow={<Link href="/transactions">‹ All receipts</Link>} title={receipt.merchant} description={formatDate(receipt.transactionDate)} action={!editing && <button className="button secondary" onClick={() => setEditing(true)}>Edit details</button>} />
    {error && <div className="notice error">{error}</div>}
    <div className="detail-grid">
      <section className="receipt-image-card"><img src={`/api/receipts/${id}/image`} alt={`Receipt from ${receipt.merchant}`} /></section>
      {editing ? <form className="form-card" onSubmit={update}>
        <h2>Edit receipt</h2>
        <label>Merchant<input name="merchant" defaultValue={receipt.merchant} required /></label>
        <div className="form-row"><label>Amount<span className="money-input"><b>$</b><input name="amount" defaultValue={receipt.amount} inputMode="decimal" required /></span></label><label>Purchase date<input name="transactionDate" type="date" defaultValue={receipt.transactionDate.slice(0, 10)} required /></label></div>
        <label>Card<select name="cardId" defaultValue={receipt.cardId ?? ""}><option value="">No card</option>{cards.map((card) => <option key={card.id} value={card.id}>{card.name} •{card.lastFour}</option>)}</select></label>
        <label>Category<select name="category" defaultValue={receipt.category}>{categories.map((item) => <option key={item}>{item}</option>)}</select></label>
        <div className="button-row"><button className="button primary" disabled={busy}>Save changes</button><button type="button" className="button secondary" onClick={() => setEditing(false)}>Cancel</button></div>
      </form> : <section className="detail-card">
        <div className="detail-amount"><span>Total</span><strong>{formatMoney(receipt.amount)}</strong></div>
        <dl><div><dt>Merchant</dt><dd>{receipt.merchant}</dd></div><div><dt>Date</dt><dd>{formatDate(receipt.transactionDate)}</dd></div><div><dt>Card</dt><dd>{receipt.cardName ? `${receipt.cardName} •${receipt.cardLastFour}` : "Not recorded"}</dd></div><div><dt>Category</dt><dd><span className="category-chip">{receipt.category}</span></dd></div></dl>
        <button className="delete-button" onClick={remove} disabled={busy}>Delete receipt</button>
      </section>}
    </div>
  </div>;
}
