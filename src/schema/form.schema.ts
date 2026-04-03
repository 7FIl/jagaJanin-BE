export const onboardingFormSchema = {
	tags: ["Forms"],
	summary: "Submit onboarding form",
	description: "Submit pregnancy onboarding form with health, dietary, and preference information",
	body: {
		type: "object",
		required: [
			"foodPreference",
			"activityLevel",
			"weeks",
			"height",
			"weight",
			"age",
			"mealPerDay",
		],
		properties: {
			foodPreference: { type: "integer", minimum: 1, description: "Food preference category ID" },
			activityLevel: { type: "integer", minimum: 1, maximum: 5, description: "Activity level (1=very low, 5=very high)" },
			weeks: { type: "integer", minimum: 1, maximum: 45, description: "Current pregnancy weeks (1-45)" },
			height: { type: "number", exclusiveMinimum: 0, description: "Height in centimeters" },
			weight: { type: "number", exclusiveMinimum: 0, description: "Current weight in kilograms" },
			age: { type: "integer", minimum: 10, maximum: 65, description: "User age in years" },
			mealPerDay: { type: "integer", minimum: 1, maximum: 12, description: "Preferred number of meals per day" },
		},
		additionalProperties: false
	},
	response: {
		201: {
			description: "Onboarding form submitted successfully",
			type: "object",
			properties: {
				success: { type: "boolean", description: "Operation success status" },
				data: {
					type: "object",
					description: "Submitted form data with confirmation",
					properties: {
						id: { type: "string", description: "Form submission unique identifier" },
						userId: { type: "string", description: "User unique identifier" },
						foodPreference: { type: "integer", description: "Submitted food preference ID" },
						activityLevel: { type: "integer", description: "Submitted activity level" },
						pregnancyWeeks: { type: "integer", description: "Recorded pregnancy weeks" },
						height: { type: "number", description: "Recorded height in cm" },
						weight: { type: "number", description: "Recorded weight in kg" },
						age: { type: "integer", description: "Recorded age" },
						mealsPerDay: { type: "integer", description: "Recorded meals per day" },
						bmi: { type: "number", description: "Calculated BMI" },
						submittedAt: { type: "string", format: "date-time", description: "Submission timestamp" }
					}
				},
				message: { type: "string", description: "Success message indicating onboarding completion" }
			}
		},
		400: {
			description: "Invalid form data - validation error or missing required fields",
			type: "object",
			properties: {
				success: { type: "boolean" },
				message: { type: "string", description: "Error message explaining validation failure" }
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
			description: "Server error during form submission",
			type: "object",
			properties: {
				success: { type: "boolean" },
				message: { type: "string" }
			}
		}
	}
};

