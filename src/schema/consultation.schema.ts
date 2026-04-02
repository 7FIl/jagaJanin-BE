export const getDoctorProfileSchema = {
    params: {
        type: "object",
        required: ["doctorUserId"],
        properties: {
            doctorUserId: { type: "string" }
        },
        additionalProperties: false
    }
};

export const bookConsultationSchema = {
    body: {
        type: "object",
        required: ["doctorId", "startTime", "endTime"],
        properties: {
            doctorId: { type: "string" },
            startTime: { type: "string", format: "date-time" },
            endTime: { type: "string", format: "date-time" }
        },
        additionalProperties: false
    }
};

export const giveRatingSchema = {
    body: {
        type: "object",
        required: ["consultationId", "ratingValue"],
        properties: {
            consultationId: { type: "string" },
            ratingValue: { type: "number", minimum: 1, maximum: 5 }
        },
        additionalProperties: false
    }
};

export const getPaymentConfirmationSchema = {
    params: {
        type: "object",
        required: ["consultationId"],
        properties: {
            consultationId: { type: "string" }
        },
        additionalProperties: false
    }
};
