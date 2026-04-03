import { FastifyRequest, FastifyReply } from "fastify";
import { formService, formInput } from "../services/form.service.js";
import { AppError } from "../lib/errorHandler.js";

export class FormController {
        async onboardingForm(
            request: FastifyRequest<{ Body: formInput }>,
            reply: FastifyReply,
        ) {
            const userId = request.user.sub;
            const input = request.body;

            const result = await formService.submitOnboardingForm(userId, input);

            if (result !== null) {
                await formService.changeOnboardingStatus(userId);
            }

            return reply.status(201).send({
                success: true,
                message: "Onboarding form submitted successfully",
                data: result,
            });
        }
}

export const formController = new FormController();