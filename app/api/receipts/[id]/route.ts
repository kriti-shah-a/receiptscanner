import { eq } from "drizzle-orm";
import { cards, categories, merchantRules, receipts, type Category } from "@/db/schema";
import { getDb } from "@/lib/db";
import { deleteReceiptImage } from "@/lib/r2";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [row] = await getDb().select({ id: receipts.id, merchant: receipts.merchant, amount: receipts.amount, transactionDate: receipts.transactionDate, cardId: receipts.cardId, cardName: cards.name, cardLastFour: cards.lastFour, category: receipts.category, rawOcrText: receipts.rawOcrText, createdAt: receipts.createdAt }).from(receipts).leftJoin(cards, eq(receipts.cardId, cards.id)).where(eq(receipts.id, id)).limit(1);
  if (!row) return Response.json({ error: "Receipt not found." }, { status: 404 });
  return Response.json({ ...row, transactionDate: row.transactionDate.toISOString(), createdAt: row.createdAt.toISOString(), hasImage: true });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json() as { merchant?: string; amount?: string; transactionDate?: string; cardId?: string | null; category?: Category };
  const merchant = body.merchant?.trim();
  if (!merchant || !body.amount || !/^\d+(\.\d{1,2})?$/.test(body.amount) || !body.transactionDate || !body.category || !categories.includes(body.category)) return Response.json({ error: "Check the receipt details." }, { status: 400 });
  const db = getDb();
  const [saved] = await db.update(receipts).set({ merchant, amount: Number(body.amount).toFixed(2), transactionDate: new Date(`${body.transactionDate.slice(0, 10)}T12:00:00.000Z`), cardId: body.cardId || null, category: body.category, updatedAt: new Date() }).where(eq(receipts.id, id)).returning({ id: receipts.id });
  if (!saved) return Response.json({ error: "Receipt not found." }, { status: 404 });
  await db.insert(merchantRules).values({ merchant, category: body.category }).onConflictDoUpdate({ target: merchantRules.merchant, set: { category: body.category } });
  return Response.json(saved);
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getDb();
  const [row] = await db.select({ imageKey: receipts.imageKey }).from(receipts).where(eq(receipts.id, id)).limit(1);
  if (!row) return Response.json({ error: "Receipt not found." }, { status: 404 });
  await deleteReceiptImage(row.imageKey);
  await db.delete(receipts).where(eq(receipts.id, id));
  return new Response(null, { status: 204 });
}
