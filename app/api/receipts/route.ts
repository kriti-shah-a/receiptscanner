import { desc, eq } from "drizzle-orm";
import { cards, categories, merchantRules, receipts, type Category } from "@/db/schema";
import { getDb } from "@/lib/db";
import { deleteReceiptImage, uploadReceipt } from "@/lib/r2";

export async function GET() {
  const rows = await getDb().select({ id: receipts.id, merchant: receipts.merchant, amount: receipts.amount, transactionDate: receipts.transactionDate, cardId: receipts.cardId, cardName: cards.name, cardLastFour: cards.lastFour, category: receipts.category, createdAt: receipts.createdAt }).from(receipts).leftJoin(cards, eq(receipts.cardId, cards.id)).orderBy(desc(receipts.transactionDate));
  return Response.json(rows.map((row) => ({ ...row, transactionDate: row.transactionDate.toISOString(), createdAt: row.createdAt.toISOString(), hasImage: true })));
}

export async function POST(request: Request) {
  const form = await request.formData();
  const image = form.get("image");
  const merchant = String(form.get("merchant") ?? "").trim();
  const amount = String(form.get("amount") ?? "").trim();
  const date = String(form.get("date") ?? "");
  const cardId = String(form.get("cardId") ?? "") || null;
  const category = String(form.get("category") ?? "Other") as Category;
  const rawOcrText = String(form.get("rawOcrText") ?? "");
  if (!(image instanceof File) || !merchant || !/^\d+(\.\d{1,2})?$/.test(amount) || Number(amount) <= 0 || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !categories.includes(category)) return Response.json({ error: "Check the merchant, amount, date, and category." }, { status: 400 });
  if (image.size > 2_000_000) return Response.json({ error: "The compressed photo is still too large." }, { status: 400 });
  const imageKey = await uploadReceipt(new Uint8Array(await image.arrayBuffer()), "image/jpeg");
  try {
    const db = getDb();
    const [saved] = await db.insert(receipts).values({ merchant, amount: Number(amount).toFixed(2), transactionDate: new Date(`${date}T12:00:00.000Z`), cardId, category, imageKey, rawOcrText }).returning({ id: receipts.id });
    await db.insert(merchantRules).values({ merchant, category }).onConflictDoUpdate({ target: merchantRules.merchant, set: { category } });
    return Response.json(saved, { status: 201 });
  } catch (error) {
    await deleteReceiptImage(imageKey).catch(() => undefined);
    throw error;
  }
}
