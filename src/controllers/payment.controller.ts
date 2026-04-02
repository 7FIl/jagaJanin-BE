import { FastifyRequest, FastifyReply } from "fastify";
import { paymentService } from "../services/payment.service.js";

interface ConsultationPaymentRequest {
    consultationId: string;
}

interface PaymentWebhookRequest {
    id: string;
    status: string;
    externalId: string;
}

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
