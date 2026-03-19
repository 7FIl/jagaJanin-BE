export const onboardingFormSchema = {
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
			foodPreference: { type: "integer", minimum: 1 },
			activityLevel: { type: "integer", minimum: 1 },
			weeks: { type: "integer", minimum: 1, maximum: 45 },
			height: { type: "number", exclusiveMinimum: 0 },
			weight: { type: "number", exclusiveMinimum: 0 },
			age: { type: "integer", minimum: 10, maximum: 65 },
			mealPerDay: { type: "integer", minimum: 1, maximum: 12 },
		},
		additionalProperties: false
	}
};
