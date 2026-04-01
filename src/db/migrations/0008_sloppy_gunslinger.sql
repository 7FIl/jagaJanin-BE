CREATE TABLE "checklist" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"kia_id" uuid NOT NULL,
	"fetal_heartbeat" boolean DEFAULT false NOT NULL,
	"counseling" boolean DEFAULT false NOT NULL,
	"tetanus_immunization" boolean DEFAULT false NOT NULL,
	"health_screening" boolean DEFAULT false NOT NULL,
	"iron_supplementation" boolean DEFAULT false NOT NULL,
	"ppia" boolean DEFAULT false NOT NULL,
	"is_completed" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "checkup" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"kia_id" uuid NOT NULL,
	"facility_name" varchar(100) DEFAULT '-' NOT NULL,
	"doctor_name" varchar(100) DEFAULT '-' NOT NULL,
	"blood_pressure" varchar(10) DEFAULT '-' NOT NULL,
	"weight" numeric(5, 2) DEFAULT '0.00' NOT NULL,
	"height" numeric(5, 2) DEFAULT '0.00' NOT NULL,
	"fundal_height" numeric(5, 2) DEFAULT '0.00' NOT NULL,
	"lila" integer DEFAULT 0 NOT NULL,
	"blood_type" varchar(3) DEFAULT '-' NOT NULL,
	"hemoglobin" numeric(5, 2) DEFAULT '0.00' NOT NULL,
	"blood_sugar" integer DEFAULT 0 NOT NULL,
	"urine_protein" varchar(10) DEFAULT '-' NOT NULL,
	"checkup_date" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "kia" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"trimester" integer NOT NULL,
	"hpl" timestamp NOT NULL,
	"hpht" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "pregnancy_profile" RENAME COLUMN "weeks" TO "initial_weeks";--> statement-breakpoint
ALTER TABLE "pregnancy_profile" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "checklist" ADD CONSTRAINT "checklist_kia_id_kia_id_fk" FOREIGN KEY ("kia_id") REFERENCES "public"."kia"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "checkup" ADD CONSTRAINT "checkup_kia_id_kia_id_fk" FOREIGN KEY ("kia_id") REFERENCES "public"."kia"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kia" ADD CONSTRAINT "kia_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;