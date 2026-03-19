import fastify from "fastify";
import fastifyJwt from "@fastify/jwt";
import multipart from "@fastify/multipart";
import { checkDatabaseConnection } from "./db/index.js";
import { authRoutes } from "./routes/auth.routes.js";
import { formRoutes } from "./routes/form.routes.js";
import { authPlugin } from "./plugins/auth.plugins.js";
import "dotenv/config";
import { usersRoutes } from "./routes/users.routes.js";

const app = fastify();

const jwtSecret = process.env.JWT_SECRET;
const PORT = process.env.API_PORT;

if (!jwtSecret) {
  throw new Error("JWT_SECRET environment variable is required");
}
if (!PORT) {
  throw new Error("API_PORT environment variable is required");
}

app.register(fastifyJwt, {
  secret: jwtSecret
});

await app.register(multipart,{
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

app.register(authRoutes, { prefix: "/api/v1/auth" });
app.register(formRoutes, { prefix: "/api/v1/forms" });
app.register(usersRoutes, { prefix: "/api/v1/users" });

app.listen({ port: Number(PORT) }, (err, address) => {
  if (err) {
    console.error("Failed to start server:", err);
    app.log.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});

