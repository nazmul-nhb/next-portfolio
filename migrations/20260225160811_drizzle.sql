CREATE TYPE "public"."reaction_type" AS ENUM('like', 'dislike');--> statement-breakpoint
CREATE TABLE "blog_reactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"blog_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"type" "reaction_type" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "blog_user_reaction_unique" UNIQUE("blog_id","user_id")
);
--> statement-breakpoint
ALTER TABLE "blog_reactions" ADD CONSTRAINT "blog_reactions_blog_id_blogs_id_fk" FOREIGN KEY ("blog_id") REFERENCES "public"."blogs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blog_reactions" ADD CONSTRAINT "blog_reactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blogs" DROP COLUMN "reactions";