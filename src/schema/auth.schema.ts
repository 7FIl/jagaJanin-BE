export const registerSchema = {
    tags: ["Authentication"],
    security: [],
    summary: "Register a new user",
    description: "Create a new user account with email and password. Sends OTP verification email upon successful registration.",
    body: {
        type: "object",
        required: ["fullName", "email", "password", "phoneNumber"],
        properties: {
            fullName: { type: "string", minLength: 2, description: "Full name of the user" },
            email: { type: "string", format: "email", description: "User email address (must be unique)" },
            password: { type: "string", minLength: 6, description: "Password (minimum 6 characters)" },
            phoneNumber: { type: "string", minLength: 10, maxLength: 20, description: "Phone number (10-20 digits)" }
        },
        additionalProperties: false
    },
    response: {
        201: {
            description: "User registered successfully - OTP sent to email",
            type: "object",
            required: ["success", "data", "message"],
            properties: {
                success: { type: "boolean", description: "Operation success status" },
                data: {
                    type: "object",
                    description: "New user information",
                    required: ["id", "email"],
                    properties: {
                        id: { type: "string", description: "New user ID" },
                        email: { type: "string", description: "Registered email address" }
                    }
                },
                message: { type: "string", description: "Success message and instruction to verify email" }
            }
        },
        400: {
            description: "Invalid request data",
            type: "object",
            properties: {
                success: { type: "boolean" },
                message: { type: "string", description: "Error message (e.g., validation errors)" }
            }
        },
        409: {
            description: "Email already in use",
            type: "object",
            properties: {
                success: { type: "boolean" },
                message: { type: "string", description: "Email already registered" }
            }
        },
        500: {
            description: "Server error during registration",
            type: "object",
            properties: {
                success: { type: "boolean" },
                message: { type: "string" }
            }
        }
    }
};

export const loginSchema = {
    tags: ["Authentication"],
    security: [],
    summary: "Login user",
    description: "Authenticate user with email and password. Returns access token and refresh token.",
    body: {
        type: "object",
        required: ["email", "password"],
        properties: {
            email: { type: "string", format: "email", description: "User email address" },
            password: { type: "string", description: "User password" }
        },
        additionalProperties: false
    },
    response: {
        200: {
            description: "User logged in successfully",
            type: "object",
            required: ["success", "data", "message"],
            properties: {
                success: { type: "boolean", description: "Operation success status" },
                data: {
                    type: "object",
                    description: "Authentication tokens and user information",
                    required: ["user", "accessToken", "refreshToken"],
                    properties: {
                        user: {
                            type: "object",
                            description: "Authenticated user details",
                            required: ["id", "email"],
                            properties: {
                                id: { type: "string", description: "User ID" },
                                email: { type: "string", description: "User email" }
                            }
                        },
                        accessToken: { type: "string", description: "JWT access token (valid for 1 hour)" },
                        refreshToken: { type: "string", description: "Refresh token for getting new access tokens" }
                    }
                },
                message: { type: "string", description: "Success message" }
            }
        },
        400: {
            description: "Invalid request data",
            type: "object",
            properties: {
                success: { type: "boolean" },
                message: { type: "string" }
            }
        },
        401: {
            description: "Invalid credentials (wrong email or password)",
            type: "object",
            properties: {
                success: { type: "boolean" },
                message: { type: "string", description: "Invalid email or password" }
            }
        },
        500: {
            description: "Server error during login",
            type: "object",
            properties: {
                success: { type: "boolean" },
                message: { type: "string" }
            }
        }
    }
};

export const refreshTokenSchema = {
    tags: ["Authentication"],
    security: [],
    summary: "Refresh access token",
    description: "Get a new access token using refresh token (implements refresh token rotation)",
    body: {
        type: "object",
        required: ["refreshToken"],
        properties: {
            refreshToken: { type: "string", description: "Refresh token from login response" }
        },
        additionalProperties: false
    },
    response: {
        200: {
            description: "New access token generated successfully (old refresh token revoked)",
            type: "object",
            properties: {
                success: { type: "boolean", description: "Operation success status" },
                data: {
                    type: "object",
                    description: "New tokens after rotation",
                    properties: {
                        accessToken: { type: "string", description: "New JWT access token (valid for 1 hour)" },
                        refreshToken: { type: "string", description: "New refresh token (old token is now invalid)" }
                    }
                },
                message: { type: "string", description: "Success message" }
            }
        },
        400: {
            description: "Invalid request data",
            type: "object",
            properties: {
                success: { type: "boolean" },
                message: { type: "string" }
            }
        },
        401: {
            description: "Invalid or expired refresh token",
            type: "object",
            properties: {
                success: { type: "boolean" },
                message: { type: "string", description: "Error message (e.g., 'Invalid token', 'Token expired')" }
            }
        },
        500: {
            description: "Server error during token refresh",
            type: "object",
            properties: {
                success: { type: "boolean" },
                message: { type: "string" }
            }
        }
    }
};

