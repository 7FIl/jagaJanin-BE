import { eq, and, gte, lte, sql } from "drizzle-orm";
import { db } from "../db/index.js";
import { foods, meal_log, pregnancy_profile, serving } from "../db/schema.js";
import { usersService } from "./users.service.js";
import { calculateTrimester, mealRecomendationResponse, mealRecomendation } from "./form.service.js";

interface dashboardData {
    avatarUrl?: string;
    trimester: number;
    weeks: number;
}

interface mealRecommendation {
    price: number;
    pokokGram: number;
    laukGram: number;
    sayurGram: number;
    pokokPrice: number;
    laukPrice: number;
    sayurPrice: number;
    mealrecommendation: mealRecomendationResponse;
}

interface dailyProgressResponse {
    caloriesConsumed: number;
    caloriesRemaining: number;
    progressPercentage: number;
    mealsLogged: number;
}

interface weeklyProgressDay {
    day: string;
    calories: number;
}

interface weeklyProgressResponse {
    week: weeklyProgressDay[];
    totalCalories: number;
}

const getPregnancyProfile = async (userId: string) => {
    const [profileData] = await db
        .select()
        .from(pregnancy_profile)
        .where(eq(pregnancy_profile.user_id, userId))
        .limit(1);
    
    if (!profileData) {
        throw new Error("Pregnancy profile not found");
    }
    return profileData;
}

export class DashboardService {

    async getDashboardData(userId: string): Promise<dashboardData> {

        const avatar = await usersService.avatarUrl(userId);

        const profileData = await getPregnancyProfile(userId);

        const trimester = calculateTrimester(profileData.weeks);
        const weeks = profileData.weeks;
        
        return {
            avatarUrl: avatar,
            trimester: trimester,
            weeks: weeks
        };
    }

    async getMealRecommendations(userId: string): Promise<mealRecommendation> {
        const profileData = await getPregnancyProfile(userId);

        const mealRecommendationData = await mealRecomendation(
            profileData.meal_calories,
            profileData.food_preference
        );

        const getFoodDetails = async (foodName: string, quantity: number) => {
            const [foodData] = await db
                .select({
                    foodId: foods.id,
                    servingGram: serving.gram,
                    servingPrice: serving.price,
                })
                .from(foods)
                .innerJoin(serving, eq(foods.serving_id, serving.id))
                .where(eq(foods.name, foodName))
                .limit(1);

            if (!foodData) {
                throw new Error(`Food details not found for ${foodName}`);
            }

            const totalGram = quantity * foodData.servingGram;
            const totalPrice = quantity * foodData.servingPrice;

            return { totalGram, totalPrice };
        };

        const pokokDetails = await getFoodDetails(mealRecommendationData.pokokName, mealRecommendationData.pokokQty);
        const laukDetails = await getFoodDetails(mealRecommendationData.laukName, mealRecommendationData.laukQty);
        const sayurDetails = await getFoodDetails(mealRecommendationData.sayurName, mealRecommendationData.sayurQty);

        const totalPrice = pokokDetails.totalPrice + laukDetails.totalPrice + sayurDetails.totalPrice;

        return {
            price: totalPrice,
            pokokGram: pokokDetails.totalGram,
            laukGram: laukDetails.totalGram,
            sayurGram: sayurDetails.totalGram,
            pokokPrice: pokokDetails.totalPrice,
            laukPrice: laukDetails.totalPrice,
            sayurPrice: sayurDetails.totalPrice,
            mealrecommendation: mealRecommendationData,
        };
    }

    async dailyProgress(userId: string): Promise<dailyProgressResponse> {
        const profileData = await getPregnancyProfile(userId);

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const todayMealLogs = await db
            .select({
                mealLogId: meal_log.id,
                calories: serving.calories,
                quantity: meal_log.quantity,
            })
            .from(meal_log)
            .innerJoin(foods, eq(meal_log.food_id, foods.id))
            .innerJoin(serving, eq(foods.serving_id, serving.id))
            .where(
                and(
                    eq(meal_log.user_id, userId),
                    gte(meal_log.created_at, today),
                    lte(meal_log.created_at, tomorrow)
                )
            );

        const caloriesConsumed = todayMealLogs.reduce(
            (total, log) => total + (log.calories * log.quantity),
            0
        );

        const dailyCalories = profileData.daily_calories;
        const caloriesRemaining = Math.max(0, dailyCalories - caloriesConsumed);
        
        const progressPercentage = Math.min(
            100,
            Math.round((caloriesConsumed / dailyCalories) * 100)
        );

        return {
            caloriesConsumed: caloriesConsumed,
            caloriesRemaining: caloriesRemaining,
            progressPercentage: progressPercentage,
            mealsLogged: todayMealLogs.length,
        };
    }

    async weeklyProgress(userId: string): Promise<weeklyProgressResponse> {
        const profileData = await getPregnancyProfile(userId);

        const today = new Date();
        const dayOfWeek = today.getDay();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
        startOfWeek.setHours(0, 0, 0, 0);

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 7);

        const weekMealLogs = await db
            .select({
                dayOfWeek: sql`EXTRACT(DOW FROM ${meal_log.created_at})`,
                calories: serving.calories,
                quantity: meal_log.quantity,
                createdAt: meal_log.created_at,
            })
            .from(meal_log)
            .innerJoin(foods, eq(meal_log.food_id, foods.id))
            .innerJoin(serving, eq(foods.serving_id, serving.id))
            .where(
                and(
                    eq(meal_log.user_id, userId),
                    gte(meal_log.created_at, startOfWeek),
                    lte(meal_log.created_at, endOfWeek)
                )
            );

        const dayNames = [
            "Sunday",
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
        ];
        const caloriesByDay: { [key: number]: number } = {
            0: 0,
            1: 0,
            2: 0,
            3: 0,
            4: 0,
            5: 0,
            6: 0,
        };

        // Calculate calories for each day
        for (const log of weekMealLogs) {
            const dayNum = new Date(log.createdAt).getDay();
            caloriesByDay[dayNum]! += log.calories * log.quantity;
        }

        const weekProgress: weeklyProgressDay[] = [];
        for (let i = 1; i < 8; i++) {
            const dayOfWeekNum = i === 7 ? 0 : i;
            const dayName = dayNames[dayOfWeekNum];
            weekProgress.push({
                day: dayName!,
                calories: caloriesByDay[dayOfWeekNum]!,
            });
        }

        // Calculate total calories for the week
        const totalCalories = Object.values(caloriesByDay).reduce((sum, calories) => sum + calories, 0);

        return {
            week: weekProgress,
            totalCalories: totalCalories,
        };
    }
}

export const dashboardService = new DashboardService();