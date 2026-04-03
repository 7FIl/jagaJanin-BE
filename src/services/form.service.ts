import { db } from "../db/index.js";
import { foods, pregnancy_profile, users, serving } from "../db/schema.js";
import { eq } from "drizzle-orm";
import { getUserId } from "./profile.service.js";
import { AppError } from "../lib/errorHandler.js";

export interface formInput {
    foodPreference: number;
    activityLevel: number;
    weeks: number;
    height: number;
    weight: number;
    age: number;
    mealPerDay: number;
}

export interface mealRecomendationResponse {
    stapleName: string;
    stapleQty: number;
    sideName: string;
    sideQty: number;
    vegetableName: string;
    vegetableQty: number;
}

interface onboardingResponse {
    name: string;
    age: number;
    trimester: number;
    activityLevel: string;
    calories: number;
    mealRecommendation: mealRecomendationResponse;
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
            throw new AppError("Invalid activity level", 400);
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

    const stapleCalories = Math.round(caloriesPerMeal * 0.5);
    const sideCalories = Math.round(caloriesPerMeal * 0.25);
    const vegetableCalories = Math.round(caloriesPerMeal * 0.25);

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
            throw new AppError(`No foods found for category ${category}`, 400);
        }

        let bestMatch = availableFoods[0];
        if (!bestMatch) {
            throw new AppError(`No best match found for category ${category}`, 400);
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
            throw new AppError(`Food with ID ${foodId} not found`, 404);
        }

        const food = foodData[0];
        if (!food) {
            throw new AppError(`Food data not found for ID ${foodId}`, 404);
        }
        const quantity = Math.ceil(targetCalories / food.servingCalories);

        return {
            name: food.foodName,
            quantity: quantity,
        };
    };

    const staple = await findFoodForCalories(1, stapleCalories);
    const side = await getFoodById(foodPreferenceId, sideCalories);
    const vegetable = await findFoodForCalories(3, vegetableCalories);

    return {
        stapleName: staple.name,
        stapleQty: staple.quantity,
        sideName: side.name,
        sideQty: side.quantity,
        vegetableName: vegetable.name,
        vegetableQty: vegetable.quantity,
    };
}
    
export class FormService {

    async submitOnboardingForm(id: string, input: formInput): Promise<onboardingResponse> {
        const user = await getUserId(id);

        if (user.complete_onboarding) {
            throw new AppError("Onboarding form already completed", 409);
        }

        const bmr = calculateBmr(input.weight, input.height, input.age);
        const dailyCalories = Math.round((bmr * activityMultiplier(input.activityLevel)) + getPregnancyCalorieAdjustment(input.weeks));

        const [pregnancyProfile] = await db 
        .insert(pregnancy_profile)
        .values({
            user_id: id,
            food_preference: input.foodPreference,
            activity_level: input.activityLevel,
            initial_weeks: input.weeks,
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
            throw new AppError("Failed to create pregnancy profile", 500);
        }

        const mealRecommendation = await mealRecomendation(
            pregnancyProfile.meal_calories,
            input.foodPreference
        );

        const calories = pregnancyProfile.daily_calories;

        return {
            name: user.full_name,
            age: pregnancyProfile.age,
            trimester: calculateTrimester(pregnancyProfile.initial_weeks),
            activityLevel: activityLevelToString(input.activityLevel),
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
