import { boolean, pgTable, timestamp, uuid, varchar, } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
    id: uuid("id").primaryKey().defaultRandom(),
    full_name: varchar("full_name", { length: 100 }).notNull(),
    email: varchar("email", { length: 100 }).notNull().unique(),
    password: varchar("password", { length: 255 }).notNull(),
    is_active: boolean("is_active").notNull().default(true),
    created_at: timestamp("created_at").notNull().defaultNow(),
    updated_at: timestamp("updated_at").notNull().defaultNow(),
});