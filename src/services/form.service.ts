import { db } from "../db/index.js";
import { foods, pregnancy_profile, users, serving } from "../db/schema.js";
import { eq } from "drizzle-orm";
import { getUserId } from "./users.service.js";

export interface formInput {
    foodPreference: number;
    activityLevel: number;
    weeks: number;
    height: number;
    weight: number;
    age: number;
    mealPerDay: number;
}

export interface formResponse {
    name: string;
    age: number;
    trimester: number;
    aktivitas: string;
    calories: number;
    mealRecommendation: mealRecomendationResponse;
}

export interface mealRecomendationResponse {
    pokokName: string;
    pokokQty: number;
    laukName: string;
    laukQty: number;
    sayurName: string;
    sayurQty: number;
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

export const calculateTrimester = (weeks: number): number => {
    if (weeks <= 13) {
        return 1;
    } else if (weeks <= 27) {
        return 2;
    }
    return 3;
}

const activityLevelToString = (activityLevel: number): string => {
    switch (activityLevel) {
        case 1:
            return "jarang olahraga";
        case 2:
            return "cukup aktif";
        case 3:
            return "sangat aktif";
        default:
            return "Unknown";
    }
}

export async function mealRecomendation(mealCalories: number, foodPreferenceId: number): Promise<mealRecomendationResponse> {

    const caloriesPerMeal = mealCalories;

    const pokokCalories = Math.round(caloriesPerMeal * 0.5);
    const laukCalories = Math.round(caloriesPerMeal * 0.25);
    const sayurCalories = Math.round(caloriesPerMeal * 0.25);

    const findFoodForCalories = async (category: number, targetCalories: number) => {
        const availableFoods = await db
            .select({
                foodId: foods.id,
                foodName: foods.name,
                servingCalories: serving.calories,
            })
            .from(foods)
            .innerJoin(serving, eq(foods.serving_id, serving.id))
            .where(eq(foods.category, category));

        if (availableFoods.length === 0) {
            throw new Error(`No foods found for category ${category}`);
        }

        let bestMatch = availableFoods[0];
        if (!bestMatch) {
            throw new Error(`No best match found for category ${category}`);
        }
        let bestQuantity = Math.ceil(targetCalories / bestMatch.servingCalories);
        let bestTotalCalories = bestQuantity * bestMatch.servingCalories;
        let bestDifference = bestTotalCalories - targetCalories;

        for (const food of availableFoods.slice(1)) {
            const quantity = Math.ceil(targetCalories / food.servingCalories);
            const totalCalories = quantity * food.servingCalories;
            const difference = totalCalories - targetCalories;

            if (difference >= 0 && difference < bestDifference) {
                bestMatch = food;
                bestQuantity = quantity;
                bestTotalCalories = totalCalories;
                bestDifference = difference;
            }
        }

        return {
            name: bestMatch.foodName,
            quantity: bestQuantity,
        };
    };

    const getFoodById = async (foodId: number, targetCalories: number) => {
        const foodData = await db
            .select({
                foodName: foods.name,
                servingCalories: serving.calories,
            })
            .from(foods)
            .innerJoin(serving, eq(foods.serving_id, serving.id))
            .where(eq(foods.id, foodId));

        if (foodData.length === 0) {
            throw new Error(`Food with ID ${foodId} not found`);
        }

        const food = foodData[0];
        if (!food) {
            throw new Error(`Food data not found for ID ${foodId}`);
        }
        const quantity = Math.ceil(targetCalories / food.servingCalories);

        return {
            name: food.foodName,
            quantity: quantity,
        };
    };

    const pokok = await findFoodForCalories(1, pokokCalories);
    const lauk = await getFoodById(foodPreferenceId, laukCalories);
    const sayur = await findFoodForCalories(3, sayurCalories);

    return {
        pokokName: pokok.name,
        pokokQty: pokok.quantity,
        laukName: lauk.name,
        laukQty: lauk.quantity,
        sayurName: sayur.name,
        sayurQty: sayur.quantity,
    };
}
    
export class FormService {

    async submitOnboardingForm(id: string, input: formInput): Promise<formResponse> {
        const user = await getUserId(id);

        if (user.complete_onboarding) {
            throw new Error("Onboarding form already completed");
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

        if (!pregnancyProfile) {
            throw new Error("Failed to create pregnancy profile");
        }

        const mealRecommendation = await mealRecomendation(
            pregnancyProfile.meal_calories,
            input.foodPreference
        );

        const trimester = calculateTrimester(input.weeks);
        const calories = pregnancyProfile.daily_calories;

        return {
            name: user.full_name,
            age: pregnancyProfile.age,
            trimester: trimester,
            aktivitas: activityLevelToString(input.activityLevel),
            calories: calories,
            mealRecommendation: mealRecommendation
        };
    }

    async changeOnboardingStatus(id: string): Promise<void> {
        await db
        .update(users)
        .set({ complete_onboarding: true })
        .where(eq(users.id, id));
    }

}

export const formService = new FormService();
