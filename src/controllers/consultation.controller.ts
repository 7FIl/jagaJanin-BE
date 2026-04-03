import { FastifyRequest, FastifyReply } from "fastify";
import { consultationService } from "../services/consultation.service.js";
import { AppError } from "../lib/errorHandler.js";

interface BookConsultationInput {
    doctorId: string;
    date: string;
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
    }

    async getDoctorProfile(
        request: FastifyRequest<{ Params: { doctorId: string } }>,
        reply: FastifyReply,
    ) {
        const { doctorId } = request.params;
        const profile = await consultationService.getDoctorProfile(doctorId);
        return reply.status(200).send({
            success: true,
            data: profile,
            message: "Doctor profile retrieved successfully",
        });
    }

    async getConsultationHistory(
        request: FastifyRequest<{ Querystring: { page?: string; limit?: string } }>,
        reply: FastifyReply,
    ) {
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
    }

    async getConsultationData(
        request: FastifyRequest,
        reply: FastifyReply,
    ) {
        const userId = request.user.sub;
        const data = await consultationService.getConsultationData(userId);
        return reply.status(200).send({
            success: true,
            data: data,
            message: "Consultation data retrieved successfully",
        });
    }

    async bookConsultation(
        request: FastifyRequest<{ Body: BookConsultationInput }>,
        reply: FastifyReply,
    ) {
        const userId = request.user.sub;
        const { doctorId, date, startTime, endTime } = request.body;

        const [startHourStr, startMinuteStr] = startTime.split(".");
        const [endHourStr, endMinuteStr] = endTime.split(".");

        const startHour = parseInt(startHourStr || "0");
        const startMinute = parseInt(startMinuteStr || "0");
        const endHour = parseInt(endHourStr || "0");
        const endMinute = parseInt(endMinuteStr || "0");

        const [day, month, year] = date.split("-");
        const consultationDate = new Date(parseInt(year!), parseInt(month!) - 1, parseInt(day!));
        consultationDate.setHours(0, 0, 0, 0);

        const startDateTime = new Date(consultationDate);
        startDateTime.setHours(startHour, startMinute);

        const endDateTime = new Date(consultationDate);
        endDateTime.setHours(endHour, endMinute);

        const consultationId = await consultationService.bookConsultation(
            userId,
            doctorId,
            startDateTime,
            endDateTime
        );

        return reply.status(201).send({
            success: true,
            data: { consultationId },
            message: "Consultation booked successfully",
        });
    }

    async giveRating(
        request: FastifyRequest<{ Body: GiveRatingInput }>,
        reply: FastifyReply,
    ) {
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
    }

    async callDoctor(
        request: FastifyRequest<{ Params: { consultationId: string } }>,
        reply: FastifyReply,
    ) {
        const userId = request.user.sub;
        const { consultationId } = request.params;

        const link = await consultationService.callDoctor(userId, consultationId);
        return reply.status(200).send({
            success: true,
            data: { link },
            message: "Doctor call link retrieved successfully",
        });
    }

    async getPaymentConfirmation(
        request: FastifyRequest<{ Params: { consultationId: string } }>,
        reply: FastifyReply,
    ) {
        const userId = request.user.sub;
        const { consultationId } = request.params;
        const confirmation = await consultationService.getPaymentConfirmation(consultationId, userId);
        return reply.status(200).send({
            success: true,
            data: confirmation,
            message: "Payment confirmation retrieved successfully",
        });
    }
}

export const consultationController = new ConsultationController();
