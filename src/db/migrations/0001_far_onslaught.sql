CREATE TABLE "activity_level" (
	"id" serial PRIMARY KEY NOT NULL,
	"frequency" varchar(50) NOT NULL,
	"multiplier" numeric(5, 2) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "foods" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"serving_id" integer NOT NULL,
	"category" integer NOT NULL,
	"name" varchar(100) NOT NULL,
	"quantity" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "meal_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"food_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pregnancy_profile" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"food_preference" uuid NOT NULL,
	"activity_level_id" integer NOT NULL,
	"weeks" integer NOT NULL,
	"height" numeric(5, 2) NOT NULL,
	"weight" numeric(5, 2) NOT NULL,
	"age" integer NOT NULL,
	"meal_per_day" integer NOT NULL,
	"bmr" integer NOT NULL,
	"daily_calories" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "serving" (
	"id" serial PRIMARY KEY NOT NULL,
	"description" varchar(100) NOT NULL,
	"gram" integer NOT NULL,
	"calories" integer NOT NULL,
	"fat" integer NOT NULL,
	"protein" integer NOT NULL,
	"price" integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE "users" RENAME COLUMN "is_active" TO "complete_onboarding";--> statement-breakpoint
ALTER TABLE "foods" ADD CONSTRAINT "foods_serving_id_serving_id_fk" FOREIGN KEY ("serving_id") REFERENCES "public"."serving"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meal_log" ADD CONSTRAINT "meal_log_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meal_log" ADD CONSTRAINT "meal_log_food_id_foods_id_fk" FOREIGN KEY ("food_id") REFERENCES "public"."foods"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pregnancy_profile" ADD CONSTRAINT "pregnancy_profile_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pregnancy_profile" ADD CONSTRAINT "pregnancy_profile_food_preference_foods_id_fk" FOREIGN KEY ("food_preference") REFERENCES "public"."foods"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pregnancy_profile" ADD CONSTRAINT "pregnancy_profile_activity_level_id_activity_level_id_fk" FOREIGN KEY ("activity_level_id") REFERENCES "public"."activity_level"("id") ON DELETE no action ON UPDATE no action;