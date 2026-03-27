import { eq, and, gte, lte, sql } from "drizzle-orm";
import { db } from "../db/index.js";
import { foods, meal_log, pregnancy_profile, serving } from "../db/schema.js";
import { usersService } from "./users.service.js";
import { calculateTrimester, mealRecomendation } from "./form.service.js";
import { supabase } from "../lib/supabase.js";

interface dashboardData {
    avatarUrl?: string;
    trimester: number;
    weeks: number;
}

interface MealCategoryItem {
    name: string;
    quantity: number;
    gram: number;
    price: number;
    picture: string;
}

interface mealRecommendation {
    pokok: MealCategoryItem;
    lauk: MealCategoryItem;
    sayur: MealCategoryItem;
    totalPrice: number;
}

interface dailyProgressResponse {
    caloriesConsumed: number;
    caloriesRemaining: number;
    progressPercentage: number;
    mealsLogged: number;
}

interface weeklyProgressDay {
    day: string;
    date: string;
    calories: number;
    foods: string[];
}

interface weeklyProgressResponse {
    week: weeklyProgressDay[];
    totalCalories: number;
    dailyCalorieGoal: number;
}

const dayNames = [
    "Minggu",
    "Senin",
    "Selasa",
    "Rabu",
    "Kamis",
    "Jum'at",
    "Sabtu",
];

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
};


const getFoodDetailsByName = async (foodName: string) => {
    const [foodData] = await db
        .select({
            foodId: foods.id,
            servingGram: serving.gram,
            servingPrice: serving.price,
            foodPicture: foods.picture_url,
        })
        .from(foods)
        .innerJoin(serving, eq(foods.serving_id, serving.id))
        .where(eq(foods.name, foodName))
        .limit(1);

    if (!foodData) {
        throw new Error(`Food details not found for ${foodName}`);
    }

    const { data } = await supabase.storage
        .from("food")
        .createSignedUrl(foodData.foodPicture, 60 * 60);

    return { ...foodData, foodPicture: data!.signedUrl };
};

const calculateDayRange = (dateString: string) => {
    const date = new Date(dateString);
    date.setHours(0, 0, 0, 0);
    
    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);

    return { date, nextDay };
};

interface MealCategoryCalculation {
    totalGram: number;
    totalPrice: number;
}

const calculateMealCategory = (quantity: number, servingGram: number, servingPrice: number): MealCategoryCalculation => {
    return {
        totalGram: quantity * servingGram,
        totalPrice: quantity * servingPrice,
    };
};

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

        const pokokDetails = await getFoodDetailsByName(mealRecommendationData.pokokName);
        const laukDetails = await getFoodDetailsByName(mealRecommendationData.laukName);
        const sayurDetails = await getFoodDetailsByName(mealRecommendationData.sayurName);

        const pokokCalc = calculateMealCategory(mealRecommendationData.pokokQty, pokokDetails.servingGram, pokokDetails.servingPrice);
        const laukCalc = calculateMealCategory(mealRecommendationData.laukQty, laukDetails.servingGram, laukDetails.servingPrice);
        const sayurCalc = calculateMealCategory(mealRecommendationData.sayurQty, sayurDetails.servingGram, sayurDetails.servingPrice);

        const totalPrice = pokokCalc.totalPrice + laukCalc.totalPrice + sayurCalc.totalPrice;

        return {
            pokok: {
                name: mealRecommendationData.pokokName,
                quantity: mealRecommendationData.pokokQty,
                gram: pokokCalc.totalGram,
                price: pokokCalc.totalPrice,
                picture: pokokDetails.foodPicture,
            },
            lauk: {
                name: mealRecommendationData.laukName,
                quantity: mealRecommendationData.laukQty,
                gram: laukCalc.totalGram,
                price: laukCalc.totalPrice,
                picture: laukDetails.foodPicture,
            },
            sayur: {
                name: mealRecommendationData.sayurName,
                quantity: mealRecommendationData.sayurQty,
                gram: sayurCalc.totalGram,
                price: sayurCalc.totalPrice,
                picture: sayurDetails.foodPicture,
            },
            totalPrice: totalPrice,
        };
    }


    async dailyProgress(userId: string): Promise<dailyProgressResponse> {
        const profileData = await getPregnancyProfile(userId);

        const today = new Date();
        const { date: dayStart, nextDay: dayEnd } = calculateDayRange(today.toISOString().split('T')[0]!);

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
                    gte(meal_log.created_at, dayStart),
                    lte(meal_log.created_at, dayEnd)
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
                foodName: foods.name,
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

        const caloriesByDay: { [key: number]: number } = {
            0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0,
        };
        
        const foodsByDay: { [key: number]: Set<string> } = {
            0: new Set(), 1: new Set(), 2: new Set(), 3: new Set(),
            4: new Set(), 5: new Set(), 6: new Set(),
        };

        for (const log of weekMealLogs) {
            const dayNum = new Date(log.createdAt).getDay();
            caloriesByDay[dayNum]! += log.calories * log.quantity;
            foodsByDay[dayNum]!.add(log.foodName);
        }

        const weekProgress: weeklyProgressDay[] = [];
        for (let i = 1; i < 8; i++) {
            const dayOfWeekNum = i === 7 ? 0 : i;
            const dayName = dayNames[dayOfWeekNum];
            const dayDate = new Date(startOfWeek);
            dayDate.setDate(startOfWeek.getDate() + (i - 1));
            const dateString = dayDate.toISOString().split('T')[0];
            
            weekProgress.push({
                day: dayName!,
                date: dateString!,
                calories: caloriesByDay[dayOfWeekNum]!,
                foods: Array.from(foodsByDay[dayOfWeekNum]!),
            });
        }

        const totalCalories = Object.values(caloriesByDay).reduce((sum, calories) => sum + calories, 0);

        return {
            week: weekProgress,
            totalCalories: totalCalories,
            dailyCalorieGoal: profileData.daily_calories,
        };
    }


}

export const dashboardService = new DashboardService();