export const updateUserProfileSchema = {
    body: {
        type: "object",
        properties: {
            fullName: { type: "string", minLength: 2 },
            email: { type: "string", format: "email" },
            password: { type: "string", minLength: 6 }
        },
        additionalProperties: false,
        minProperties: 1
    }
};

export const updatePasswordSchema = {
    body: {
        type: "object",
        required: ["currentPassword", "newPassword"],
        properties: {
            currentPassword: { type: "string" },
            newPassword: { type: "string", minLength: 6 }
        },
        additionalProperties: false
    }
};

export const updatePreferenceSchema = {
    body: {
        type: "object",
        required: ["foodPreference"],
        properties: {
            foodPreference: { type: "integer", minimum: 1 }
        },
        additionalProperties: false
    }
};
