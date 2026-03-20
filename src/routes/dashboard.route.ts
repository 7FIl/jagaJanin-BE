import { FastifyInstance } from "fastify";
import { dashboardController } from "../controllers/dashboard.controller.js";

export async function dashboardRoutes(fastify: FastifyInstance) {
    fastify.get("/data", { onRequest: [fastify.authenticate] }, dashboardController.getDashboardData);
    fastify.get("/meal-recommendations", { onRequest: [fastify.authenticate] }, dashboardController.getMealRecommendations);
    fastify.get("/daily-progress", { onRequest: [fastify.authenticate] }, dashboardController.getDailyProgressTracking);
    fastify.get("/weekly-progress", { onRequest: [fastify.authenticate] }, dashboardController.getWeeklyProgressTracking);
}
