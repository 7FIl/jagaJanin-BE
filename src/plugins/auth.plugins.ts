// src/plugins/auth.plugin.ts
import "@fastify/jwt";
import fp from "fastify-plugin";
import { FastifyRequest, FastifyReply } from "fastify";

export const authPlugin = fp(async (fastify) => {
    
    fastify.decorate("authenticate", async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            await request.jwtVerify();
        } catch (err) {
            return reply.status(401).send({
                success: false,
                message: "Unauthorized or expired token",
            });
        }
    });

});

declare module "@fastify/jwt" {
    interface FastifyJWT {
        payload: { sub: string, role: string };
        user: { sub: string, role: string }
    }
}

declare module "fastify" {
    interface FastifyInstance {
        authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    }
}