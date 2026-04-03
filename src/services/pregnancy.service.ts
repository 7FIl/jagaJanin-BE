import { eq } from "drizzle-orm/sql/expressions/conditions";
import { db } from "../db/index.js";
import { kia, pregnancy_profile } from "../db/schema.js";
import { AppError } from "../lib/errorHandler.js";

function calculateWeeks(hpht: Date): number {
    const currentDate = new Date();
    const timeDiff = currentDate.getTime() - hpht.getTime();
    const weeks = Math.floor(timeDiff / (1000 * 3600 * 24 * 7));
    return weeks;
}

function calculateWeeksFromCreatedAt(initialWeeks: number, createdAt: Date): number {
    const currentDate = new Date();
    const timeDiff = currentDate.getTime() - createdAt.getTime();
    const weeksElapsed = Math.floor(timeDiff / (1000 * 3600 * 24 * 7));
    const currentWeeks = initialWeeks + weeksElapsed;
    return currentWeeks;
}

export async function getPregnancyWeeks(userId: string): Promise<number> {
    
    const [pregnancy] = await db
        .select()
        .from(pregnancy_profile)
        .where(eq(pregnancy_profile.user_id, userId))
        .limit(1);

    if (!pregnancy) {
        throw new AppError("Pregnancy profile not found", 404);
    }

    const [kiaData] = await db
        .select()
        .from(kia)
        .where(eq(kia.user_id, userId))
        .limit(1);

    let currentWeeks: number;

    if (!kiaData?.hpht) {
        currentWeeks = calculateWeeksFromCreatedAt(pregnancy.initial_weeks, pregnancy.created_at);
    } else {
        currentWeeks = calculateWeeks(kiaData.hpht);
    }

    return currentWeeks;
}