CREATE TABLE "pdf_sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"pan_form_id" text NOT NULL,
	"pdf_url" text NOT NULL,
	"watermarked" boolean DEFAULT false NOT NULL,
	"is_consumed" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "free_downloads_today" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "watermark_downloads_today" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "last_usage_date" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "pdf_sessions" ADD CONSTRAINT "pdf_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pdf_sessions" ADD CONSTRAINT "pdf_sessions_pan_form_id_pan_forms_id_fk" FOREIGN KEY ("pan_form_id") REFERENCES "public"."pan_forms"("id") ON DELETE no action ON UPDATE no action;