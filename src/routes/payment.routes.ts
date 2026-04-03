import { FastifyInstance } from "fastify";
import { paymentController, validateXenditWebhookToken } from "../controllers/payment.controller.js";
import { createPaymentSchema, checkPaymentStatusSchema, handlePaymentWebhookSchema, } from "../schema/payment.schema.js";

export async function paymentRoutes(fastify: FastifyInstance) {
    fastify.post<{ Body: { consultationId: string } }>
    ( "/create", { schema: createPaymentSchema, onRequest: [fastify.authenticate] }, paymentController.createPayment );
    fastify.get<{ Params: { invoiceId: string } }>
    ( "/status/:invoiceId",{ schema: checkPaymentStatusSchema, onRequest: [fastify.authenticate] }, paymentController.checkPaymentStatus );
    fastify.post<{ Body: { id: string; status: string; externalId: string } }>
    ("/webhook",{ schema: handlePaymentWebhookSchema, onRequest: [validateXenditWebhookToken] }, paymentController.handlePaymentWebhook );
    fastify.get( "/history", { onRequest: [fastify.authenticate] }, paymentController.getPaymentHistory );
}
