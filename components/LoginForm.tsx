"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
export function LoginForm() {
  const router = useRouter(); const [password, setPassword] = useState(""); const [error, setError] = useState(""); const [busy, setBusy] = useState(false);
  async function submit(event: React.FormEvent) { event.preventDefault(); setBusy(true); setError(""); const response = await fetch("/api/auth/login", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ password }) }); if (response.ok) { router.push("/"); router.refresh(); } else { setError((await response.json()).error); setBusy(false); } }
  return <main className="login-page"><section className="login-card"><div className="brand login-brand"><span className="brand-mark">R</span><span>Receipt Book</span></div><div><p className="eyebrow">Private & simple</p><h1>Welcome back</h1><p className="page-description">Enter your family password to see your receipts.</p></div><form onSubmit={submit}><label>Password<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" autoFocus required /></label>{error && <div className="notice error">{error}</div>}<button className="button primary save-button" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</button></form><p className="login-footnote">Your receipts and spending stay private.</p></section></main>;
}
