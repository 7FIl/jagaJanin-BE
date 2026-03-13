import { boolean, decimal, integer, pgTable, serial, timestamp, uuid, varchar, } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
    id: uuid("id").primaryKey().defaultRandom(),
    full_name: varchar("full_name", { length: 100 }).notNull(),
    email: varchar("email", { length: 100 }).notNull().unique(),
    password: varchar("password", { length: 255 }).notNull(),
    complete_onboarding: boolean("complete_onboarding").notNull().default(false),
    created_at: timestamp("created_at").notNull().defaultNow(),
    updated_at: timestamp("updated_at").notNull().defaultNow(),
});

export const activity_level = pgTable("activity_level", {
    id: serial("id").primaryKey().notNull(),
    frequency: varchar("frequency", { length: 50 }).notNull(),
    multiplier: decimal("multiplier", { precision: 5, scale: 2 }).notNull(),
});

export const serving = pgTable("serving", {
    id: serial("id").primaryKey().notNull(),
    description: varchar("description", { length: 100 }).notNull(),
    gram: integer("gram").notNull(),
    calories: integer("calories").notNull(),
    fat: integer("fat").notNull(),
    protein: integer("protein").notNull(),
    price: integer("price").notNull(),
});

export const foods = pgTable("foods", {
    id: uuid("id").primaryKey().defaultRandom(),
    serving_id: integer("serving_id").notNull().references(() => serving.id),
    category: integer("category").notNull(),
    name: varchar("name", { length: 100 }).notNull(),
    quantity: integer("quantity").notNull(),
});

export const meal_log = pgTable("meal_log", {
    Id: uuid("id").primaryKey().defaultRandom(),
    user_id: uuid("user_id").notNull().references(() => users.id),
    food_id: uuid("food_id").notNull().references(() => foods.id),
    created_at: timestamp("created_at").notNull().defaultNow(),
    updated_at: timestamp("updated_at").notNull().defaultNow(),
});

export const pregnancy_profile = pgTable("pregnancy_profile", {
    id: uuid("id").primaryKey().defaultRandom(),
    user_id: uuid("user_id").notNull().references(() => users.id),
    food_preference: uuid("food_preference").notNull().references(() => foods.id),
    activity_level_id: integer("activity_level_id").notNull().references(() => activity_level.id),
    weeks: integer("weeks").notNull(),
    height: decimal("height", { precision: 5, scale: 2 }).notNull(),
    weight: decimal("weight", { precision: 5, scale: 2 }).notNull(),    
    age: integer("age").notNull(),
    meal_per_day: integer("meal_per_day").notNull(),
    bmr: integer("bmr").notNull(),
    daily_calories: integer("daily_calories").notNull(),
    meal_calories: integer("meal_calories").notNull(),
});
    