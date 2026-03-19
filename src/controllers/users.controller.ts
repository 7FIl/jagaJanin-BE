import { FastifyRequest, FastifyReply } from "fastify";
import { updateProfileInput, updatePasswordInput, usersService } from "../services/users.service.js";

export class UsersController {

    async getUserProfile(
        request: FastifyRequest,
        reply: FastifyReply) {
        try {
            const userId = request.user.sub;
            const profile = await usersService.UserProfile(userId);
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
            const updatedProfile = await usersService.updateUserProfile(userId, input.fullName, input.email, input.password);
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
            await usersService.updatePreference(userId, foodPreference);
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
            await usersService.editPassword(userId, input.currentPassword, input.newPassword);
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

}

export const usersController = new UsersController();