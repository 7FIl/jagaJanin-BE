import { FastifyInstance, FastifyRequest, FastifyReply, FastifyError } from "fastify";

interface ErrorResponse {
  success: boolean;
  message: string;
  statusCode: number;
  error?: string;
  timestamp: string;
  path?: string;
  method?: string;
}

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public details?: any
  ) {
    super(message);
    this.name = "AppError";
  }
}

const isFastifyError = (error: unknown): error is FastifyError => {
  return error instanceof Error && "statusCode" in error;
};

const isAppError = (error: unknown): error is AppError => {
  return error instanceof AppError;
};

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  return "Unknown error occurred";
};


const getErrorName = (error: unknown): string => {
  if (error instanceof Error) {
    return error.name;
  }
  return "UnknownError";
};

export const setupErrorHandler = (app: FastifyInstance) => {
  app.setErrorHandler(async (error: FastifyError, request: FastifyRequest, reply: FastifyReply) => {
    const timestamp = new Date().toISOString();
    const path = request.url;
    const method = request.method;

    const errorMessage = getErrorMessage(error);
    const errorName = getErrorName(error);

    // Log error
    app.log.error({
      timestamp,
      method,
      path,
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
      details: error,
    });

    let statusCode = 500;
    let message = "Internal Server Error";
    let responseErrorName = errorName;

    if (isAppError(error)) {
      statusCode = error.statusCode;
      message = error.message;
    } else if (isFastifyError(error) && error.statusCode && typeof error.statusCode === "number") {
      statusCode = error.statusCode;
      message = error.message;
    } else if (errorName === "ValidationError") {
      statusCode = 400;
      message = "Validation Error";
    } else if (errorName === "UnauthorizedError" || errorName === "JWTClaimsInvalid") {
      statusCode = 401;
      message = "Unauthorized";
    } else if (errorName === "ForbiddenError") {
      statusCode = 403;
      message = "Forbidden";
    } else if (errorName === "NotFoundError") {
      statusCode = 404;
      message = "Not Found";
    } else if (errorName === "ConflictError") {
      statusCode = 409;
      message = "Conflict";
    } else if (errorName === "RateLimitError") {
      statusCode = 429;
      message = "Too Many Requests";
    } else if (
      errorMessage.includes("ECONNREFUSED") ||
      errorMessage.includes("database")
    ) {
      statusCode = 503;
      message = "Service Unavailable - Database Connection Failed";
      responseErrorName = "DatabaseError";
    }

    const errorResponse: ErrorResponse = {
      success: false,
      message,
      statusCode,
      error: responseErrorName,
      timestamp,
      path,
      method,
    };

    return reply.status(statusCode).send(errorResponse);
  });
};


export const setupNotFoundHandler = (app: FastifyInstance) => {
  app.setNotFoundHandler((request, reply) => {
    const timestamp = new Date().toISOString();

    const errorResponse: ErrorResponse = {
      success: false,
      message: "Endpoint not found",
      statusCode: 404,
      error: "NotFoundError",
      timestamp,
      path: request.url,
      method: request.method,
    };

    return reply.status(404).send(errorResponse);
  });
};


export const setupUncaughtErrorHandlers = () => {
  process.on("uncaughtException", (error) => {
    console.error(" Uncaught Exception:", error);
    process.exit(1);
  });

  process.on("unhandledRejection", (reason, promise) => {
    console.error(" Unhandled Rejection at:", promise, "reason:", reason);
  });
};
