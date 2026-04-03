import { FastifyInstance } from "fastify";
import { buildAuthController } from "../controllers/auth.controller.js";
import { loginSchema, otpSchema, refreshTokenSchema, registerSchema, resendOtpSchema, googleCallbackSchema, logoutSchema, getGoogleLoginUrlSchema } from "../schema/auth.schema.js";

export async function authRoutes(fastify: FastifyInstance) {
    const controller = buildAuthController(fastify);

    fastify.post("/register", { schema: registerSchema }, controller.register);
    fastify.post("/login", { schema: loginSchema }, controller.login);
    fastify.post("/refresh-token", { schema: refreshTokenSchema }, controller.refreshToken);
    fastify.post("/logout", { schema: logoutSchema, onRequest: [fastify.authenticate] }, controller.logout);
    fastify.post("/verify-otp", { schema: otpSchema }, controller.verifyEmail);
    fastify.post("/resend-otp", { schema: resendOtpSchema }, controller.getOtp);
    fastify.get("/google", { schema: getGoogleLoginUrlSchema }, controller.getGoogleLoginUrl);
    fastify.get("/google/callback", { schema: googleCallbackSchema }, controller.googleCallback);
}