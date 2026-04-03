import { FastifyInstance } from "fastify";
import { formController } from "../controllers/form.controller.js";
import { onboardingFormSchema } from "../schema/form.schema.js";
import { formInput } from "../services/form.service.js";


export async function formRoutes(fastify: FastifyInstance) {
    fastify.post<{ Body: formInput }>
    ("/onboarding",{ onRequest: [fastify.authenticate], schema: onboardingFormSchema },formController.onboardingForm.bind(formController));
}