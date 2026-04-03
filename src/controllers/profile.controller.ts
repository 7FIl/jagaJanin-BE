import { FastifyRequest, FastifyReply } from "fastify";
import { updateProfileInput, updatePasswordInput, profileService } from "../services/profile.service.js";
import { AppError } from "../lib/errorHandler.js";

export class ProfileController {

    async getUserProfile(
        request: FastifyRequest,
        reply: FastifyReply) {
        const userId = request.user.sub;
        const profile = await profileService.userProfile(userId);
        return reply.status(200).send({
            success: true,
            data: profile,
            message: "User profile retrieved successfully",
        });
    }

    async updateUserProfile(
        request: FastifyRequest<{ Body: updateProfileInput }>,
        reply: FastifyReply) {
        const userId = request.user.sub;
        const input = request.body;

        const updatedProfile = await profileService.updateUserProfile(userId, input.fullName, input.email, input.password);
        return reply.status(200).send({
            success: true,
            data: updatedProfile,
            message: "Profile updated successfully",
        });
    }

    async updatePreference(
        request: FastifyRequest<{ Body: { foodPreference: number } }>,
        reply: FastifyReply) {
        const userId = request.user.sub;
        const { foodPreference } = request.body;
        await profileService.updatePreference(userId, foodPreference);
        return reply.status(200).send({
            success: true,
            message: "Food preference updated successfully",
        });
    }

    async updatePassword(
        request: FastifyRequest<{ Body: updatePasswordInput }>,
        reply: FastifyReply) {
        const userId = request.user.sub;
        const input = request.body;
        await profileService.editPassword(userId, input.currentPassword, input.newPassword);
        return reply.status(200).send({
            success: true,
            message: "Password updated successfully",
        });
    }

    async updatePhoneNumber(
        request: FastifyRequest<{ Body: { phoneNumber: string } }>,
        reply: FastifyReply) {
        const userId = request.user.sub;
        const input = request.body;

        const updatedPhoneNumber = await profileService.updatePhoneNumber(userId, input.phoneNumber);
        return reply.status(200).send({
            success: true,
            data: { phoneNumber: updatedPhoneNumber },
            message: "Phone number updated successfully",
        });
    }

    async updateAvatar(
        request: FastifyRequest,
        reply: FastifyReply) {
        const userId = request.user.sub;
        const file = await request.file();
        await profileService.updateAvatar(userId, file);
        return reply.status(200).send({
            success: true,
            message: "Avatar updated successfully",
        });
    }

    async getAvatar(
        request: FastifyRequest,
        reply: FastifyReply) {
        const userId = request.user.sub;
        const avatarUrl = await profileService.avatarUrl(userId);
        return reply.status(200).send({
            success: true,
            data: { avatarUrl },
            message: "Avatar URL retrieved successfully",
        });
    }
}

export const profileController = new ProfileController();