export const otpSchema = {
    tags: ["Authentication"],
    security: [],
    summary: "Verify OTP code",
    description: "Verify email with OTP code sent to user's email",
    body: {
        type: "object",
        required: ["email", "code"],
        properties: {
            email: { type: "string", format: "email", description: "User email" },
            code: { type: "string", minLength: 6, maxLength: 6, description: "6-digit OTP code" }
        },
        additionalProperties: false
    },
    response: {
        200: {
            description: "Email verified successfully",
            type: "object",
            properties: {
                success: { type: "boolean", description: "Operation success status" },
                message: { type: "string", description: "Verification success message" }
            }
        },
        400: {
            description: "Invalid or expired OTP code",
            type: "object",
            properties: {
                success: { type: "boolean" },
                message: { type: "string", description: "Error message (e.g., 'Invalid OTP', 'OTP expired')" }
            }
        },
        500: {
            description: "Server error during OTP verification",
            type: "object",
            properties: {
                success: { type: "boolean" },
                message: { type: "string" }
            }
        }
    }
};

export const resendOtpSchema = {
    tags: ["Authentication"],
    security: [],
    summary: "Resend OTP code",
    description: "Request a new OTP code to be sent to user's email",
    body: {
        type: "object",
        required: ["email"],
        properties: {
            email: { type: "string", format: "email", description: "User email address" }
        },
        additionalProperties: false
    },
    response: {
        200: {
            description: "OTP sent successfully",
            type: "object",
            properties: {
                success: { type: "boolean", description: "Operation success status" },
                message: { type: "string", description: "OTP sent confirmation message" }
            }
        },
        400: {
            description: "Invalid email format",
            type: "object",
            properties: {
                success: { type: "boolean" },
                message: { type: "string", description: "Validation error message" }
            }
        },
        500: {
            description: "Server error - OTP sending failed",
            type: "object",
            properties: {
                success: { type: "boolean" },
                message: { type: "string", description: "Error message" }
            }
        }
    }
};

export const googleCallbackSchema = {
    tags: ["Authentication"],
    security: [],
    summary: "Google OAuth callback",
    description: "Handle Google OAuth callback and authenticate user. Redirect here from Google with authorization code.",
    querystring: {
        type: "object",
        required: ["code"],
        properties: {
            code: { type: "string", description: "Google authorization code from OAuth flow" },
            state: { type: "string", description: "Optional state parameter from Google" }
        },
        additionalProperties: false
    },
    response: {
        200: {
            description: "Google authentication successful",
            type: "object",
            properties: {
                success: { type: "boolean", description: "Operation success status" },
                data: {
                    type: "object",
                    description: "Authentication tokens and user information",
                    properties: {
                        user: {
                            type: "object",
                            description: "Authenticated user details",
                            properties: {
                                id: { type: "string", description: "User ID" },
                                email: { type: "string", description: "User email from Google account" },
                                fullName: { type: "string", description: "User full name from Google profile" }
                            }
                        },
                        accessToken: { type: "string", description: "JWT access token (valid for 1 hour)" },
                        refreshToken: { type: "string", description: "Refresh token for getting new access tokens" }
                    }
                },
                message: { type: "string", description: "Success message" }
            }
        },
        400: {
            description: "Missing authorization code",
            type: "object",
            properties: {
                success: { type: "boolean" },
                message: { type: "string", description: "Authorization code is required" }
            }
        },
        401: {
            description: "Failed to authenticate with Google",
            type: "object",
            properties: {
                success: { type: "boolean" },
                message: { type: "string", description: "Error message from Google authentication" }
            }
        }
    }
};

export const logoutSchema = {
    tags: ["Authentication"],
    summary: "Logout user",
    description: "Logout the current authenticated user and invalidate refresh tokens",
    response: {
        200: {
            description: "User logged out successfully",
            type: "object",
            properties: {
                success: { type: "boolean", description: "Operation success status" },
                message: { type: "string", description: "Logout success message" }
            }
        },
        401: {
            description: "Unauthorized - authentication required",
            type: "object",
            properties: {
                success: { type: "boolean" },
                message: { type: "string" }
            }
        },
        500: {
            description: "Server error during logout",
            type: "object",
            properties: {
                success: { type: "boolean" },
                message: { type: "string" }
            }
        }
    }
};

export const getGoogleLoginUrlSchema = {
    tags: ["Authentication"],
    security: [],
    summary: "Get Google login URL",
    description: "Get the Google OAuth login URL to redirect user for authentication",
    response: {
        200: {
            description: "Google login URL retrieved successfully",
            type: "object",
            properties: {
                success: { type: "boolean", description: "Operation success status" },
                data: {
                    type: "object",
                    description: "Google OAuth URL",
                    properties: {
                        authUrl: { type: "string", format: "uri", description: "Google OAuth authorization URL to redirect user to" }
                    }
                },
                message: { type: "string", description: "Success message" }
            }
        },
        500: {
            description: "Server error generating Google login URL",
            type: "object",
            properties: {
                success: { type: "boolean" },
                message: { type: "string" }
            }
        }
    }
};