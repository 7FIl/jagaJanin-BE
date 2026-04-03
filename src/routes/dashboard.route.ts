import { FastifyInstance } from "fastify";
import { dashboardController } from "../controllers/dashboard.controller.js";
import { getMealLogsSchema, createMealLogSchema, updateMealLogSchema, deleteMealLogsByDateSchema, getDashboardDataSchema, getMealRecommendationsSchema, getDailyProgressTrackingSchema, getWeeklyProgressTrackingSchema } from "../schema/dashboard.schema.js";

export async function dashboardRoutes(fastify: FastifyInstance) {
    fastify.get("/data", { schema: getDashboardDataSchema, onRequest: [fastify.authenticate] }, dashboardController.getDashboardData);
    fastify.get("/meal-recommendations", { schema: getMealRecommendationsSchema, onRequest: [fastify.authenticate] }, dashboardController.getMealRecommendations);
    fastify.get("/daily-progress", { schema: getDailyProgressTrackingSchema, onRequest: [fastify.authenticate] }, dashboardController.getDailyProgressTracking);
    fastify.get("/weekly-progress", { schema: getWeeklyProgressTrackingSchema, onRequest: [fastify.authenticate] }, dashboardController.getWeeklyProgressTracking);
    fastify.get("/meal-logs", { schema: getMealLogsSchema, onRequest: [fastify.authenticate] }, dashboardController.getMealLogsByDate);
    fastify.post("/meal-logs", { schema: createMealLogSchema, onRequest: [fastify.authenticate] }, dashboardController.createMealLog);
    fastify.put("/meal-logs/:mealLogId", { schema: updateMealLogSchema, onRequest: [fastify.authenticate] }, dashboardController.editMealLog);
    fastify.delete("/meal-logs", { schema: deleteMealLogsByDateSchema, onRequest: [fastify.authenticate] }, dashboardController.deleteMealLogsByDate);
}
