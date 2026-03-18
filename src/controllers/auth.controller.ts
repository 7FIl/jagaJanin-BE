import { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";
import { authService, loginInput, registerInput} from "../services/auth.service.js";

export function buildAuthController(fastify: FastifyInstance) {
    return {
        async register(
            request: FastifyRequest<{ Body: registerInput }>,
            reply: FastifyReply,
        ) {
            const input = request.body;

            const existingUser = await authService.checkUserExists(input.email);
            if (existingUser) {
                return reply.status(409).send({
                    success: false,
                    message: "Email already in use",
                });
            }

            const newUser = await authService.createNewUser(input);
            return reply.status(201).send({
                success: true,
                data: newUser,
                message: "User registered successfully",
            });
        },

        async login(
            request: FastifyRequest<{ Body: loginInput }>,
            reply: FastifyReply,
        ) {
            const input = request.body;

            try {
                const user = await authService.verifyUserCredentials(input);
                await authService.revokeRefreshToken(user.id);
                const accessToken = await authService.generateAccessToken(user, fastify);
                const refreshToken = await authService.generateRefreshToken(user.id);                

                return reply.status(200).send({
                    success: true,
                    data: { user, authorization: { accessToken, refreshToken } },
                    message: "User logged in successfully",
                });
                
            } catch (error) {
                const errorMessage =
                    error instanceof Error ? error.message : "An error occurred";

                return reply.status(401).send({
                    success: false,
                    message: errorMessage,
                });
            }
        },

        async refreshToken(
            request: FastifyRequest<{ Body: { refreshToken: string } }>,
            reply: FastifyReply,
        ) {
            const input = request.body;

            try {
                const { accessToken, refreshToken } = await authService.rotateRefreshToken(input.refreshToken, fastify);

                return reply.status(200).send({
                    success: true,
                    data: { accessToken, refreshToken },
                    message: "Access token refreshed successfully",
                });
            } catch (error) {
                const errorMessage =
                    error instanceof Error ? error.message : "An error occurred";
                return reply.status(401).send({
                    success: false,
                    message: errorMessage,
                });
            }
        }
    };
}