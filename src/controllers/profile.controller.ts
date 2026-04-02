import { FastifyRequest, FastifyReply } from "fastify";
import { updateProfileInput, updatePasswordInput, profileService } from "../services/profile.service.js";

export class ProfileController {

    async getUserProfile(
        request: FastifyRequest,
        reply: FastifyReply) {
        try {
            const userId = request.user.sub;
            const profile = await profileService.userProfile(userId);
            return reply.status(200).send({
                success: true,
                data: profile,
                message: "User profile retrieved successfully",
            });
        } catch (error) {
            const errorMessage = 
                error instanceof Error ? error.message : "An error occurred";
            return reply.status(404).send({
                success: false,
                message: errorMessage,
            });
        }
    }

    async updateUserProfile(
        request: FastifyRequest<{ Body: updateProfileInput }>,
        reply: FastifyReply) {
        try {
            const userId = request.user.sub;
            const input = request.body;

            const updatedProfile = await profileService.updateUserProfile(userId, input.fullName, input.email, input.password);
            return reply.status(200).send({
                success: true,
                data: updatedProfile,
                message: "Profile updated successfully",
            });
        } catch (error) {
            const errorMessage = 
                error instanceof Error ? error.message : "An error occurred";
            return reply.status(404).send({
                success: false,
                message: errorMessage,
            });
        }
    }

    async updatePreference(
        request: FastifyRequest<{ Body: { foodPreference: number } }>,
        reply: FastifyReply) {
        try {
            const userId = request.user.sub;
            const { foodPreference } = request.body;
            await profileService.updatePreference(userId, foodPreference);
            return reply.status(200).send({
                success: true,
                message: "Food preference updated successfully",
            });
        } catch (error) {
            const errorMessage = 
                error instanceof Error ? error.message : "An error occurred";
            return reply.status(404).send({
                success: false,
                message: errorMessage,
            });
        }
    }

    async updatePassword(
        request: FastifyRequest<{ Body: updatePasswordInput }>,
        reply: FastifyReply) {
        const userId = request.user.sub;
        const input = request.body;
        try {
            await profileService.editPassword(userId, input.currentPassword, input.newPassword);
            return reply.status(200).send({
                success: true,
                message: "Password updated successfully",
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

    async updatePhoneNumber(
        request: FastifyRequest<{ Body: { phoneNumber: string } }>,
        reply: FastifyReply) {
        try {
            const userId = request.user.sub;
            const input = request.body;

            const updatedPhoneNumber = await profileService.updatePhoneNumber(userId, input.phoneNumber);
            return reply.status(200).send({
                success: true,
                data: { phoneNumber: updatedPhoneNumber },
                message: "Phone number updated successfully",
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

    async updateAvatar(
        request: FastifyRequest,
        reply: FastifyReply) {
        try {
            const userId = request.user.sub;
            const file = await request.file();
            await profileService.updateAvatar(userId, file);
            return reply.status(200).send({
                success: true,
                message: "Avatar updated successfully",
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

    async getAvatar(
        request: FastifyRequest,
        reply: FastifyReply) {
        try {
            const userId = request.user.sub;
            const avatarUrl = await profileService.avatarUrl(userId);
            return reply.status(200).send({
                success: true,
                data: { avatarUrl },
                message: "Avatar URL retrieved successfully",
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

export const profileController = new ProfileController();