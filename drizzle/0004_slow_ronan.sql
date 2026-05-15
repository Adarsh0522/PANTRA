ALTER TABLE "app_plans" ADD COLUMN "subtitle" text;--> statement-breakpoint
ALTER TABLE "app_plans" ADD COLUMN "tools_validity_days" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "razorpay_payment_id" text;--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "razorpay_signature" text;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "tools_active_until" timestamp;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "referred_by" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "is_referral_converted" boolean DEFAULT false NOT NULL;