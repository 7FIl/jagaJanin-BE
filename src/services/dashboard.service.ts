import { eq, and, gte, lte, sql } from "drizzle-orm";
import { db } from "../db/index.js";
import { foods, meal_log, pregnancy_profile, serving } from "../db/schema.js";
import { profileService } from "./profile.service.js";
import { calculateTrimester, mealRecomendation } from "./form.service.js";
import { getPregnancyWeeks } from "./pregnancy.service.js";
import { supabase } from "../lib/supabase.js";
import { getDayName } from "./consultation.service.js";
import { AppError } from "../lib/errorHandler.js";

interface dashboardData {
    avatarUrl?: string;
    trimester: number;
    weeks: number;
    dailyProgress: dailyProgressResponse;
    weeklyProgress: weeklyProgressResponse;
    dailyRecommendation: mealRecommendation;
}

interface MealCategoryItem {
    name: string;
    quantity: number;
    gram: number;
    price: number;
    picture: string;
}

interface mealRecommendation {
    staple: MealCategoryItem;
    side: MealCategoryItem;
    vegetable: MealCategoryItem;
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

const getPregnancyProfile = async (userId: string) => {
    const [profileData] = await db
        .select()
        .from(pregnancy_profile)
        .where(eq(pregnancy_profile.user_id, userId))
        .limit(1);
    
    if (!profileData) {
        throw new AppError("Pregnancy profile not found", 404);
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
        throw new AppError(`Food details not found for ${foodName}`, 404);
    }

    const { data } = await supabase.storage.from("avatars").getPublicUrl(foodData.foodPicture);
    return { ...foodData, foodPicture: data.publicUrl };
};

const calculateDayRange = (dateString: string) => {
    const [day, month, year] = dateString.split('-');
    const date = new Date(`${year}-${month}-${day}`);
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

        const avatar = await profileService.avatarUrl(userId);
        const weeks = await getPregnancyWeeks(userId);
        const trimester = calculateTrimester(weeks);
        const dailyProgressData = await this.dailyProgress(userId);
        const weeklyProgressData = await this.weeklyProgress(userId);
        const dailyRecommendationData = await this.getMealRecommendations(userId);
        
        return {
            avatarUrl: avatar,
            trimester: trimester,
            weeks: weeks,
            dailyProgress: dailyProgressData,
            weeklyProgress: weeklyProgressData,
            dailyRecommendation: dailyRecommendationData,
        };
    }

    async getMealRecommendations(userId: string): Promise<mealRecommendation> {
        const profileData = await getPregnancyProfile(userId);

        const mealRecommendationData = await mealRecomendation(
            profileData.meal_calories,
            profileData.food_preference
        );

        const stapleDetails = await getFoodDetailsByName(mealRecommendationData.stapleName);
        const sideDetails = await getFoodDetailsByName(mealRecommendationData.sideName);
        const vegetableDetails = await getFoodDetailsByName(mealRecommendationData.vegetableName);

        const stapleCalc = calculateMealCategory(mealRecommendationData.stapleQty, stapleDetails.servingGram, stapleDetails.servingPrice);
        const sideCalc = calculateMealCategory(mealRecommendationData.sideQty, sideDetails.servingGram, sideDetails.servingPrice);
        const vegetableCalc = calculateMealCategory(mealRecommendationData.vegetableQty, vegetableDetails.servingGram, vegetableDetails.servingPrice);

        const totalPrice = stapleCalc.totalPrice + sideCalc.totalPrice + vegetableCalc.totalPrice;

        return {
            staple: {
                name: mealRecommendationData.stapleName,
                quantity: mealRecommendationData.stapleQty,
                gram: stapleCalc.totalGram,
                price: stapleCalc.totalPrice,
                picture: stapleDetails.foodPicture,
            },
            side: {
                name: mealRecommendationData.sideName,
                quantity: mealRecommendationData.sideQty,
                gram: sideCalc.totalGram,
                price: sideCalc.totalPrice,
                picture: sideDetails.foodPicture,
            },
            vegetable: {
                name: mealRecommendationData.vegetableName,
                quantity: mealRecommendationData.vegetableQty,
                gram: vegetableCalc.totalGram,
                price: vegetableCalc.totalPrice,
                picture: vegetableDetails.foodPicture,
            },
            totalPrice: totalPrice,
        };
    }


