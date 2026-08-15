import type { Category } from "@/db/schema";
export type Card = { id: string; name: string; lastFour: string };
export type Receipt = {
  id: string; merchant: string; amount: string; transactionDate: string;
  cardId: string | null; cardName: string | null; cardLastFour: string | null;
  category: Category; hasImage: boolean; createdAt: string;
};
