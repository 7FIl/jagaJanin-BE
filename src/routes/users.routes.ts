import { FastifyInstance } from "fastify";
import { usersController } from "../controllers/users.controller.js";
import { updatePasswordInput, updateProfileInput } from "../services/users.service.js";
import { updatePasswordSchema, updateUserProfileSchema, updatePreferenceSchema, updatePhoneNumberSchema } from "../schema/users.schema.js";

export async function usersRoutes(fastify: FastifyInstance) {

    fastify.get("/profile", { onRequest: [fastify.authenticate] }, usersController.getUserProfile);
    fastify.get("/avatar", { onRequest: [fastify.authenticate]}, usersController.getAvatar);
    fastify.patch<{ Body: updateProfileInput }>("/profile", { onRequest: [fastify.authenticate], schema: updateUserProfileSchema }, usersController.updateUserProfile);
    fastify.patch<{ Body: { foodPreference: number } }>("/preference", { onRequest: [fastify.authenticate], schema: updatePreferenceSchema }, usersController.updatePreference);
    fastify.patch<{ Body: updatePasswordInput }>("/password", { onRequest: [fastify.authenticate], schema: updatePasswordSchema }, usersController.updatePassword);
    fastify.patch<{ Body: { phoneNumber: string } }>("/phone-number", { onRequest: [fastify.authenticate], schema: updatePhoneNumberSchema }, usersController.updatePhoneNumber);
    fastify.patch("/avatar", { onRequest: [fastify.authenticate]}, usersController.updateAvatar);
}