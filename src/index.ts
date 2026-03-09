import fastify from "fastify";
import { checkDatabaseConnection } from "./db/index.js";
const app = fastify();

const PORT = process.env.API_PORT;

if (!PORT) {
  throw new Error("API_PORT environment variable is required");
}

app.get("/", (request, reply) => {
  return { success: "true" };
});

app.get("/health", async (request, reply) => {
    if (await checkDatabaseConnection()) {
        return { status: 'healthy', database: 'connected' };
    }
    return { status: 'unhealthy', database: 'disconnected' };
});

app.listen({ port: PORT as unknown as number }, (err, address) => {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});

