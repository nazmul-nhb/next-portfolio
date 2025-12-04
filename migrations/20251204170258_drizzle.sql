CREATE TABLE "projects" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(128) NOT NULL,
	"live_link" varchar(256) NOT NULL,
	"repo_links" varchar(256)[2] NOT NULL,
	"tech_stack" varchar(64) NOT NULL,
	"description" varchar NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "title_idx" ON "projects" USING btree ("title");