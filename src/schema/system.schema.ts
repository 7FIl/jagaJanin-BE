export const healthCheckSchema = {
    security: [],
    summary: "Health check",
    description: "Check API and database health status",
    response: {
        200: {
            description: "Server and database status",
            type: "object",
            properties: {
                status: { type: "string", enum: ["healthy", "unhealthy"], description: "API status" },
                database: { type: "string", enum: ["connected", "disconnected"], description: "Database connection status" }
            }
        },
        500: {
            description: "Server error",
            type: "object",
            properties: {
                status: { type: "string" },
                database: { type: "string" }
            }
        }
    }
};

export const apiStatusSchema = {
    security: [],
    summary: "API status",
    description: "Get basic API status",
    response: {
        200: {
            description: "API is running",
            type: "object",
            properties: {
                success: { type: "string", description: "Success indicator" }
            }
        }
    }
};
