import type { Metadata } from "next";
import "./globals.css";
import { AppShell } from "@/components/AppShell";
const siteUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000";
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "Receipt Book", template: "%s | Receipt Book" },
  description: "A simple, private home for receipts and spending.",
  icons: { icon: "/favicon.svg" },
  openGraph: { title: "Receipt Book", description: "Receipts made simple.", images: [{ url: "/og.png", width: 1536, height: 1024, alt: "Receipt Book — Receipts made simple." }] },
  twitter: { card: "summary_large_image", title: "Receipt Book", description: "Receipts made simple.", images: ["/og.png"] },
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body suppressHydrationWarning><AppShell>{children}</AppShell></body></html>; }
