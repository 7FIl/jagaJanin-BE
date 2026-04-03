export const createPaymentSchema = {
    tags: ["Payment"],
    summary: "Create payment invoice",
    description: "Create a payment invoice for a consultation. Returns Xendit payment URL.",
    body: {
        type: "object",
        required: ["consultationId"],
        properties: {
            consultationId: { type: "string", description: "Consultation ID to pay for" }
        },
        additionalProperties: false
    },
    response: {
        201: {
            description: "Payment invoice created successfully",
            type: "object",
            properties: {
                success: { type: "boolean", description: "Operation success status" },
                data: {
                    type: "object",
                    description: "Payment invoice details",
                    properties: {
                        invoiceId: { type: "string", description: "Xendit invoice ID" },
                        invoiceUrl: { type: "string", description: "Payment URL (direct to payment gateway)" },
                        amount: { type: "number", description: "Total amount including platform fee in IDR" },
                        expiryDate: { type: "string", format: "date-time", description: "Invoice expiration timestamp" },
                        status: { type: "string", description: "Invoice status" }
                    }
                },
                message: { type: "string", description: "Success message" }
            }
        },
        400: {
            description: "Invalid consultation ID or consultation not found",
            type: "object",
            properties: {
                success: { type: "boolean" },
                message: { type: "string" }
            }
        },
        500: {
            description: "Server error - payment gateway failure",
            type: "object",
            properties: {
                success: { type: "boolean" },
                message: { type: "string", description: "Error creating invoice" }
            }
        }
    }
};

export const checkPaymentStatusSchema = {
    tags: ["Payment"],
    summary: "Check payment status",
    description: "Check the payment status of an invoice from the payment gateway",
    params: {
        type: "object",
        required: ["invoiceId"],
        properties: {
            invoiceId: { type: "string", description: "Xendit invoice ID to check status" }
        },
        additionalProperties: false
    },
    response: {
        200: {
            description: "Payment status retrieved successfully",
            type: "object",
            properties: {
                success: { type: "boolean", description: "Operation success status" },
                data: {
                    type: "object",
                    description: "Payment status information",
                    properties: {
                        status: { type: "string", enum: ["PAID", "PENDING", "EXPIRED"], description: "Current payment status" },
                        consultationId: { type: "string", description: "Associated consultation ID" }
                    }
                },
                message: { type: "string", description: "Success message" }
            }
        },
        404: {
            description: "Invoice not found",
            type: "object",
            properties: {
                success: { type: "boolean" },
                message: { type: "string" }
            }
        },
        500: {
            description: "Payment gateway error",
            type: "object",
            properties: {
                success: { type: "boolean" },
                message: { type: "string" }
            }
        }
    }
};

export const handlePaymentWebhookSchema = {
    tags: ["Payment"],
    summary: "Handle payment webhook",
    description: "Webhook endpoint for payment provider callbacks (Xendit). Processes payment confirmations and updates consultation status.",
    body: {
        type: "object",
        required: ["id", "status", "external_id"],
        properties: {
            id: { type: "string", description: "Xendit callback event ID" },
            status: { type: "string", description: "Payment status update" },
            external_id: { type: "string", description: "External ID from Xendit (invoice ID)" },
            paidAmount: { type: "number", description: "Amount actually paid in IDR" },
            paymentMethod: { type: "string", description: "Payment method used (e.g., BANK_TRANSFER, CARD, E_WALLET)" },
            paidAt: { type: "string", format: "date-time", description: "Payment timestamp" }
        },
        additionalProperties: true
    },
    headers: {
        type: "object",
        required: ["x-callback-token"],
        properties: {
            "x-callback-token": { type: "string", description: "Webhook security token to verify authenticity" }
        }
    },
    response: {
        200: {
            description: "Webhook processed successfully and consultation status updated",
            type: "object",
            properties: {
                success: { type: "boolean", description: "Operation success status" },
                message: { type: "string", description: "Success message" }
            }
        },
        401: {
            description: "Invalid or missing webhook token",
            type: "object",
            properties: {
                success: { type: "boolean" },
                message: { type: "string" }
            }
        },
        404: {
            description: "Payment record not found for the external ID",
            type: "object",
            properties: {
                success: { type: "boolean" },
                message: { type: "string" }
            }
        },
        500: {
            description: "Server error processing webhook",
            type: "object",
            properties: {
                success: { type: "boolean" },
                message: { type: "string" }
            }
        }
    }
};

export const getPaymentHistorySchema = {
    tags: ["Payment"],
    summary: "Get payment history",
    description: "Retrieve the payment history and transaction records for the authenticated user",
    response: {
        200: {
            description: "Payment history retrieved successfully",
            type: "object",
            properties: {
                success: { type: "boolean", description: "Operation success status" },
                data: {
                    type: "array",
                    description: "List of payment transactions",
                    items: {
                        type: "object",
                        properties: {
                            id: { type: "string", description: "Payment record unique identifier" },
                            amount: { type: "number", description: "Transaction amount in IDR" },
                            status: { type: "string", description: "Payment status (pending, paid, expired)" },
                            createdAt: { type: "string", format: "date-time", description: "Payment creation timestamp" }
                        }
                    }
                },
                message: { type: "string", description: "Success message" }
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
            description: "Server error retrieving payment history",
            type: "object",
            properties: {
                success: { type: "boolean" },
                message: { type: "string" }
            }
        }
    }
};
