import { FastifyRequest, FastifyReply } from "fastify";
import { ConsultationPaymentRequest, paymentService, PaymentWebhookRequest } from "../services/payment.service.js";
import { AppError } from "../lib/errorHandler.js";
import "dotenv/config";


const XENDIT_WEBHOOK_SECRET = process.env.XENDIT_WEBHOOK_SECRET;

export const validateXenditWebhookToken = async (
    request: FastifyRequest,
    reply: FastifyReply
) => {
    const callbackToken = request.headers["x-callback-token"];

    if (!XENDIT_WEBHOOK_SECRET) {
        throw new AppError("XENDIT_WEBHOOK_SECRET environment variable is not set", 500);
    }

    if (!callbackToken) {
        throw new AppError("Missing X-Callback-Token header", 401);
    }

    if (callbackToken !== XENDIT_WEBHOOK_SECRET) {
        throw new AppError("Invalid webhook token", 403);
    }
};


export class PaymentController {

    async createPayment(
        request: FastifyRequest<{ Body: ConsultationPaymentRequest }>,
        reply: FastifyReply,
    ) {
        const { consultationId } = request.body;
        const userId = request.user.sub;

        const paymentData = await paymentService.createConsultationPayment(
            consultationId,
            userId
        );

        return reply.status(201).send({
            success: true,
            data: paymentData,
            message: "Payment invoice created successfully",
        });
    }

    // Check payment status
    async checkPaymentStatus(
        request: FastifyRequest<{ Params: { invoiceId: string } }>,
        reply: FastifyReply,
    ) {
        const { invoiceId } = request.params;

        const { status, consultationId } = await paymentService.checkPaymentStatus(invoiceId);

        return reply.status(200).send({
            success: true,
            data: { status, consultationId },
            message: "Payment status retrieved successfully",
        });
    }

    async handlePaymentWebhook(
        request: FastifyRequest<{ Body: PaymentWebhookRequest }>,
        reply: FastifyReply,
    ) {
        const { external_id, status } = request.body;

        await paymentService.handlePaymentWebhook(external_id, status);

        return reply.status(200).send({
            success: true,
            message: "Webhook processed successfully",
        });
    }

    async getPaymentHistory(
        request: FastifyRequest,
        reply: FastifyReply,
    ) {
        const userId = request.user.sub;

        const payments = await paymentService.getPaymentHistory(userId);

        return reply.status(200).send({
            success: true,
            data: payments,
            message: "Payment history retrieved successfully",
        });
    }
}

export const paymentController = new PaymentController();
