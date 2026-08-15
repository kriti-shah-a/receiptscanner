import { eq } from "drizzle-orm";
import { receipts } from "@/db/schema";
import { getDb } from "@/lib/db";
import { getReceiptImage } from "@/lib/r2";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [row] = await getDb().select({ imageKey: receipts.imageKey }).from(receipts).where(eq(receipts.id, id)).limit(1);
  if (!row) return new Response("Not found", { status: 404 });
  const object = await getReceiptImage(row.imageKey);
  if (!object.Body) return new Response("Not found", { status: 404 });
  const bytes = await object.Body.transformToByteArray();
  return new Response(bytes as BodyInit, { headers: { "content-type": object.ContentType ?? "image/jpeg", "cache-control": "private, max-age=3600" } });
}
