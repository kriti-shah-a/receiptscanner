import type { Metadata } from "next";
import { ReceiptUpload } from "@/components/ReceiptUpload";
export const metadata: Metadata = { title: "Add Receipt" };
export default function AddReceiptPage() { return <ReceiptUpload />; }
