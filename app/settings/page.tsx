import type { Metadata } from "next";
import { CardSettings } from "@/components/CardSettings";
export const metadata: Metadata = { title: "Cards" };
export default function SettingsPage() { return <CardSettings />; }
