import { sql } from "drizzle-orm";
import { merchantRules } from "@/db/schema";
import { getDb } from "@/lib/db";

export async function GET(request: Request) {
  const merchant = new URL(request.url).searchParams.get("merchant")?.trim();
  if (!merchant) return Response.json({ category: null });
  const [rule] = await getDb().select({ category: merchantRules.category }).from(merchantRules).where(sql`lower(${merchantRules.merchant}) = lower(${merchant})`).limit(1);
  return Response.json({ category: rule?.category ?? null });
}
