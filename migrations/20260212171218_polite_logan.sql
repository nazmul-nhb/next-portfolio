CREATE TABLE "testimonials" (
	"id" serial PRIMARY KEY NOT NULL,
	"client_name" varchar(128) NOT NULL,
	"client_role" varchar(128),
	"client_company" varchar(128),
	"client_avatar" varchar(512),
	"content" text NOT NULL,
	"rating" integer DEFAULT 5 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
