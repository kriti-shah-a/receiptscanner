import type { Metadata } from "next";
import { Transactions } from "@/components/Transactions";
export const metadata: Metadata = { title: "Receipts" };
export default function TransactionsPage() { return <Transactions />; }
