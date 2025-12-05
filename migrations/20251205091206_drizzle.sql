ALTER TABLE "projects" ALTER COLUMN "repo_links" SET DATA TYPE varchar(256)[];--> statement-breakpoint
ALTER TABLE "projects" ALTER COLUMN "tech_stack" SET DATA TYPE varchar(64)[];--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "favicon" varchar(256) NOT NULL;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "screenshots" varchar(256)[] NOT NULL;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "features" varchar(512)[] NOT NULL;