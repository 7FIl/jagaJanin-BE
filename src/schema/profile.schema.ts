export const updateUserProfileSchema = {
    tags: ["Profile"],
    summary: "Update user profile",
    description: "Update user profile information including name, email, and phone number. Must provide password to change email.",
    body: {
        type: "object",
        required: [],
        properties: {
            fullName: { type: "string", minLength: 2, description: "Full name of the user" },
            email: { type: "string", format: "email", description: "Email address (requires password)" },
            password: { type: "string", minLength: 6, description: "Current password (required if changing email)" },
        },
        additionalProperties: false,
        minProperties: 1
    },
    response: {
        200: {
            description: "Profile updated successfully",
            type: "object",
            required: ["success", "data", "message"],
            properties: {
                success: { type: "boolean", description: "Operation success status" },
                data: {
                    type: "object",
                    description: "Updated profile data",
                    required: ["fullName", "email"],
                    properties: {
                        fullName: { type: "string", description: "Updated full name" },
                        email: { type: "string", description: "Updated email address" },
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
                message: { type: "string", description: "Error message describing validation failure" }
            }
        },
        401: {
            description: "Unauthorized or incorrect password",
            type: "object",
            properties: {
                success: { type: "boolean" },
                message: { type: "string" }
            }
        },
        404: {
            description: "User not found",
            type: "object",
            properties: {
                success: { type: "boolean" },
                message: { type: "string" }
            }
        }
    }
};

export const updatePasswordSchema = {
    tags: ["Profile"],
    summary: "Update password",
    description: "Change user password with current password verification",
    body: {
        type: "object",
        required: ["currentPassword", "newPassword"],
        properties: {
            currentPassword: { type: "string", description: "Current password for verification" },
            newPassword: { type: "string", minLength: 6, description: "New password (minimum 6 characters)" }
        },
        additionalProperties: false
    },
    response: {
        200: {
            description: "Password updated successfully",
            type: "object",
            properties: {
                success: { type: "boolean", description: "Operation success status" },
                message: { type: "string", description: "Success message" }
            }
        },
        400: {
            description: "Invalid password format",
            type: "object",
            properties: {
                success: { type: "boolean" },
                message: { type: "string" }
            }
        },
        401: {
            description: "Current password is incorrect",
            type: "object",
            properties: {
                success: { type: "boolean" },
                message: { type: "string" }
            }
        }
    }
};

export const updatePreferenceSchema = {
    tags: ["Profile"],
    summary: "Update food preference",
    description: "Update user's food preference",
    body: {
        type: "object",
        required: ["foodPreference"],
        properties: {
            foodPreference: { type: "integer", minimum: 1, description: "Food preference ID" }
        },
        additionalProperties: false
    },
    response: {
        200: {
            description: "Food preference updated successfully",
            type: "object",
            properties: {
                success: { type: "boolean" },
                message: { type: "string" }
            }
        }
    }
};

export const updatePhoneNumberSchema = {
    tags: ["Profile"],
    summary: "Update phone number",
    description: "Update user's phone number",
    body: {
        type: "object",
        required: ["phoneNumber"],
        properties: {
            phoneNumber: { type: "string", minLength: 10, maxLength: 20, description: "New phone number" }
        },
        additionalProperties: false
    },
    response: {
        200: {
            description: "Phone number updated successfully",
            type: "object",
            properties: {
                success: { type: "boolean" },
                data: {
                    type: "object",
                    description: "Updated phone number",
                    properties: {
                        phoneNumber: { type: "string", description: "Updated phone number" }
                    }
                },
                message: { type: "string" }
            }
        }
    }
};

export const getUserProfileSchema = {
    tags: ["Profile"],
    summary: "Get user profile",
    description: "Retrieve current user's profile information",
    response: {
        200: {
            description: "User profile retrieved successfully",
            type: "object",
            properties: {
                success: { type: "boolean" },
                data: {
                    type: "object",
                    properties: {
                        id: { type: "string" },
                        fullName: { type: "string" },
                        email: { type: "string" },
                        phoneNumber: { type: "string" },
                        role: { type: "string" },
                        avatar: { type: "string" },
                        createdAt: { type: "string", format: "date-time" }
                    }
                }
            }
        }
    }
};

export const getAvatarSchema = {
    tags: ["Profile"],
    summary: "Get user avatar",
    description: "Download user's profile avatar image",
    response: {
        200: {
            type: "object",
            properties: {
                success: { type: "boolean" },
                data: {
                    type: "object",
                    properties: {
                        avatarUrl: { type: "string" }
                    }
                }
            }
        }
    }
};

export const updateAvatarSchema = {
    tags: ["Profile"],
    summary: "Update user avatar",
    description: "Upload and update user's profile avatar image (multipart/form-data)",
    consumes: ["multipart/form-data"],
    response: {
        200: {
            description: "Avatar updated successfully",
            type: "object",
            properties: {
                success: { type: "boolean" },
                message: { type: "string" }
            }
        },
        400: {
            description: "Invalid or missing file",
            type: "object",
            properties: {
                success: { type: "boolean" },
                message: { type: "string" }
            }
        }
    }
};
