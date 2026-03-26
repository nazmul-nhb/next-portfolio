ALTER TABLE "poll_votes" ADD COLUMN "option_id" integer;
--> statement-breakpoint
UPDATE "poll_votes" SET "option_id" = (
  SELECT "po"."id" FROM "poll_options" "po"
  WHERE "po"."poll_id" = "poll_votes"."poll_id"
  ORDER BY "po"."id" ASC LIMIT 1
) WHERE "option_id" IS NULL;
--> statement-breakpoint
DELETE FROM "poll_votes" WHERE "option_id" IS NULL;
--> statement-breakpoint
ALTER TABLE "poll_votes" ALTER COLUMN "option_id" SET NOT NULL;
--> statement-breakpoint
ALTER TABLE "poll_votes" ADD CONSTRAINT "poll_votes_option_id_poll_options_id_fk" FOREIGN KEY ("option_id") REFERENCES "public"."poll_options"("id") ON DELETE cascade ON UPDATE no action;