    async dailyProgress(userId: string): Promise<dailyProgressResponse> {
        const profileData = await getPregnancyProfile(userId);
        const weeks = await getPregnancyWeeks(userId);

        const today = new Date();
        const day = String(today.getDate()).padStart(2, '0');
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const year = today.getFullYear();
        const todayDateString = `${day}-${month}-${year}`;
        const { date: dayStart, nextDay: dayEnd } = calculateDayRange(todayDateString);

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
        const weeks = await getPregnancyWeeks(userId);

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
            const consultationDayNum = dayOfWeekNum === 0 ? 7 : dayOfWeekNum;
            const dayName = getDayName(consultationDayNum);
            const dayDate = new Date(startOfWeek);
            dayDate.setDate(startOfWeek.getDate() + (i - 1));
            const day = String(dayDate.getDate()).padStart(2, '0');
            const month = String(dayDate.getMonth() + 1).padStart(2, '0');
            const year = dayDate.getFullYear();
            const dateString = `${day}-${month}-${year}`;
            
            weekProgress.push({
                day: dayName,
                date: dateString,
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

    async getMealLogsByDate(userId: string, dateString: string) {
        const { date: dayStart, nextDay: dayEnd } = calculateDayRange(dateString);

        const mealLogs = await db
            .select({
                mealLogId: meal_log.id,
                foodId: foods.id,
                foodName: foods.name,
                quantity: meal_log.quantity,
                calories: serving.calories,
                gram: serving.gram,
                protein: serving.protein,
                fat: serving.fat,
                pictureUrl: foods.picture_url,
                createdAt: meal_log.created_at,
                updatedAt: meal_log.updated_at,
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

        const totalCalories = mealLogs.reduce(
            (total, log) => total + (log.calories * log.quantity),
            0
        );

        return {
            date: dateString,
            meals: mealLogs,
            totalCalories: totalCalories,
            mealCount: mealLogs.length,
        };
    }

    async createMealLog(userId: string, foodId: number, quantity: number, dateString: string) {
        const [foodData] = await db
            .select()
            .from(foods)
            .where(eq(foods.id, foodId))
            .limit(1);

        if (!foodData) {
            throw new AppError("Food not found", 404);
        }

        const [newMeal] = await db
            .insert(meal_log)
            .values({
                user_id: userId,
                food_id: foodId,
                quantity,
                created_at: new Date(dateString),
            })
            .returning({ id: meal_log.id });

        return {
            success: true,
            message: "Meal log created successfully",
            mealLogId: newMeal!.id,
        };
    }

    async editMealLog(userId: string, mealLogId: string, foodId?: number, quantity?: number) {
        const [existingMeal] = await db
            .select()
            .from(meal_log)
            .where(
                and(
                    eq(meal_log.id, mealLogId),
                    eq(meal_log.user_id, userId)
                )
            )
            .limit(1);

        if (!existingMeal) {
            throw new AppError("Meal log not found", 404);
        }

        if (foodId) {
            const [foodData] = await db
                .select()
                .from(foods)
                .where(eq(foods.id, foodId))
                .limit(1);

            if (!foodData) {
                throw new AppError("Food not found", 404);
            }
        }

        const updateData: { food_id?: number; quantity?: number; updated_at: Date } = {
            updated_at: new Date()
        };
        
        if (foodId) updateData.food_id = foodId;
        if (quantity) updateData.quantity = quantity;

        await db
            .update(meal_log)
            .set(updateData)
            .where(eq(meal_log.id, mealLogId));

        const updatedFields = [];
        if (foodId) updatedFields.push("food");
        if (quantity) updatedFields.push("quantity");

        return {
            success: true,
            message: `Meal log updated successfully (${updatedFields.join(", ")})`,
            mealLogId: mealLogId,
        };
    }

    async deleteMealLogsByDate(userId: string, dateString: string) {
        const { date: dayStart, nextDay: dayEnd } = calculateDayRange(dateString);

        const result = await db
            .delete(meal_log)
            .where(
                and(
                    eq(meal_log.user_id, userId),
                    gte(meal_log.created_at, dayStart),
                    lte(meal_log.created_at, dayEnd)
                )
            );

        return {
            success: true,
            message: "All meal logs for this date have been deleted",
            deletedCount: result.rowCount,
        };
    }


}

export const dashboardService = new DashboardService();