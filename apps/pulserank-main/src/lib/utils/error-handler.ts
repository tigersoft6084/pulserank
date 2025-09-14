interface ErrorDetails {
  [key: string]: unknown;
}

export class APIError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string,
    public details?: ErrorDetails,
  ) {
    super(message);
    this.name = "APIError";
  }
}

export class ValidationError extends APIError {
  constructor(message: string, details?: ErrorDetails) {
    super(400, message, "VALIDATION_ERROR", details);
    this.name = "ValidationError";
  }
}

export class AuthenticationError extends APIError {
  constructor(message: string = "Unauthorized") {
    super(401, message, "AUTHENTICATION_ERROR");
    this.name = "AuthenticationError";
  }
}

export class NotFoundError extends APIError {
  constructor(message: string = "Resource not found") {
    super(404, message, "NOT_FOUND_ERROR");
    this.name = "NotFoundError";
  }
}

export class RateLimitError extends APIError {
  constructor(message: string = "Too many requests", details?: ErrorDetails) {
    super(429, message, "RATE_LIMIT_ERROR", details);
    this.name = "RateLimitError";
  }
}

export class ExternalAPIError extends APIError {
  constructor(message: string, details?: ErrorDetails) {
    super(502, message, "EXTERNAL_API_ERROR", details);
    this.name = "ExternalAPIError";
  }
}

export function handleAPIError(error: unknown) {
  if (error instanceof APIError) {
    return {
      statusCode: error.statusCode,
      body: {
        // error: error.message,
        message: error.message,
        code: error.code,
        details: error.details,
      },
    };
  }

  // Handle null/undefined errors
  if (error === null || error === undefined) {
    console.error("Unhandled error: null or undefined");
    return {
      statusCode: 500,
      body: {
        error: "Internal server error",
        code: "INTERNAL_SERVER_ERROR",
      },
    };
  }

  console.error("Unhandled error:", error || "Unknown error");
  return {
    statusCode: 500,
    body: {
      error: "Internal server error",
      code: "INTERNAL_SERVER_ERROR",
    },
  };
}
