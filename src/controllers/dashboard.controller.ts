import { FastifyRequest, FastifyReply } from "fastify";
import { dashboardService } from "../services/dashboard.service.js";

export class DashboardController {
    async getDashboardData(
        request: FastifyRequest,
        reply: FastifyReply,
        ){
        try {
            const userId = request.user.sub;
            const dashboardData = await dashboardService.getDashboardData(userId);
            return reply.code(200).send({
                success: true,
                data: dashboardData,
                message: "Dashboard data retrieved successfully"
            });
        } catch (error) {
            if (error instanceof Error) {
                return reply.code(400).send({ error: error.message });
            }
            return reply.code(500).send({ error: "Internal server error" });
        }
    }
    
    async getMealRecommendations(
        request: FastifyRequest,
        reply: FastifyReply,
        ){
        try {
            const userId = request.user.sub;
            const mealRecommendations = await dashboardService.getMealRecommendations(userId);
            return reply.code(200).send({
                success: true,
                data: mealRecommendations,
                message: "Meal recommendations retrieved successfully"
            });
        } catch (error) {
            if (error instanceof Error) {
                return reply.code(400).send({ error: error.message });
            }
            return reply.code(500).send({ error: "Internal server error" });
        }
    }

    async getDailyProgressTracking(
        request: FastifyRequest,
        reply: FastifyReply,
        ){
        try {
            const userId = request.user.sub;
            const dailyProgress = await dashboardService.dailyProgress(userId);
            return reply.code(200).send({
                success: true,
                data: dailyProgress,
                message: "Daily progress retrieved successfully"
            });
        } catch (error) {
            if (error instanceof Error) {
                return reply.code(400).send({ error: error.message });
            }
            return reply.code(500).send({ error: "Internal server error" });
        }
    }

    async getWeeklyProgressTracking(
        request: FastifyRequest,
        reply: FastifyReply,
        ){
        try {
            const userId = request.user.sub;
            const weeklyProgress = await dashboardService.weeklyProgress(userId);
            return reply.code(200).send({
                success: true,
                data: weeklyProgress,
                message: "Weekly progress retrieved successfully"
            });
        } catch (error) {
            if (error instanceof Error) {
                return reply.code(400).send({ error: error.message });
            }
            return reply.code(500).send({ error: "Internal server error" });
        }
    }

    async getMealLogsByDate(
        request: FastifyRequest,
        reply: FastifyReply,
        ){
        try {
            const userId = request.user.sub;
            const { date } = request.query as { date: string };
            const mealLogs = await dashboardService.getMealLogsByDate(userId, date);
            return reply.code(200).send({
                success: true,
                data: mealLogs,
                message: "Meal logs retrieved successfully"
            });
        } catch (error) {
            if (error instanceof Error) {
                return reply.code(400).send({ error: error.message });
            }
            return reply.code(500).send({ error: "Internal server error" });
        }
    }

    async createMealLog(
        request: FastifyRequest,
        reply: FastifyReply,
        ){
        try {
            const userId = request.user.sub;
            const { foodId, quantity, date } = request.body as { foodId: number; quantity: number; date: string };
            const result = await dashboardService.createMealLog(userId, foodId, quantity, date);
            return reply.code(201).send({
                success: result.success,
                data: result,
                message: result.message
            });
        } catch (error) {
            if (error instanceof Error) {
                return reply.code(400).send({ error: error.message });
            }
            return reply.code(500).send({ error: "Internal server error" });
        }
    }

    async editMealLog(
        request: FastifyRequest,
        reply: FastifyReply,
        ){
        try {
            const userId = request.user.sub;
            const { mealLogId } = request.params as { mealLogId: string };
            const { foodId, quantity } = request.body as { foodId?: number; quantity?: number };
            
            if (!foodId && !quantity) {
                return reply.code(400).send({ error: "At least one of foodId or quantity must be provided" });
            }
            
            const result = await dashboardService.editMealLog(userId, mealLogId, foodId, quantity);
            return reply.code(200).send({
                success: result.success,
                data: result,
                message: result.message
            });
        } catch (error) {
            if (error instanceof Error) {
                return reply.code(400).send({ error: error.message });
            }
            return reply.code(500).send({ error: "Internal server error" });
        }
    }

    async deleteMealLogsByDate(
        request: FastifyRequest,
        reply: FastifyReply,
        ){
        try {
            const userId = request.user.sub;
            const { date } = request.query as { date: string };
            const result = await dashboardService.deleteMealLogsByDate(userId, date);
            return reply.code(200).send({
                success: result.success,
                data: result,
                message: result.message
            });
        } catch (error) {
            if (error instanceof Error) {
                return reply.code(400).send({ error: error.message });
            }
            return reply.code(500).send({ error: "Internal server error" });
        }
    }

    

}

export const dashboardController = new DashboardController();
