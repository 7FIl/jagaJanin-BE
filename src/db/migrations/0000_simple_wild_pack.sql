CREATE TABLE "foods" (
	"id" serial PRIMARY KEY NOT NULL,
	"serving_id" integer NOT NULL,
	"category" integer NOT NULL,
	"name" varchar(100) NOT NULL,
	"quantity" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "meal_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"food_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pregnancy_profile" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"food_preference" integer NOT NULL,
	"activity_level" integer NOT NULL,
	"weeks" integer NOT NULL,
	"height" numeric(5, 2) NOT NULL,
	"weight" numeric(5, 2) NOT NULL,
	"age" integer NOT NULL,
	"meal_per_day" integer NOT NULL,
	"bmr" integer NOT NULL,
	"daily_calories" integer NOT NULL,
	"meal_calories" integer NOT NULL
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
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"full_name" varchar(100) NOT NULL,
	"email" varchar(100) NOT NULL,
	"password" varchar(255) NOT NULL,
	"role" varchar(50) DEFAULT 'user' NOT NULL,
	"complete_onboarding" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "foods" ADD CONSTRAINT "foods_serving_id_serving_id_fk" FOREIGN KEY ("serving_id") REFERENCES "public"."serving"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meal_log" ADD CONSTRAINT "meal_log_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meal_log" ADD CONSTRAINT "meal_log_food_id_foods_id_fk" FOREIGN KEY ("food_id") REFERENCES "public"."foods"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pregnancy_profile" ADD CONSTRAINT "pregnancy_profile_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pregnancy_profile" ADD CONSTRAINT "pregnancy_profile_food_preference_foods_id_fk" FOREIGN KEY ("food_preference") REFERENCES "public"."foods"("id") ON DELETE no action ON UPDATE no action;