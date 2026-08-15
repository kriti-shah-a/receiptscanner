import { index, numeric, pgTable, text, timestamp, uuid, uniqueIndex } from "drizzle-orm/pg-core";

export const categories = [
  "Groceries", "Restaurants", "Gas", "Shopping", "Travel",
  "Home", "Medical", "Bills", "Business", "Other",
] as const;
export type Category = (typeof categories)[number];

export const cards = pgTable("cards", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  lastFour: text("last_four").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [uniqueIndex("cards_last_four_idx").on(table.lastFour)]);

export const receipts = pgTable("receipts", {
  id: uuid("id").defaultRandom().primaryKey(),
  merchant: text("merchant").notNull(),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  transactionDate: timestamp("transaction_date", { withTimezone: true, mode: "date" }).notNull(),
  cardId: uuid("card_id").references(() => cards.id, { onDelete: "set null" }),
  category: text("category").$type<Category>().notNull().default("Other"),
  imageKey: text("image_key").notNull(),
  rawOcrText: text("raw_ocr_text"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("receipts_transaction_date_idx").on(table.transactionDate),
  index("receipts_merchant_idx").on(table.merchant),
]);

export const merchantRules = pgTable("merchant_rules", {
  id: uuid("id").defaultRandom().primaryKey(),
  merchant: text("merchant").notNull(),
  category: text("category").$type<Category>().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [uniqueIndex("merchant_rules_merchant_idx").on(table.merchant)]);
