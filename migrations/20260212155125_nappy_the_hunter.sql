CREATE TABLE "education" (
	"id" serial PRIMARY KEY NOT NULL,
	"degree" varchar(128) NOT NULL,
	"institution" varchar(128) NOT NULL,
	"institution_logo" varchar(512),
	"location" varchar(128),
	"start_date" varchar(32) NOT NULL,
	"end_date" varchar(32),
	"grade" varchar(64),
	"description" text,
	"achievements" text[],
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "experiences" (
	"id" serial PRIMARY KEY NOT NULL,
	"position" varchar(128) NOT NULL,
	"company" varchar(128) NOT NULL,
	"company_logo" varchar(512),
	"location" varchar(128),
	"start_date" varchar(32) NOT NULL,
	"end_date" varchar(32),
	"description" text NOT NULL,
	"technologies" varchar(64)[] NOT NULL,
	"achievements" text[] NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "experience_position_company_idx" ON "experiences" USING btree ("position","company");