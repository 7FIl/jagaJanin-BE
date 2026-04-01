import { boolean, decimal, integer, pgTable, serial, text, timestamp, uuid, varchar, } from "drizzle-orm/pg-core";

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
    weeks: integer("weeks").notNull(),
    height: decimal("height", { precision: 5, scale: 2 }).notNull(),
    weight: decimal("weight", { precision: 5, scale: 2 }).notNull(),    
    age: integer("age").notNull(),
    meal_per_day: integer("meal_per_day").notNull(),
    bmr: integer("bmr").notNull(),
    daily_calories: integer("daily_calories").notNull(),
    meal_calories: integer("meal_calories").notNull(),
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