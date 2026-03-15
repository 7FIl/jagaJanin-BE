ALTER TABLE "pregnancy_profile" ADD COLUMN "meal_calories" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "role" varchar(50) DEFAULT 'user' NOT NULL;