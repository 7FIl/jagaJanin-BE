import { FastifyRequest, FastifyReply } from "fastify";
import { paymentService } from "../services/payment.service.js";
import "dotenv/config";

interface ConsultationPaymentRequest {
    consultationId: string;
}

interface PaymentWebhookRequest {
    id: string;
    status: string;
    externalId: string;
}

const XENDIT_WEBHOOK_SECRET = process.env.XENDIT_WEBHOOK_SECRET;


export const validateXenditWebhookToken = async (
    request: FastifyRequest,
    reply: FastifyReply
) => {
    const callbackToken = request.headers["x-callback-token"];

    if (!XENDIT_WEBHOOK_SECRET) {
        throw new Error("XENDIT_WEBHOOK_SECRET environment variable is not set");
    }

    if (!callbackToken) {
        return reply.status(401).send({
            success: false,
            message: "Missing X-Callback-Token header",
        });
    }

    if (callbackToken !== XENDIT_WEBHOOK_SECRET) {
        return reply.status(403).send({
            success: false,
            message: "Invalid webhook token",
        });
    }
};

export class PaymentController {

    async createPayment(
        request: FastifyRequest<{ Body: ConsultationPaymentRequest }>,
        reply: FastifyReply,
    ) {
        try {
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
        } catch (error) {
            const errorMessage =
                error instanceof Error ? error.message : "Failed to create payment";

            return reply.status(400).send({
                success: false,
                message: errorMessage,
            });
        }
    }

    // Check payment status
    async checkPaymentStatus(
        request: FastifyRequest<{ Params: { invoiceId: string } }>,
        reply: FastifyReply,
    ) {
        try {
            const { invoiceId } = request.params;

            const status = await paymentService.checkPaymentStatus(invoiceId);

            return reply.status(200).send({
                success: true,
                data: { status },
                message: "Payment status retrieved successfully",
            });
        } catch (error) {
            const errorMessage =
                error instanceof Error ? error.message : "Failed to check payment status";

            return reply.status(400).send({
                success: false,
                message: errorMessage,
            });
        }
    }

    // Xendit webhook callback handler
    async handlePaymentWebhook(
        request: FastifyRequest<{ Body: PaymentWebhookRequest }>,
        reply: FastifyReply,
    ) {
        try {
            const { id, status } = request.body;

            await paymentService.handlePaymentWebhook(id, status);

            return reply.status(200).send({
                success: true,
                message: "Webhook processed successfully",
            });
        } catch (error) {
            const errorMessage =
                error instanceof Error ? error.message : "Failed to process webhook";

            return reply.status(400).send({
                success: false,
                message: errorMessage,
            });
        }
    }

    // Get payment history
    async getPaymentHistory(
        request: FastifyRequest,
        reply: FastifyReply,
    ) {
        try {
            const userId = request.user.sub;

            const payments = await paymentService.getPaymentHistory(userId);

            return reply.status(200).send({
                success: true,
                data: payments,
                message: "Payment history retrieved successfully",
            });
        } catch (error) {
            const errorMessage =
                error instanceof Error ? error.message : "Failed to get payment history";

            return reply.status(400).send({
                success: false,
                message: errorMessage,
            });
        }
    }
}

export const paymentController = new PaymentController();
