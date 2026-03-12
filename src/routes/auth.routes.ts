import { FastifyInstance } from "fastify";
import { buildAuthController } from "../controllers/auth.controller.js";
import { loginSchema, registerSchema } from "../schema/auth.schema.js";

export async function authroutes(fastify: FastifyInstance) {
    const controller = buildAuthController(fastify);

    fastify.post("/register", { schema: registerSchema }, controller.register);
    fastify.post("/login", { schema: loginSchema }, controller.login);
}