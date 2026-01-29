DO $$ BEGIN
 CREATE TYPE "public"."term_type" AS ENUM('term1', 'term2', 'summer', 'other');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "academic_terms" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"type" "term_type" NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "conduct_logs" ADD COLUMN "term_id" text;
EXCEPTION
 WHEN duplicate_column THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "conduct_logs" ADD CONSTRAINT "conduct_logs_term_id_academic_terms_id_fk" FOREIGN KEY ("term_id") REFERENCES "public"."academic_terms"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
