import { anonymousRole } from "drizzle-orm/neon";
import { boolean, decimal, integer, pgTable, serial, text, time, timestamp, uuid, varchar, } from "drizzle-orm/pg-core";
import { create } from "node:domain";
import { start } from "node:repl";

export const users = pgTable("users", {
    id: uuid("id").primaryKey().defaultRandom(),
    full_name: varchar("full_name", { length: 100 }).notNull(),
    email: varchar("email", { length: 100 }).notNull().unique(),
    password: varchar("password", { length: 100 }).notNull(),
    phone_number: varchar("phone_number", { length: 20 }).notNull(),
    role: varchar("role", { length: 50 }).notNull().default("user"),
    avatar_url: text("avatar_url").notNull().default("avatar/default.png"),
    complete_onboarding: boolean("complete_onboarding").notNull().default(false),
    is_verified: boolean("is_verified").notNull().default(false),
    created_at: timestamp("created_at").notNull().defaultNow(),
    updated_at: timestamp("updated_at").notNull().defaultNow(),
});

export const serving = pgTable("serving", {
    id: serial("id").primaryKey().notNull(),
    description: varchar("description", { length: 100 }).notNull(),
    gram: integer("gram").notNull(),
    calories: integer("calories").notNull(),
    fat: decimal("fat", { precision: 5, scale: 2 }).notNull(),
    protein: decimal("protein", { precision: 5, scale: 2 }).notNull(),
    price: integer("price").notNull(),
});

export const foods = pgTable("foods", {
    id: serial("id").primaryKey().notNull(),
    serving_id: integer("serving_id").notNull().references(() => serving.id),
    category: integer("category").notNull(),
    name: varchar("name", { length: 100 }).notNull(),
    picture_url: text("picture_url").notNull().default("food/default.png"),
});

export const meal_log = pgTable("meal_log", {
    id: uuid("id").primaryKey().defaultRandom(),
    user_id: uuid("user_id").notNull().references(() => users.id),
    food_id: integer("food_id").notNull().references(() => foods.id),
    quantity: integer("quantity").notNull(),
    created_at: timestamp("created_at").notNull().defaultNow(),
    updated_at: timestamp("updated_at").notNull().defaultNow(),
});

export const pregnancy_profile = pgTable("pregnancy_profile", {
    id: uuid("id").primaryKey().defaultRandom(),
    user_id: uuid("user_id").notNull().references(() => users.id),
    food_preference: integer("food_preference").notNull().references(() => foods.id),
    activity_level: integer("activity_level").notNull(),
    initial_weeks: integer("initial_weeks").notNull(),
    height: decimal("height", { precision: 5, scale: 2 }).notNull(),
    weight: decimal("weight", { precision: 5, scale: 2 }).notNull(),    
    age: integer("age").notNull(),
    meal_per_day: integer("meal_per_day").notNull(),
    bmr: integer("bmr").notNull(),
    daily_calories: integer("daily_calories").notNull(),
    meal_calories: integer("meal_calories").notNull(),
    created_at: timestamp("created_at").notNull().defaultNow(),
});

export const refresh_tokens = pgTable("refresh_tokens", {
    id: uuid("id").primaryKey().defaultRandom(),
    user_id: uuid("user_id").notNull().references(() => users.id),
    token: varchar("token", { length: 255 }).notNull(),
    expires_at: timestamp("expires_at").notNull(),
    created_at: timestamp("created_at").notNull().defaultNow(),
});

export const otp = pgTable("otp", {
    id: uuid("id").primaryKey().defaultRandom(),
    email: varchar("email", { length: 100 }).notNull(),
    code: varchar("code", { length: 100 }).notNull(),
    expires_at: timestamp("expires_at").notNull(),
    created_at: timestamp("created_at").notNull().defaultNow(),
});

export const kia = pgTable("kia", {
    id: uuid("id").primaryKey().defaultRandom(),
    user_id: uuid("user_id").notNull().references(() => users.id),
    trimester: integer("trimester").notNull(),
    hpl: timestamp("hpl").notNull(),
    hpht: timestamp("hpht").notNull(),
});

