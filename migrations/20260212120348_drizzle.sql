DO $$ BEGIN CREATE TYPE "public"."auth_provider" AS ENUM('credentials', 'google'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
--> statement-breakpoint
DO $$ BEGIN CREATE TYPE "public"."user_role" AS ENUM('admin', 'user'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "blog_categories" (
    "id" serial PRIMARY KEY NOT NULL,
    "blog_id" integer NOT NULL,
    "category_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "blog_tags" (
    "id" serial PRIMARY KEY NOT NULL,
    "blog_id" integer NOT NULL,
    "tag_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "blogs" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(256) NOT NULL,
	"slug" varchar(300) NOT NULL,
	"content" text NOT NULL,
	"author_id" integer NOT NULL,
	"cover_image" varchar(512),
	"excerpt" text,
	"is_published" boolean DEFAULT false NOT NULL,
	"published_date" timestamp,
	"views" integer DEFAULT 0 NOT NULL,
	"reactions" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "blogs_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "categories" (
    "id" serial PRIMARY KEY NOT NULL,
    "title" varchar(128) NOT NULL,
    "slug" varchar(160) NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL,
    CONSTRAINT "categories_title_unique" UNIQUE ("title"),
    CONSTRAINT "categories_slug_unique" UNIQUE ("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "comments" (
	"id" serial PRIMARY KEY NOT NULL,
	"content" text NOT NULL,
	"author_id" integer NOT NULL,
	"blog_id" integer NOT NULL,
	"parent_comment_id" integer,
	"reactions" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tags" (
    "id" serial PRIMARY KEY NOT NULL,
    "title" varchar(64) NOT NULL,
    "slug" varchar(100) NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL,
    CONSTRAINT "tags_title_unique" UNIQUE ("title"),
    CONSTRAINT "tags_slug_unique" UNIQUE ("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "contact_messages" (
    "id" serial PRIMARY KEY NOT NULL,
    "name" varchar(128) NOT NULL,
    "email" varchar(256) NOT NULL,
    "subject" varchar(256),
    "message" text NOT NULL,
    "is_read" boolean DEFAULT false NOT NULL,
    "is_replied" boolean DEFAULT false NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "conversations" (
    "id" serial PRIMARY KEY NOT NULL,
    "participant_one" integer NOT NULL,
    "participant_two" integer NOT NULL,
    "last_message_at" timestamp DEFAULT now() NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "direct_messages" (
    "id" serial PRIMARY KEY NOT NULL,
    "conversation_id" integer NOT NULL,
    "sender_id" integer NOT NULL,
    "content" text NOT NULL,
    "is_read" boolean DEFAULT false NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "otp_codes" (
    "id" serial PRIMARY KEY NOT NULL,
    "email" varchar(256) NOT NULL,
    "code" varchar(6) NOT NULL,
    "expires_at" timestamp NOT NULL,
    "is_used" boolean DEFAULT false NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "projects" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(128) NOT NULL,
	"live_link" varchar(256) NOT NULL,
	"favicon" varchar(256) NOT NULL,
	"repo_links" varchar(256)[] NOT NULL,
	"tech_stack" varchar(64)[] NOT NULL,
	"screenshots" varchar(256)[] NOT NULL,
	"features" varchar(512)[] NOT NULL,
	"description" varchar NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
    "id" serial PRIMARY KEY NOT NULL,
    "name" varchar(128) NOT NULL,
    "email" varchar(256) NOT NULL,
    "password" text,
    "profile_image" varchar(512),
    "bio" text,
    "role" "user_role" DEFAULT 'user' NOT NULL,
    "provider" "auth_provider" DEFAULT 'credentials' NOT NULL,
    "email_verified" boolean DEFAULT false NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL,
    CONSTRAINT "users_email_unique" UNIQUE ("email")
);
--> statement-breakpoint
DO $$ BEGIN ALTER TABLE "blog_categories" ADD CONSTRAINT "blog_categories_blog_id_blogs_id_fk" FOREIGN KEY ("blog_id") REFERENCES "public"."blogs"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END 2>&1;--> statement-breakpoint
DO $$ BEGIN ALTER TABLE "blog_categories" ADD CONSTRAINT "blog_categories_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;

EXCEPTION WHEN duplicate_object THEN NULL;

END 2 > & 1;
--> statement-breakpoint
DO $$ BEGIN ALTER TABLE "blog_tags" ADD CONSTRAINT "blog_tags_blog_id_blogs_id_fk" FOREIGN KEY ("blog_id") REFERENCES "public"."blogs"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END 2>&1;--> statement-breakpoint
DO $$ BEGIN ALTER TABLE "blog_tags" ADD CONSTRAINT "blog_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;

EXCEPTION WHEN duplicate_object THEN NULL;

END 2 > & 1;
--> statement-breakpoint
DO $$ BEGIN ALTER TABLE "blogs" ADD CONSTRAINT "blogs_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END 2>&1;--> statement-breakpoint
DO $$ BEGIN ALTER TABLE "comments" ADD CONSTRAINT "comments_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;

EXCEPTION WHEN duplicate_object THEN NULL;

END 2 > & 1;
--> statement-breakpoint
DO $$ BEGIN ALTER TABLE "comments" ADD CONSTRAINT "comments_blog_id_blogs_id_fk" FOREIGN KEY ("blog_id") REFERENCES "public"."blogs"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END 2>&1;--> statement-breakpoint
DO $$ BEGIN ALTER TABLE "conversations" ADD CONSTRAINT "conversations_participant_one_users_id_fk" FOREIGN KEY ("participant_one") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;

EXCEPTION WHEN duplicate_object THEN NULL;

END 2 > & 1;
--> statement-breakpoint
DO $$ BEGIN ALTER TABLE "conversations" ADD CONSTRAINT "conversations_participant_two_users_id_fk" FOREIGN KEY ("participant_two") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END 2>&1;--> statement-breakpoint
DO $$ BEGIN ALTER TABLE "direct_messages" ADD CONSTRAINT "direct_messages_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE cascade ON UPDATE no action;

EXCEPTION WHEN duplicate_object THEN NULL;

END 2 > & 1;
--> statement-breakpoint
DO $$ BEGIN ALTER TABLE "direct_messages" ADD CONSTRAINT "direct_messages_sender_id_users_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END 2>&1;--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "title_idx" ON "projects" USING btree ("title");