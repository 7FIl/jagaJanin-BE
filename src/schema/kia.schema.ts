
export const saveFacilityCheckupSchema = {
	body: {
		type: "object",
		required: [],
		properties: {
			facilityName: { type: "string" },
			doctorName: { type: "string" },
			controlDate: { type: "string", format: "date-time" }
		},
		anyOf: [
			{ required: ["facilityName"] },
			{ required: ["doctorName"] },
			{ required: ["controlDate"] }
		],
		additionalProperties: false
	}
};

export const savePhysicalCheckupSchema = {
	body: {
		type: "object",
		required: [],
		properties: {
			bloodPressure: { type: "string" },
			weight: { type: "number", minimum: 0 },
			height: { type: "number", minimum: 0 },
			fundalHeight: { type: "number", minimum: 0 },
			lila: { type: "integer", minimum: 0 },
			bloodType: { type: "string" },
			bloodSugar: { type: "integer", minimum: 0 },
			urineProtein: { type: "string" }
		},
		anyOf: [
			{ required: ["bloodPressure"] },
			{ required: ["weight"] },
			{ required: ["height"] },
			{ required: ["fundalHeight"] },
			{ required: ["lila"] },
			{ required: ["bloodType"] },
			{ required: ["bloodSugar"] },
			{ required: ["urineProtein"] }
		],
		additionalProperties: false
	}
};

export const saveChecklistSchema = {
	body: {
		type: "object",
		required: [],
		properties: {
			fetalHeartbeat: { type: "boolean" },
			counseling: { type: "boolean" },
			tetanusImmunization: { type: "boolean" },
			healthScreening: { type: "boolean" },
			ironSuplement: { type: "boolean" },
			ppia: { type: "boolean" },
			isCompleted: { type: "boolean" }
		},
		anyOf: [
			{ required: ["fetalHeartbeat"] },
			{ required: ["counseling"] },
			{ required: ["tetanusImmunization"] },
			{ required: ["healthScreening"] },
			{ required: ["ironSuplement"] },
			{ required: ["ppia"] },
			{ required: ["isCompleted"] }
		],
		additionalProperties: false
	}
};

export const saveLabSchema = {
	body: {
		type: "object",
		required: [],
		properties: {
			hemoglobin: { type: "number", minimum: 0 },
			bloodType: { type: "string" },
			bloodSugar: { type: "integer", minimum: 0 },
			urineProtein: { type: "string" }
		},
		anyOf: [
			{ required: ["hemoglobin"] },
			{ required: ["bloodType"] },
			{ required: ["bloodSugar"] },
			{ required: ["urineProtein"] }
		],
		additionalProperties: false
	}
};

export const saveHphtSchema = {
	body: {
		type: "object",
		required: ["hpht"],
		properties: {
			hpht: { type: "string", format: "date-time" }
		},
		additionalProperties: false
	}
};
