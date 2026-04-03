import { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";
import { authService, loginInput, otpInput, registerInput} from "../services/auth.service.js";
import { getGoogleUser, getGoogleAuthUrl } from "../lib/google.js";
import { AppError } from "../lib/errorHandler.js";

export function buildAuthController(fastify: FastifyInstance) {
    return {
        async register(
            request: FastifyRequest<{ Body: registerInput }>,
            reply: FastifyReply,
        ) {
            const input = request.body;
            const existingUser = await authService.checkUserExists(input.email);
            if (existingUser) {
                throw new AppError("Email already in use", 409);
            }

            const newUser = await authService.createNewUser(input);
            await authService.sendOtp(input.email);
            return reply.status(201).send({
                success: true,
                data: {id: newUser.id, email: newUser.email},
                message: "User registered successfully",
            });
        },

        async login(
            request: FastifyRequest<{ Body: loginInput }>,
            reply: FastifyReply,
        ) {
            const input = request.body;
            const user = await authService.verifyUserCredentials(input);
            await authService.revokeRefreshToken(user.id);
            const accessToken = await authService.generateAccessToken(user, fastify);
            const refreshToken = await authService.generateRefreshToken(user.id);                

            return reply.status(200).send({
                success: true,
                data: { user: { id: user.id, email: user.email }, accessToken, refreshToken },
                message: "User logged in successfully",
            });
        },

        async refreshToken(
            request: FastifyRequest<{ Body: { refreshToken: string } }>,
            reply: FastifyReply,
        ) {
            const input = request.body;
            const { accessToken, refreshToken } = await authService.rotateRefreshToken(input.refreshToken, fastify);

            return reply.status(200).send({
                success: true,
                data: { accessToken, refreshToken },
                message: "Access token refreshed successfully",
            });
        },

        async logout(
            request: FastifyRequest,
            reply: FastifyReply,
        ) {
            const userId = request.user.sub;
            await authService.revokeRefreshToken(userId)
            return reply.status(200).send({
                success: true,
                message: "User logged out successfully",
            });
        },

        async getOtp(
            request: FastifyRequest<{ Body: { email: string } }>,
            reply: FastifyReply,
        ){
            const input = request.body;
            await authService.sendOtp(input.email);
            return reply.status(200).send({
                success: true,
                message: "OTP sent successfully",
            });
        },

        async verifyEmail(
            request: FastifyRequest<{ Body: otpInput }>,
            reply: FastifyReply,
        ) {
            const input = request.body;
            await authService.verifyOtp(input);
            return reply.status(200).send({
                success: true,
                message: "Email verified successfully",
            });
        },

        async getGoogleLoginUrl(
            request: FastifyRequest,
            reply: FastifyReply,
        ) {
            const authUrl = getGoogleAuthUrl();
            return reply.status(200).send({
                success: true,
                data: { authUrl },
                message: "Google auth URL generated",
            });
        },

        async googleCallback(
            request: FastifyRequest<{ Querystring: { code: string; state?: string } }>,
            reply: FastifyReply,
        ) {
            const { code } = request.query;

            if (!code) {
                throw new AppError("Authorization code is required", 400);
            }

            const payload = await getGoogleUser(code);
            const user = await authService.handleGoogleCallback(payload);
            const accessToken = await authService.generateAccessToken(user, fastify);
            const refreshToken = await authService.generateRefreshToken(user.id);

            return reply.status(200).send({
                success: true,
                data: { 
                    user: { id: user.id, email: user.email, fullName: user.fullName }, 
                    accessToken, 
                    refreshToken 
                },
                message: "Google login successful",
            });
        }
    };
}