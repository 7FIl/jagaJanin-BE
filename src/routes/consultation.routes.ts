import { FastifyInstance } from "fastify";
import { consultationController } from "../controllers/consultation.controller.js";
import {
    getDoctorProfileSchema,
    bookConsultationSchema,
    giveRatingSchema,
    getPaymentConfirmationSchema,
} from "../schema/consultation.schema.js";

export async function consultationRoutes(fastify: FastifyInstance) {
    fastify.get( "/doctors/recommendations",{ onRequest: [fastify.authenticate] }, (request, reply) => consultationController.getDoctorRecommendations(request, reply));
    fastify.get<{ Params: { doctorUserId: string } }>( "/doctors/:doctorUserId", { schema: getDoctorProfileSchema, onRequest: [fastify.authenticate] }, (request, reply) => consultationController.getDoctorProfile(request, reply) );
    fastify.get("/history",{ onRequest: [fastify.authenticate],},(request, reply) => consultationController.getConsultationHistory(request, reply));
    fastify.get("/data",{ onRequest: [fastify.authenticate],},(request, reply) => consultationController.getConsultationData(request, reply));
    fastify.post<{ Body: { doctorId: string; startTime: string; endTime: string } }>("/book",{ onRequest: [fastify.authenticate], schema: bookConsultationSchema },(request, reply) => consultationController.bookConsultation(request, reply) );
    fastify.post<{ Body: { consultationId: string; ratingValue: number } }>("/rating",{ onRequest: [fastify.authenticate], schema: giveRatingSchema },(request, reply) => consultationController.giveRating(request, reply));
    fastify.get("/call/doctor",{ onRequest: [fastify.authenticate] },(request, reply) => consultationController.callDoctor(request, reply));
    fastify.get<{ Params: { consultationId: string } }>("/payment-confirmation/:consultationId",{ schema: getPaymentConfirmationSchema, onRequest: [fastify.authenticate] },(request, reply) => consultationController.getPaymentConfirmation(request, reply));
}

