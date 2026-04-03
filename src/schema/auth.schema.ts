export const registerSchema = {
    body: {
        type: "object",
        required: ["fullName", "email", "password", "phoneNumber"],
        properties: {
            fullName: { type: "string", minLength: 2 },
            email: { type: "string", format: "email" },
            password: { type: "string", minLength: 6 },
            phoneNumber: { type: "string", minLength: 10, maxLength: 20 }
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

export const updatePhoneNumberSchema = {
    body: {
        type: "object",
        required: ["phoneNumber"],
        properties: {
            phoneNumber: { type: "string", minLength: 10, maxLength: 20 }
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

export const otpSchema = {
    body: {
        type: "object",
        required: ["email", "code"],
        properties: {
            email: { type: "string", format: "email" },
            code: { type: "string", minLength: 6, maxLength: 6 }
        },
        additionalProperties: false
    }
};

export const resendOtpSchema = {
    body: {
        type: "object",
        required: ["email"],
        properties: {
            email: { type: "string", format: "email" }
        },
        additionalProperties: false
    }
};

export const googleCallbackSchema = {
    querystring: {
        type: "object",
        required: ["code"],
        properties: {
            code: { type: "string" },
            state: { type: "string" }
        },
        additionalProperties: false
    }
};