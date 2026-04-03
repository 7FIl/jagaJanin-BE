import { FastifyRequest, FastifyReply } from "fastify";
import { dashboardService } from "../services/dashboard.service.js";
import { error } from "node:console";

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
            const errorMessage =
                error instanceof Error ? error.message : "An error occurred";
            return reply.status(400).send({
                success: false,
                message: errorMessage,
            });
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
                const errorMessage =
                    error instanceof Error ? error.message : "An error occurred";
                return reply.status(400).send({
                    success: false,
                    message: errorMessage,
                });
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
            const errorMessage =
                error instanceof Error ? error.message : "An error occurred";
            return reply.status(400).send({
                success: false,
                message: errorMessage,
            });
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
            const errorMessage =
                error instanceof Error ? error.message : "An error occurred";
            return reply.status(400).send({
                success: false,
                message: errorMessage,
            });
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
            const errorMessage =
                error instanceof Error ? error.message : "An error occurred";
            return reply.status(400).send({
                success: false,
                message: errorMessage,
            });
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
            const errorMessage =
                error instanceof Error ? error.message : "An error occurred";
            return reply.status(400).send({
                success: false,
                message: errorMessage,
            });
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
                return reply.code(400).send({ success: false, message: "At least one of foodId or quantity must be provided" });
            }
            
            const result = await dashboardService.editMealLog(userId, mealLogId, foodId, quantity);
            return reply.code(200).send({
                success: result.success,
                data: result,
                message: result.message
            });
        } catch (error) {
            const errorMessage =
                error instanceof Error ? error.message : "An error occurred";
            return reply.status(400).send({
                success: false,
                message: errorMessage,
            });
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
            const errorMessage =
                error instanceof Error ? error.message : "An error occurred";
            return reply.status(400).send({
                success: false,
                message: errorMessage,
            });
        }
    }

    

}

export const dashboardController = new DashboardController();
