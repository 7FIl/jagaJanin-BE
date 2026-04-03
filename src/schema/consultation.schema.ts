export const getDoctorRecommendationsSchema = {
    tags: ["Consultation"],
    summary: "Get recommended doctors",
    description: "Get list of recommended doctors based on user preferences and ratings, with pagination support",
    querystring: {
        type: "object",
        properties: {
            page: { type: "string", pattern: "^[0-9]+$", description: "Page number (default: 1)" },
            limit: { type: "string", pattern: "^[0-9]+$", description: "Items per page (default: 5)" }
        },
        additionalProperties: false
    },
    response: {
        200: {
            description: "Recommended doctors list retrieved successfully",
            type: "object",
            properties: {
                success: { type: "boolean", description: "Operation success status" },
                data: {
                    type: "object",
                    description: "Paginated list of recommended doctors",
                    properties: {
                        data: {
                            type: "array",
                            description: "List of recommended doctors",
                            items: {
                                type: "object",
                                properties: {
                                    name: { type: "string", description: "Doctor full name" },
                                    specialty: { type: "string", description: "Medical specialty" },
                                    experience: { type: "integer", description: "Years of experience" },
                                    fee: { type: "number", description: "Fee per consultation in IDR" },
                                    rating: { type: "string", description: "Average rating (0-5 stars)" }
                                }
                            }
                        },
                        pagination: {
                            type: "object",
                            description: "Pagination metadata",
                            properties: {
                                page: { type: "integer", description: "Current page number" },
                                limit: { type: "integer", description: "Items per page" },
                                total: { type: "integer", description: "Total number of doctors" },
                                totalPages: { type: "integer", description: "Total number of pages" }
                            }
                        }
                    }
                },
                message: { type: "string", description: "Success message" }
            }
        },
        400: {
            description: "Bad request or invalid pagination parameters",
            type: "object",
            properties: {
                success: { type: "boolean" },
                message: { type: "string" }
            }
        }
    }
};

export const getDoctorProfileSchema = {
    tags: ["Consultation"],
    summary: "Get doctor profile",
    description: "Get detailed profile of a specific doctor including credentials and availability",
    params: {
        type: "object",
        required: ["doctorId"],
        properties: {
            doctorId: { type: "string", description: "Doctor profile ID" }
        },
        additionalProperties: false
    },
    response: {
        200: {
            description: "Doctor profile details retrieved successfully",
            type: "object",
            properties: {
                success: { type: "boolean", description: "Operation success status" },
                data: {
                    type: "object",
                    description: "Doctor profile information",
                    properties: {
                        id: { type: "string", description: "Doctor unique identifier" },
                        name: { type: "string", description: "Doctor full name" },
                        specialty: { type: "string", description: "Medical specialty" },
                        workPlace: { type: "string", description: "Primary workplace" },
                        experience: { type: "integer", description: "Years of experience" },
                        patients: { type: "integer", description: "Total number of patients" },
                        rating: { type: "string", description: "Average rating from consultations" },
                        about: { type: "string", description: "Professional bio/about section" },
                        consultationFee: { type: "number", description: "Fee per consultation in IDR" },
                        practiceSchedule: {
                            type: "array",
                            description: "Weekly availability schedule",
                            items: {
                                type: "object",
                                properties: {
                                    startDay: { type: "string", description: "Schedule start day" },
                                    endDay: { type: "string", description: "Schedule end day" },
                                    startTime: { type: "string", description: "Daily start time" },
                                    endTime: { type: "string", description: "Daily end time" },
                                    session: { type: "string", description: "Session type" }
                                }
                            }
                        }
                    }
                },
                message: { type: "string", description: "Success message" }
            }
        },
        404: {
            description: "Doctor not found",
            type: "object",
            properties: {
                success: { type: "boolean" },
                message: { type: "string" }
            }
        },
        400: {
            description: "Bad request",
            type: "object",
            properties: {
                success: { type: "boolean" },
                message: { type: "string" }
            }
        }
    }
};

