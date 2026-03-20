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

}

export const dashboardController = new DashboardController();
