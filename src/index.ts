import fastify from "fastify";
import fastifyJwt from "@fastify/jwt";
import fastifyRateLimit from "@fastify/rate-limit";
import multipart from "@fastify/multipart";
import { checkDatabaseConnection } from "./db/index.js";
import { authRoutes } from "./routes/auth.routes.js";
import { formRoutes } from "./routes/form.routes.js";
import { authPlugin } from "./plugins/auth.plugins.js";
import { setupErrorHandler, setupNotFoundHandler, setupUncaughtErrorHandlers } from "./lib/errorHandler.js";
import "dotenv/config";
import { profileRoutes } from "./routes/profile.routes.js";
import { dashboardRoutes } from "./routes/dashboard.route.js";
import { kiaRoutes } from "./routes/kia.routes.js";
import { consultation } from "./db/schema.js";
import { consultationRoutes } from "./routes/consultation.routes.js";
import { paymentRoutes } from "./routes/payment.routes.js";

const app = fastify();

const jwtSecret = process.env.JWT_SECRET;
const PORT = process.env.API_PORT;

if (!jwtSecret) {
  throw new Error("JWT_SECRET environment variable is required");
}
if (!PORT) {
  throw new Error("API_PORT environment variable is required");
}

setupErrorHandler(app);
setupNotFoundHandler(app);
setupUncaughtErrorHandlers();

app.register(fastifyJwt, {
  secret: jwtSecret
});

app.register(multipart,{
  limits: {
    fileSize: 2 * 1024 * 1024,
  },
});

app.register(authPlugin);

app.get("/v1/", (request, reply) => {
  return { success: "true" };
});

app.get("/health", async (request, reply) => {
    if (await checkDatabaseConnection()) {
        return { status: 'healthy', database: 'connected' };
    }
    return { status: 'unhealthy', database: 'disconnected' };
});

app.register(async function (app) {
  await app.register(fastifyRateLimit, {
    max: 5,
    timeWindow: "3 minute",
  });

  app.register(authRoutes, { prefix: "/api/v1/auth" });
});

app.register(formRoutes, { prefix: "/api/v1/forms" });
app.register(profileRoutes, { prefix: "/api/v1/profile" });
app.register(dashboardRoutes, { prefix: "/api/v1/dashboard" });
app.register(kiaRoutes, { prefix: "/api/v1/kia" });
app.register(consultationRoutes, { prefix: "/api/v1/consultation" });
app.register(paymentRoutes, { prefix: "/api/v1/payment" });

app.listen({ port: Number(PORT) }, (err, address) => {
  if (err) {
    console.error("Failed to start server:", err);
    app.log.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});

