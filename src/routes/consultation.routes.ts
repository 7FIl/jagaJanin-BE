import { FastifyInstance } from "fastify";
import { consultationController } from "../controllers/consultation.controller.js";
import { getDoctorRecommendationsSchema, getDoctorProfileSchema, getConsultationHistorySchema, getConsultationDataSchema, bookConsultationSchema, giveRatingSchema, getPaymentConfirmationSchema, callDoctorSchema } from "../schema/consultation.schema.js";

export async function consultationRoutes(fastify: FastifyInstance) {
    fastify.get<{ Querystring: { page?: string; limit?: string } }>
    ("/doctors/recommendations",{ schema: getDoctorRecommendationsSchema,onRequest: [fastify.authenticate] }, consultationController.getDoctorRecommendations);
    fastify.get<{ Params: { doctorId: string } }>
    ("/doctors/:doctorId",{ schema: getDoctorProfileSchema,onRequest: [fastify.authenticate] }, consultationController.getDoctorProfile);
    fastify.get<{ Querystring: { page?: string; limit?: string } }>
    ("/history",{ schema: getConsultationHistorySchema,onRequest: [fastify.authenticate]},consultationController.getConsultationHistory);
    fastify.get<{ Querystring: { page?: string; limit?: string } }>
    ("/data",{ schema: getConsultationDataSchema,onRequest: [fastify.authenticate]},consultationController.getConsultationData);
    fastify.post<{ Body: { doctorId: string; startTime: string; endTime: string } }>
    ("/book",{ schema: bookConsultationSchema,onRequest: [fastify.authenticate]},consultationController.bookConsultation);
    fastify.post<{ Body: { consultationId: string; ratingValue: number } }>
    ("/rating",{ schema: giveRatingSchema,onRequest: [fastify.authenticate]},consultationController.giveRating);
    fastify.get("/call/doctor",{ schema: callDoctorSchema, onRequest: [fastify.authenticate] },consultationController.callDoctor);
    fastify.get<{ Params: { consultationId: string } }>
    ("/payment-confirmation/:consultationId",{ schema: getPaymentConfirmationSchema,onRequest: [fastify.authenticate] },consultationController.getPaymentConfirmation);
}