export const checkup = pgTable("checkup", {
    id: uuid("id").primaryKey().defaultRandom(),
    kia_id: uuid("kia_id").notNull().references(() => kia.id),
    facility_name: varchar("facility_name", { length: 100 }).notNull().default("-"),
    doctor_name: varchar("doctor_name", { length: 100 }).notNull().default("-"),
    blood_pressure: varchar("blood_pressure", { length: 10 }).notNull().default("-"),
    weight: decimal("weight", { precision: 5, scale: 2 }).notNull().default('0.00'),
    height: decimal("height", { precision: 5, scale: 2 }).notNull().default('0.00'),
    fundal_height: decimal("fundal_height", { precision: 5, scale: 2 }).notNull().default('0.00'),
    lila: integer("lila").notNull().default(0),
    blood_type: varchar("blood_type", { length: 3 }).notNull().default("-"),
    hemoglobin: decimal("hemoglobin", { precision: 5, scale: 2 }).notNull().default('0.00'),
    blood_sugar: integer("blood_sugar").notNull().default(0),
    urine_protein: varchar("urine_protein", { length: 10 }).notNull().default("-"),
    checkup_date: timestamp("checkup_date").notNull(),
});

export const checklist = pgTable("checklist", {
    id: uuid("id").primaryKey().defaultRandom(),
    kia_id: uuid("kia_id").notNull().references(() => kia.id),
    fetal_heatbeat: boolean("fetal_heartbeat").notNull().default(false),
    counseling: boolean("counseling").notNull().default(false),
    tetanus_immunization: boolean("tetanus_immunization").notNull().default(false),
    health_screening: boolean("health_screening").notNull().default(false),
    iron_suplement: boolean("iron_supplementation").notNull().default(false),
    ppia: boolean("ppia").notNull().default(false),
    is_completed: boolean("is_completed").notNull().default(false),
});

export const payment = pgTable("payment", {
    id: uuid("id").primaryKey().defaultRandom(),
    user_id: uuid("user_id").notNull().references(() => users.id),
    amount: integer("amount").notNull(),
    status: varchar("status", { length: 20 }).notNull().default("pending"),
    external_id: text("external_id").notNull(),
    created_at: timestamp("created_at").notNull().defaultNow(),
});

export const doctor_profile = pgTable("doctor_profile", {
    id: uuid("id").primaryKey().defaultRandom(),
    user_id: uuid("user_id").notNull().references(() => users.id),
    specialization: varchar("specialization", { length: 100 }).notNull(),
    work_place: varchar("work_place", { length: 50 }).notNull(),
    experience_years: integer("experience_years").notNull(),
    rating: decimal("rating", { precision: 3, scale: 2 }).notNull().default('0.00'),
    cumulative_patients: integer("cumulative_patients").notNull().default(0),
    about: varchar("about", { length: 255 } ).notNull().default(""),
    consultation_fee: integer("consultation_fee").notNull().default(0),
});

export const ratings = pgTable("ratings", {
    id: uuid("id").primaryKey().defaultRandom(),
    doctor_id: uuid("doctor_id").notNull().references(() => doctor_profile.id),
    user_id: uuid("user_id").notNull().references(() => users.id),
    rating: integer("rating").notNull(),
    created_at: timestamp("created_at").notNull().defaultNow(),
});

export const consultation = pgTable("consultation", {
    id: uuid("id").primaryKey().defaultRandom(),
    doctor_id: uuid("doctor_id").notNull().references(() => doctor_profile.id),
    user_id: uuid("user_id").notNull().references(() => users.id),
    start_time: timestamp("start_time").notNull(),
    end_time: timestamp("end_time").notNull(),
    is_done: boolean("is_done").notNull().default(false),
    is_done_rating: boolean("is_done").notNull().default(false),
    is_paid: boolean("is_paid").notNull().default(false),
    created_at: timestamp("created_at").notNull().defaultNow(),
});

export const practice_schedule = pgTable("practice_schedule", {
    id: uuid("id").primaryKey().defaultRandom(),
    doctor_id: uuid("doctor_id").notNull().references(() => doctor_profile.id),
    day_start: integer("day_start").notNull(),
    day_end: integer("day_end").notNull(),
    start_time: time("start_time").notNull(),
    end_time: time("end_time").notNull(),
    session: varchar("session", { length: 20 }).notNull(),
});


