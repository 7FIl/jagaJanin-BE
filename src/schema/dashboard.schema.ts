export const getMealLogsSchema = {
	querystring: {
		type: "object",
		required: ["date"],
		properties: {
			date: { type: "string", pattern: "^\\d{2}-\\d{2}-\\d{4}$" }
		},
		additionalProperties: false
	}
};

export const createMealLogSchema = {
	body: {
		type: "object",
		required: ["foodId", "quantity", "date"],
		properties: {
			foodId: { type: "integer", minimum: 1 },
			quantity: { type: "integer", minimum: 1 },
			date: { type: "string", pattern: "^\\d{2}-\\d{2}-\\d{4}$" }
		},
		additionalProperties: false
	}
};

export const updateMealLogSchema = {
	body: {
		type: "object",
		required: [],
		properties: {
			foodId: { type: "integer", minimum: 1 },
			quantity: { type: "integer", minimum: 1 }
		},
		anyOf: [
			{ required: ["foodId"] },
			{ required: ["quantity"] }
		],
		additionalProperties: false
	}
};

export const deleteMealLogsByDateSchema = {
	querystring: {
		type: "object",
		required: ["date"],
		properties: {
			date: { type: "string", pattern: "^\\d{2}-\\d{2}-\\d{4}$" }
		},
		additionalProperties: false
	}
};
