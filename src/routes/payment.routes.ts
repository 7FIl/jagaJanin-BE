import { FastifyInstance } from "fastify";
import { paymentController } from "../controllers/payment.controller.js";

export async function paymentRoutes(fastify: FastifyInstance) {
    fastify.post<{ Body: { consultationId: string } }>
    ("/create",{ onRequest: [fastify.authenticate] },(request, reply) => paymentController.createPayment(request, reply));
    fastify.get<{ Params: { invoiceId: string } }>
    ("/status/:invoiceId",{ onRequest: [fastify.authenticate] },(request, reply) => paymentController.checkPaymentStatus(request, reply));
    fastify.post<{ Body: { id: string; status: string; externalId: string } }>
    ("/webhook",(request, reply) => paymentController.handlePaymentWebhook(request, reply));
    fastify.get("/history",{ onRequest: [fastify.authenticate] },(request, reply) => paymentController.getPaymentHistory(request, reply));
}
