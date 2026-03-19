export const registerSchema = {
    body: {
        type: "object",
        required: ["fullName", "email", "password"],
        properties: {
            fullName: { type: "string", minLength: 2 },
            email: { type: "string", format: "email" },
            password: { type: "string", minLength: 6 }
        },
        additionalProperties: false
    }
};

export const loginSchema = {
    body: {
        type: "object",
        required: ["email", "password"],
        properties: {
            email: { type: "string", format: "email" },
            password: { type: "string" }
        },
        additionalProperties: false
    }
};

export const refreshTokenSchema = {
    body: {
        type: "object",
        required: ["refreshToken"],
        properties: {
            refreshToken: { type: "string" }
        },
        additionalProperties: false
    }
};