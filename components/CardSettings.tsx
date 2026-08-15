"use client";
import { useEffect, useState } from "react";
import type { Card } from "@/lib/types";
import { PageHeader } from "./PageHeader";
export function CardSettings() {
  const [cards, setCards] = useState<Card[]>([]); const [name, setName] = useState(""); const [lastFour, setLastFour] = useState(""); const [error, setError] = useState("");
  function load() { fetch("/api/cards").then((r) => r.json()).then(setCards); }
  useEffect(load, []);
  async function add(event: React.FormEvent) { event.preventDefault(); setError(""); const response = await fetch("/api/cards", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ name, lastFour }) }); if (!response.ok) return setError((await response.json()).error); setName(""); setLastFour(""); load(); }
  async function remove(id: string) { if (!confirm("Remove this card? Existing receipts will keep their other details.")) return; await fetch(`/api/cards?id=${id}`, { method: "DELETE" }); load(); }
  return <div className="settings-layout"><section><PageHeader eyebrow="Simple setup" title="Your cards" description="Add each card once. Receipt Book will match the last four digits automatically." /><div className="card-list">{cards.map((card) => <div className="saved-card" key={card.id}><div className="credit-card-icon">••••</div><div><strong>{card.name}</strong><span>Ending in {card.lastFour}</span></div><button aria-label={`Remove ${card.name}`} onClick={() => remove(card.id)}>Remove</button></div>)}{!cards.length && <div className="empty-state"><h3>No cards added</h3><p>Add the cards you use for receipts.</p></div>}</div></section><aside className="form-card sticky-form"><h2>Add a card</h2><p className="muted">Only the card name and last four digits are stored.</p><form onSubmit={add}><label>Card name<input value={name} onChange={(e) => setName(e.target.value)} placeholder="Example: Chase Sapphire" required /></label><label>Last four digits<input value={lastFour} onChange={(e) => setLastFour(e.target.value.replace(/\D/g, "").slice(0, 4))} inputMode="numeric" placeholder="4821" minLength={4} required /></label>{error && <div className="notice error">{error}</div>}<button className="button primary">Add Card</button></form><hr /><form action="/api/auth/logout" method="post"><button className="text-button">Sign out</button></form></aside></div>;
}
