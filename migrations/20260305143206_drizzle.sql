ALTER TABLE "receipts" ALTER COLUMN "expense_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "receipts" ADD COLUMN "loan_id" integer;--> statement-breakpoint
ALTER TABLE "receipts" ADD CONSTRAINT "receipts_loan_id_loans_id_fk" FOREIGN KEY ("loan_id") REFERENCES "public"."loans"("id") ON DELETE cascade ON UPDATE no action;