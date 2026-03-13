import { FastifyInstance } from "fastify";
import { formcontroller } from "../controllers/form.controller.js";
import { onboardingFormSchema } from "../schema/form.schema.js";


export async function formRoutes(fastify: FastifyInstance) {
    fastify.post(
        "/onboarding",
        { onRequest: [fastify.authenticate], schema: onboardingFormSchema },
        formcontroller.onboardingForm.bind(formcontroller));
}