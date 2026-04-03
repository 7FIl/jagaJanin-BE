import { FastifyInstance } from "fastify";
import { profileController } from "../controllers/profile.controller.js";
import { updatePasswordInput, updateProfileInput } from "../services/profile.service.js";
import { updatePasswordSchema, updateUserProfileSchema, updatePreferenceSchema, updatePhoneNumberSchema, getUserProfileSchema, getAvatarSchema, updateAvatarSchema } from "../schema/profile.schema.js";

export async function profileRoutes(fastify: FastifyInstance) {

    fastify.get("/profile", { schema: getUserProfileSchema, onRequest: [fastify.authenticate] }, profileController.getUserProfile);
    fastify.get("/avatar", { schema: getAvatarSchema, onRequest: [fastify.authenticate]}, profileController.getAvatar);
    fastify.patch<{ Body: updateProfileInput }>
    ("/profile", { onRequest: [fastify.authenticate], schema: updateUserProfileSchema }, profileController.updateUserProfile);
    fastify.patch<{ Body: { foodPreference: number } }>
    ("/preference", { onRequest: [fastify.authenticate], schema: updatePreferenceSchema }, profileController.updatePreference);
    fastify.patch<{ Body: updatePasswordInput }>
    ("/password", { onRequest: [fastify.authenticate], schema: updatePasswordSchema }, profileController.updatePassword);
    fastify.patch<{ Body: { phoneNumber: string } }>("/phone-number", { onRequest: [fastify.authenticate], schema: updatePhoneNumberSchema }, profileController.updatePhoneNumber);
    fastify.patch("/avatar", { schema: updateAvatarSchema, onRequest: [fastify.authenticate]}, profileController.updateAvatar);
}