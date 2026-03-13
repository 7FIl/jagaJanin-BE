import { db } from "../db/index.js";
import { activity_level, pregnancy_profile, users } from "../db/schema.js";
import { eq } from "drizzle-orm";

export interface formInput {
    foodPreference: string;
    activityLevelId: number;
    weeks: number;
    height: number;
    weight: number;
    age: number;
    mealPerDay: number;
}

const getPregnancyCalorieAdjustment = (weeks: number): number => {
    if (weeks > 27) {
        return 500;
    }

    if (weeks > 13) {
        return 350;
    }

    return 200;
};

const calculateBmr = (weight: number, height: number, age: number): number => {
    return Math.round(655 + (9.6 * weight) + (1.8 * height) - (4.7 * age));
};

export class FormService {

    async submitOnboardingForm(id: string, input: formInput): Promise<boolean> {
        const [activityLevel] = await db
        .select({ multiplier: activity_level.multiplier })
        .from(activity_level)
        .where(eq(activity_level.id, input.activityLevelId));

        if (!activityLevel) {
            throw new Error("Invalid activity level");
        }

        const bmr = calculateBmr(input.weight, input.height, input.age);
        const activityMultiplier = Number(activityLevel.multiplier);
        const dailyCalories = Math.round((bmr * activityMultiplier) + getPregnancyCalorieAdjustment(input.weeks));

        const [pregnancyProfile] = await db 
        .insert(pregnancy_profile)
        .values({
            user_id: id,
            food_preference: input.foodPreference,
            activity_level_id: input.activityLevelId,
            weeks: input.weeks,
            height: input.height.toString(),
            weight: input.weight.toString(),
            age: input.age,
            meal_per_day: input.mealPerDay,
            bmr,
            daily_calories: dailyCalories,
            meal_calories: Math.round(dailyCalories / input.mealPerDay),
        })
        .returning();

        return true;
    }

    async changeOnboardingStatus(id: string): Promise<void> {
        await db
        .update(users)
        .set({ complete_onboarding: true })
        .where(eq(users.id, id));
    }
}

export const formService = new FormService();
