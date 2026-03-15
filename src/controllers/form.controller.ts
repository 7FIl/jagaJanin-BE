

import { FastifyRequest, FastifyReply } from "fastify";
import { formService, formInput } from "../services/form.service.js";

export class FormController {
    async onboardingForm(
        request: FastifyRequest<{ Body: formInput }>,
        reply: FastifyReply,
    ) {
        try {
            const userId = request.user.sub;
            const input = request.body;

            const result = await formService.submitOnboardingForm(userId, input);

            if (result) {
                await formService.changeOnboardingStatus(userId);
            }

            return reply.status(201).send({
                success: true,
                message: "Onboarding form submitted successfully",
                data: {
                    completed: true,
                },
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

export const formcontroller = new FormController()