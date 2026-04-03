export const createPaymentSchema = {
    body: {
        type: "object",
        required: ["consultationId"],
        properties: {
            consultationId: { type: "string" }
        },
        additionalProperties: false
    }
};

export const checkPaymentStatusSchema = {
    params: {
        type: "object",
        required: ["invoiceId"],
        properties: {
            invoiceId: { type: "string" }
        },
        additionalProperties: false
    }
};

export const handlePaymentWebhookSchema = {
    body: {
        type: "object",
        required: ["id", "status", "externalId"],
        properties: {
            id: { type: "string" },
            status: { type: "string", enum: ["paid", "pending", "expired", "expired_confirmed"] },
            externalId: { type: "string" }
        },
        additionalProperties: false
    },
    headers: {
        type: "object",
        required: ["x-callback-token"],
        properties: {
            "x-callback-token": { type: "string" }
        }
    }
};
