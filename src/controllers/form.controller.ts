import { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";
import { formService, formInput } from "../services/form.service.js";

export function buildFormController(fastify: FastifyInstance) {
    return {
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
                        name: result!.name,
                        age: result!.age,
                        trimester: result!.trimester,
                        aktivitas: result!.aktivitas,
                        dailyCalories: result!.calories,
                        mealRecommendation: result!.mealRecommendation
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
}
