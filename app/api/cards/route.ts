import { asc, eq } from "drizzle-orm";
import { cards } from "@/db/schema";
import { getDb } from "@/lib/db";

export async function GET() {
  return Response.json(await getDb().select({ id: cards.id, name: cards.name, lastFour: cards.lastFour }).from(cards).orderBy(asc(cards.name)));
}
export async function POST(request: Request) {
  const body = await request.json() as { name?: string; lastFour?: string };
  const name = body.name?.trim();
  const lastFour = body.lastFour?.replace(/\D/g, "");
  if (!name || !lastFour || lastFour.length !== 4) return Response.json({ error: "Enter a card name and four digits." }, { status: 400 });
  const [card] = await getDb().insert(cards).values({ name, lastFour }).onConflictDoUpdate({ target: cards.lastFour, set: { name } }).returning({ id: cards.id, name: cards.name, lastFour: cards.lastFour });
  return Response.json(card, { status: 201 });
}
export async function DELETE(request: Request) {
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return Response.json({ error: "Card is required." }, { status: 400 });
  await getDb().delete(cards).where(eq(cards.id, id));
  return new Response(null, { status: 204 });
}
