import { db } from "../db/index.js";
import { pregnancy_profile, users } from "../db/schema.js";
import { eq } from "drizzle-orm";

export interface formInput {
    foodPreference: number;
    activityLevel: number;
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

// Activity level multipliers
// 1: Lightly active (light exercise/sports 1-3 days/week)
// 2: Moderately active (moderate exercise/sports 3-5 days/week)
// 3: Very active (hard exercise/sports 6-7 days a week)

const activityMultiplier = (activityLevel: number): number => {
    switch (activityLevel) {
        case 1:
            return 1.375;
        case 2:
            return 1.55;
        case 3:
            return 1.725;
        default:
            throw new Error("Invalid activity level");
    }
}

export class FormService {

    async submitOnboardingForm(id: string, input: formInput): Promise<boolean> {
        
        async function checkUserOnboardingStatus(userId: string): Promise<boolean> {
            const [user] = await db
            .select({ completeOnboarding: users.complete_onboarding })
            .from(users)
            .where(eq(users.id, userId));
            return user ? user.completeOnboarding : false;
        }

        const alreadyCompleted = await checkUserOnboardingStatus(id);
        if (alreadyCompleted) {
            throw new Error("Onboarding form already completed");
        }
        
        const [activityLevel] = await db
        .select({ activity_level: pregnancy_profile.activity_level })
        .from(pregnancy_profile)
        .where(eq(pregnancy_profile.user_id, id));

        if (!activityLevel) {
            throw new Error("Invalid activity level");
        }

        const bmr = calculateBmr(input.weight, input.height, input.age);
        const dailyCalories = Math.round((bmr * activityMultiplier(input.activityLevel)) + getPregnancyCalorieAdjustment(input.weeks));

        const [pregnancyProfile] = await db 
        .insert(pregnancy_profile)
        .values({
            user_id: id,
            food_preference: input.foodPreference,
            activity_level: input.activityLevel,
            weeks: input.weeks,
            height: input.height.toString(),
            weight: input.weight.toString(),
            age: input.age,
            meal_per_day: input.mealPerDay,
            bmr: bmr,
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
