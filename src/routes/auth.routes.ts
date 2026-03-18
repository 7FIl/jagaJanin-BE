import { FastifyInstance } from "fastify";
import { buildAuthController } from "../controllers/auth.controller.js";
import { loginSchema, refreshTokenSchema, registerSchema } from "../schema/auth.schema.js";

export async function authroutes(fastify: FastifyInstance) {
    const controller = buildAuthController(fastify);

    fastify.post("/register", { schema: registerSchema }, controller.register);
    fastify.post("/login", { schema: loginSchema }, controller.login);
    fastify.post("/refresh-token", { schema: refreshTokenSchema }, controller.refreshToken);
}