import fastify from "fastify";
import fastifyJwt from "@fastify/jwt";
import { checkDatabaseConnection } from "./db/index.js";
import { authroutes } from "./routes/auth.routes.js";
import { formRoutes } from "./routes/form.routes.js";
import config from "dotenv/config";

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

app.get("/v1/", (request, reply) => {
  return { success: "true" };
});

app.get("/v1/health", async (request, reply) => {
    if (await checkDatabaseConnection()) {
        return { status: 'healthy', database: 'connected' };
    }
    return { status: 'unhealthy', database: 'disconnected' };
});

app.register(authroutes, { prefix: "/v1/auth" });
app.register(formRoutes, { prefix: "/v1/forms" });

app.listen({ port: PORT as unknown as number }, (err, address) => {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});

