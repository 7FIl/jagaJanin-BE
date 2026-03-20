import { FastifyRequest, FastifyReply } from "fastify";
import { dashboardService } from "../services/dashboard.service.js";

export class DashboardController {
    async getDashboardData(
        request: FastifyRequest,
        reply: FastifyReply,
        ){
        try {
            const userId = request.user.id;
            const dashboardData = await dashboardService.getDashboardData(userId);
            return reply.code(200).send(dashboardData);
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
            const userId = request.user.id;
            const mealRecommendations = await dashboardService.getMealRecommendations(userId);
            return reply.code(200).send(mealRecommendations);
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
            const userId = request.user.id;
            const dailyProgress = await dashboardService.dailyProgress(userId);
            return reply.code(200).send(dailyProgress);
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
            const userId = request.user.id;
            const weeklyProgress = await dashboardService.weeklyProgress(userId);
            return reply.code(200).send(weeklyProgress);
        } catch (error) {
            if (error instanceof Error) {
                return reply.code(400).send({ error: error.message });
            }
            return reply.code(500).send({ error: "Internal server error" });
        }
    }

}
