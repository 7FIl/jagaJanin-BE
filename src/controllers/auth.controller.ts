import { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";
import { authService, loginInput, registerInput } from "../services/auth.service.js";


export function buildAuthController(fastify: FastifyInstance) {
    return {
        async register(
            request: FastifyRequest<{ Body: registerInput }>,
            reply: FastifyReply,
        ) {
            const { fullName, email, password } = request.body;

            const existingUser = await authService.checkUserExists(email);
            if (existingUser) {
                return reply.status(409).send({
                    success: false,
                    message: "Email already in use",
                });
            }

            const newUser = await authService.createNewUser({ fullName, email, password });
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
            const { email, password } = request.body;

            try {
                const user = await authService.verifyUserCredentials({ email, password });

                const token = fastify.jwt.sign(
                    { id: user.id },
                    { expiresIn: "1d" },
                );

                return reply.status(200).send({
                    success: true,
                    data: { user, token },
                    message: "User logged in successfully",
                });
            } catch {
                return reply.status(401).send({
                    success: false,
                    message: "Invalid credentials",
                });
            }
        },
    };
}