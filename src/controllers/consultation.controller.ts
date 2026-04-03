import { FastifyRequest, FastifyReply } from "fastify";
import { consultationService } from "../services/consultation.service.js";

interface BookConsultationInput {
    doctorId: string;
    startTime: string;
    endTime: string;
}

interface GiveRatingInput {
    consultationId: string;
    ratingValue: number;
}



export class ConsultationController {
    async getDoctorRecommendations(
        request: FastifyRequest<{ Querystring: { page?: string; limit?: string } }>,
        reply: FastifyReply,
    ) {
        try {
            const page = request.query.page ? parseInt(request.query.page) : 1;
            const limit = request.query.limit ? parseInt(request.query.limit) : 5;
            
            const recommendations = await consultationService.getDoctorRecommendations({
                page,
                limit,
            });
            return reply.status(200).send({
                success: true,
                data: recommendations,
                message: "Doctor recommendations retrieved successfully",
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

    async getDoctorProfile(
        request: FastifyRequest<{ Params: { doctorId: string } }>,
        reply: FastifyReply,
    ) {
        try {
            const { doctorId } = request.params;
            const profile = await consultationService.getDoctorProfile(doctorId);
            return reply.status(200).send({
                success: true,
                data: profile,
                message: "Doctor profile retrieved successfully",
            });
        } catch (error) {
            const errorMessage =
                error instanceof Error ? error.message : "An error occurred";
            return reply.status(404).send({
                success: false,
                message: errorMessage,
            });
        }
    }

    async getConsultationHistory(
        request: FastifyRequest<{ Querystring: { page?: string; limit?: string } }>,
        reply: FastifyReply,
    ) {
        try {
            const userId = request.user.sub;
            const page = request.query.page ? parseInt(request.query.page) : 1;
            const limit = request.query.limit ? parseInt(request.query.limit) : 5;
            
            const history = await consultationService.getConsultationHistory(userId, {
                page,
                limit,
            });
            return reply.status(200).send({
                success: true,
                data: history,
                message: "Consultation history retrieved successfully",
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

    async getConsultationData(
        request: FastifyRequest,
        reply: FastifyReply,
    ) {
        try {
            const userId = request.user.sub;
            const data = await consultationService.getConsultationData(userId);
            return reply.status(200).send({
                success: true,
                data: data,
                message: "Consultation data retrieved successfully",
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

    async bookConsultation(
        request: FastifyRequest<{ Body: BookConsultationInput }>,
        reply: FastifyReply,
    ) {
        try {
            const userId = request.user.sub;
            const { doctorId, startTime, endTime } = request.body;

            const consultationId = await consultationService.bookConsultation(
                userId,
                doctorId,
                new Date(startTime),
                new Date(endTime)
            );

            return reply.status(201).send({
                success: true,
                data: { consultationId },
                message: "Consultation booked successfully",
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

    async giveRating(
        request: FastifyRequest<{ Body: GiveRatingInput }>,
        reply: FastifyReply,
    ) {
        try {
            const userId = request.user.sub;
            const { consultationId, ratingValue } = request.body;

            const result = await consultationService.giveRating(
                consultationId,
                userId,
                ratingValue
            );

            return reply.status(200).send({
                success: true,
                message: "Rating submitted successfully",
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

    async callDoctor(
        request: FastifyRequest,
        reply: FastifyReply,
    ) {
        try {
            const userId = request.user.sub;
            const link = await consultationService.callDoctor(userId);
            return reply.status(200).send({
                success: true,
                data: { link },
                message: "Doctor call link retrieved successfully",
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

    async getPaymentConfirmation(
        request: FastifyRequest<{ Params: { consultationId: string } }>,
        reply: FastifyReply,
    ) {
        try {
            const userId = request.user.sub;
            const { consultationId } = request.params;
            const confirmation = await consultationService.getPaymentConfirmation(userId, consultationId);
            return reply.status(200).send({
                success: true,
                data: confirmation,
                message: "Payment confirmation retrieved successfully",
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

export const consultationController = new ConsultationController();
