CREATE TABLE "cards" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"last_four" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "merchant_rules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"merchant" text NOT NULL,
	"category" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "receipts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"merchant" text NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"transaction_date" timestamp with time zone NOT NULL,
	"card_id" uuid,
	"category" text DEFAULT 'Other' NOT NULL,
	"image_key" text NOT NULL,
	"raw_ocr_text" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "receipts" ADD CONSTRAINT "receipts_card_id_cards_id_fk" FOREIGN KEY ("card_id") REFERENCES "public"."cards"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
CREATE UNIQUE INDEX "cards_last_four_idx" ON "cards" USING btree ("last_four");
--> statement-breakpoint
CREATE UNIQUE INDEX "merchant_rules_merchant_idx" ON "merchant_rules" USING btree ("merchant");
--> statement-breakpoint
CREATE INDEX "receipts_transaction_date_idx" ON "receipts" USING btree ("transaction_date");
--> statement-breakpoint
CREATE INDEX "receipts_merchant_idx" ON "receipts" USING btree ("merchant");