export const getConsultationHistorySchema = {
    tags: ["Consultation"],
    summary: "Get consultation history",
    description: "Get user's consultation history separated into completed and upcoming consultations with pagination",
    querystring: {
        type: "object",
        properties: {
            page: { type: "string", pattern: "^[0-9]+$", description: "Page number (default: 1)" },
            limit: { type: "string", pattern: "^[0-9]+$", description: "Items per page (default: 5)" }
        },
        additionalProperties: false
    },
    response: {
        200: {
            description: "Consultation history retrieved successfully",
            type: "object",
            properties: {
                success: { type: "boolean", description: "Operation success status" },
                data: {
                    type: "object",
                    description: "Consultation history separated by status",
                    properties: {
                        done: {
                            type: "object",
                            description: "Completed consultations",
                            properties: {
                                data: {
                                    type: "array",
                                    description: "List of completed consultations",
                                    items: {
                                        type: "object",
                                        properties: {
                                            id: { type: "string", description: "Consultation unique identifier" },
                                            doctorName: { type: "string", description: "Doctor full name" },
                                            date: { type: "string", format: "date", description: "Consultation date" },
                                            time: { type: "string", description: "Consultation start time" },
                                            isDone: { type: "boolean", description: "Consultation status" },
                                            isDoneRating: { type: "boolean", description: "Whether user has rated this consultation" }
                                        }
                                    }
                                },
                                pagination: {
                                    type: "object",
                                    description: "Pagination info",
                                    properties: {
                                        page: { type: "integer", description: "Current page" },
                                        limit: { type: "integer", description: "Items per page" },
                                        total: { type: "integer", description: "Total completed consultations" },
                                        totalPages: { type: "integer", description: "Total number of pages" }
                                    }
                                }
                            }
                        },
                        upcoming: {
                            type: "object",
                            description: "Upcoming consultations",
                            properties: {
                                data: {
                                    type: "array",
                                    description: "List of upcoming consultations",
                                    items: {
                                        type: "object",
                                        properties: {
                                            id: { type: "string", description: "Consultation unique identifier" },
                                            doctorName: { type: "string", description: "Doctor full name" },
                                            date: { type: "string", format: "date", description: "Consultation date" },
                                            time: { type: "string", description: "Consultation start time" },
                                            isTimeToConsult: { type: "boolean", description: "Whether it's time to start the consultation" }
                                        }
                                    }
                                },
                                pagination: {
                                    type: "object",
                                    description: "Pagination info",
                                    properties: {
                                        page: { type: "integer", description: "Current page" },
                                        limit: { type: "integer", description: "Items per page" },
                                        total: { type: "integer", description: "Total upcoming consultations" },
                                        totalPages: { type: "integer", description: "Total number of pages" }
                                    }
                                }
                            }
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
        400: {
            description: "Bad request or invalid pagination parameters",
            type: "object",
            properties: {
                success: { type: "boolean" },
                message: { type: "string" }
            }
        }
    }
};

export const getConsultationDataSchema = {
    tags: ["Consultation"],
    summary: "Get consultation data",
    description: "Get next scheduled consultation and recommended doctors list",
    response: {
        200: {
            description: "Consultation data retrieved successfully",
            type: "object",
            properties: {
                success: { type: "boolean", description: "Operation success status" },
                data: {
                    type: "object",
                    description: "Consultation data with schedule and recommendations",
                    properties: {
                        consulationSchedule: {
                            type: "object",
                            description: "Next scheduled consultation",
                            properties: {
                                id: { type: "string", description: "Consultation ID" },
                                date: { type: "string", format: "date", description: "Consultation date" },
                                doctorName: { type: "string", description: "Doctor name" }
                            }
                        },
                        doctorRecomendation: {
                            type: "object",
                            description: "Recommended doctors list",
                            properties: {
                                doctors: {
                                    type: "array",
                                    description: "List of recommended doctors",
                                    items: {
                                        type: "object",
                                        properties: {
                                            name: { type: "string", description: "Doctor full name" },
                                            specialty: { type: "string", description: "Medical specialty" },
                                            experience: { type: "integer", description: "Years of experience" },
                                            fee: { type: "number", description: "Consultation fee in IDR" },
                                            rating: { type: "string", description: "Average rating" }
                                        }
                                    }
                                }
                            }
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
        400: {
            description: "Bad request or user data missing",
            type: "object",
            properties: {
                success: { type: "boolean" },
                message: { type: "string" }
            }
        }
    }
};

export const bookConsultationSchema = {
    tags: ["Consultation"],
    summary: "Book a consultation",
    description: "Schedule a new consultation with a doctor at a specific time",
    body: {
        type: "object",
        required: ["doctorId", "startTime", "endTime"],
        properties: {
            doctorId: { type: "string", description: "Doctor unique identifier" },
            startTime: { type: "string", format: "date-time", description: "Consultation start time (ISO 8601 format)" },
            endTime: { type: "string", format: "date-time", description: "Consultation end time (ISO 8601 format)" }
        },
        additionalProperties: false
    },
    response: {
        201: {
            description: "Consultation booked successfully",
            type: "object",
            properties: {
                success: { type: "boolean", description: "Operation success status" },
                data: {
                    type: "object",
                    description: "Booking confirmation details",
                    properties: {
                        consultationId: { type: "string", description: "New consultation unique identifier" }
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
        400: {
            description: "Bad request - invalid time, doctor unavailable, or other validation error",
            type: "object",
            properties: {
                success: { type: "boolean" },
                message: { type: "string", description: "Error message explaining the issue" }
            }
        }
    }
};

export const giveRatingSchema = {
    tags: ["Consultation"],
    summary: "Rate a consultation",
    description: "Rate a completed consultation with star rating and optional comment",
    body: {
        type: "object",
        required: ["consultationId", "ratingValue"],
        properties: {
            consultationId: { type: "string", description: "Consultation unique identifier" },
            ratingValue: { type: "number", minimum: 1, maximum: 5, description: "Star rating from 1 to 5" },
            comment: { type: "string", description: "Optional written feedback/review" }
        },
        additionalProperties: false
    },
    response: {
        200: {
            description: "Rating submitted successfully",
            type: "object",
            properties: {
                success: { type: "boolean", description: "Operation success status" },
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
        400: {
            description: "Bad request - invalid rating value or consultation not found",
            type: "object",
            properties: {
                success: { type: "boolean" },
                message: { type: "string" }
            }
        },
        404: {
            description: "Consultation not found or not authorized for this consultation",
            type: "object",
            properties: {
                success: { type: "boolean" },
                message: { type: "string" }
            }
        }
    }
};

export const getPaymentConfirmationSchema = {
    tags: ["Consultation"],
    summary: "Get payment confirmation",
    description: "Get payment confirmation and fee details for a consultation",
    params: {
        type: "object",
        required: ["consultationId"],
        properties: {
            consultationId: { type: "string", description: "Consultation unique identifier" }
        },
        additionalProperties: false
    },
    response: {
        200: {
            description: "Payment confirmation details retrieved successfully",
            type: "object",
            properties: {
                success: { type: "boolean", description: "Operation success status" },
                data: {
                    type: "object",
                    description: "Payment and fee information",
                    properties: {
                        doctorName: { type: "string", description: "Doctor name" },
                        specialty: { type: "string", description: "Doctor specialty" },
                        date: { type: "string", format: "date", description: "Consultation date" },
                        time: { type: "string", description: "Consultation time" },
                        doctorFee: { type: "number", description: "Doctor consultation fee in IDR" },
                        platformFee: { type: "number", description: "Platform service fee in IDR" },
                        totalFee: { type: "number", description: "Total fee to be paid in IDR" },
                        paymentMethod: {
                            type: "array",
                            description: "Available payment methods",
                            items: { type: "string" }
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
        404: {
            description: "Consultation not found or payment not found",
            type: "object",
            properties: {
                success: { type: "boolean" },
                message: { type: "string" }
            }
        },
        400: {
            description: "Bad request - invalid consultation ID",
            type: "object",
            properties: {
                success: { type: "boolean" },
                message: { type: "string" }
            }
        }
    }
};

export const callDoctorSchema = {
    tags: ["Consultation"],
    summary: "Call doctor for consultation",
    description: "Initiate a consultation call with doctor via WhatsApp (must have active scheduled consultation)",
    response: {
        200: {
            description: "Consultation call link retrieved successfully",
            type: "object",
            properties: {
                success: { type: "boolean", description: "Operation success status" },
                data: {
                    type: "object",
                    description: "Call link details",
                    properties: {
                        link: { type: "string", format: "uri", description: "WhatsApp call link" }
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
        400: {
            description: "Bad request - no active consultation or consultation not yet started",
            type: "object",
            properties: {
                success: { type: "boolean" },
                message: { type: "string", description: "Error message explaining why call cannot be initiated" }
            }
        },
        404: {
            description: "Active consultation not found",
            type: "object",
            properties: {
                success: { type: "boolean" },
                message: { type: "string" }
            }
        }
    }
};
