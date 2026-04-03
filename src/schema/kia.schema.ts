
export const saveFacilityCheckupSchema = {
	tags: ["KIA - Pregnancy Tracking"],
	summary: "Save facility checkup data",
	description: "Record facility/clinic checkup details during pregnancy",
	body: {
		type: "object",
		required: [],
		properties: {
			facilityName: { type: "string", description: "Name of healthcare facility" },
			doctorName: { type: "string", description: "Name of attending doctor" },
			controlDate: { type: "string", format: "date-time", description: "Date of checkup" }
		},
		anyOf: [
			{ required: ["facilityName"] },
			{ required: ["doctorName"] },
			{ required: ["controlDate"] }
		],
		additionalProperties: false
	},
	response: {
		201: {
			description: "Facility checkup saved successfully",
			type: "object",
			properties: {
				success: { type: "boolean", description: "Operation success status" },
				data: {
					type: "object",
					description: "Saved facility checkup record",
					properties: {
						id: { type: "string", description: "Record unique identifier" },
						facilityName: { type: "string" },
						doctorName: { type: "string" },
						controlDate: { type: "string", format: "date-time" },
						recordedAt: { type: "string", format: "date-time", description: "When the record was created" }
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
			description: "Invalid request data",
			type: "object",
			properties: {
				success: { type: "boolean" },
				message: { type: "string" }
			}
		}
	}
};

export const savePhysicalCheckupSchema = {
	tags: ["KIA - Pregnancy Tracking"],
	summary: "Save physical checkup results",
	description: "Record physical examination results (vital signs, measurements)",
	body: {
		type: "object",
		required: [],
		properties: {
			bloodPressure: { type: "string", description: "Blood pressure (e.g., 120/80)" },
			weight: { type: "number", minimum: 0, description: "Weight in kg" },
			height: { type: "number", minimum: 0, description: "Height in cm" },
			fundalHeight: { type: "number", minimum: 0, description: "Fundal height in cm" },
			lila: { type: "integer", minimum: 0, description: "LILA (Lingkar Lengan Atas) in cm" },
			bloodType: { type: "string", description: "Blood type" },
			bloodSugar: { type: "integer", minimum: 0, description: "Blood sugar level" },
			urineProtein: { type: "string", description: "Urine protein level" }
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
	},
	response: {
		201: {
			description: "Physical checkup data saved successfully",
			type: "object",
			properties: {
				success: { type: "boolean", description: "Operation success status" },
				data: {
					type: "object",
					description: "Saved physical checkup record",
					properties: {
						id: { type: "string", description: "Record unique identifier" },
						bloodPressure: { type: "string" },
						weight: { type: "number" },
						height: { type: "number" },
						fundalHeight: { type: "number" },
						lila: { type: "integer" },
						bloodType: { type: "string" },
						bloodSugar: { type: "integer" },
						urineProtein: { type: "string" },
						recordedAt: { type: "string", format: "date-time", description: "When the record was created" }
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
			description: "Invalid request data",
			type: "object",
			properties: {
				success: { type: "boolean" },
				message: { type: "string" }
			}
		}
	}
};

export const saveChecklistSchema = {
	tags: ["KIA - Pregnancy Tracking"],
	summary: "Save pregnancy care checklist",
	description: "Record completed pregnancy care activities and services",
	body: {
		type: "object",
		required: [],
		properties: {
			fetalHeartbeat: { type: "boolean", description: "Fetal heartbeat checked" },
			counseling: { type: "boolean", description: "Counseling provided" },
			tetanusImmunization: { type: "boolean", description: "Tetanus immunization given" },
			healthScreening: { type: "boolean", description: "Health screening completed" },
			ironSuplement: { type: "boolean", description: "Iron supplement provided" },
			ppia: { type: "boolean", description: "PPIA (Pemberian dan Penyuluhan) completed" },
			isCompleted: { type: "boolean", description: "Checklist fully completed" }
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
	},
	response: {
		201: {
			description: "Checklist saved successfully",
			type: "object",
			properties: {
				success: { type: "boolean", description: "Operation success status" },
				data: {
					type: "object",
					description: "Saved checklist record",
					properties: {
						id: { type: "string", description: "Record unique identifier" },
						fetalHeartbeat: { type: "boolean" },
						counseling: { type: "boolean" },
						tetanusImmunization: { type: "boolean" },
						healthScreening: { type: "boolean" },
						ironSuplement: { type: "boolean" },
						ppia: { type: "boolean" },
						isCompleted: { type: "boolean" },
						recordedAt: { type: "string", format: "date-time", description: "When the record was created" }
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
			description: "Invalid request data",
			type: "object",
			properties: {
				success: { type: "boolean" },
				message: { type: "string" }
			}
		}
	}
};

export const saveLabSchema = {
	tags: ["KIA - Pregnancy Tracking"],
	summary: "Save lab test results",
	description: "Record laboratory test results during pregnancy",
	body: {
		type: "object",
		required: [],
		properties: {
			hemoglobin: { type: "number", minimum: 0, description: "Hemoglobin level(g/dL)" },
			bloodType: { type: "string", description: "Blood type" },
			bloodSugar: { type: "integer", minimum: 0, description: "Blood sugar level (mg/dL)" },
			urineProtein: { type: "string", description: "Urine protein level" }
		},
		anyOf: [
			{ required: ["hemoglobin"] },
			{ required: ["bloodType"] },
			{ required: ["bloodSugar"] },
			{ required: ["urineProtein"] }
		],
		additionalProperties: false
	},
	response: {
		201: {
			description: "Lab results saved successfully",
			type: "object",
			properties: {
				success: { type: "boolean", description: "Operation success status" },
				data: {
					type: "object",
					description: "Saved lab test record",
					properties: {
						id: { type: "string", description: "Record unique identifier" },
						hemoglobin: { type: "number" },
						bloodType: { type: "string" },
						bloodSugar: { type: "integer" },
						urineProtein: { type: "string" },
						recordedAt: { type: "string", format: "date-time", description: "When the record was created" }
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
			description: "Invalid request data",
			type: "object",
			properties: {
				success: { type: "boolean" },
				message: { type: "string" }
			}
		}
	}
};

export const saveHphtSchema = {
	tags: ["KIA - Pregnancy Tracking"],
	summary: "Save HPHT (last menstrual period)",
	description: "Record the estimated delivery date based on last menstrual period",
	body: {
		type: "object",
		required: ["hpht"],
		properties: {
			hpht: { type: "string", format: "date-time", description: "Last menstrual period date" }
		},
		additionalProperties: false
	},
	response: {
		201: {
			description: "HPHT saved successfully",
			type: "object",
			properties: {
				success: { type: "boolean", description: "Operation success status" },
				data: {
					type: "object",
					description: "HPHT record status",
					properties: {
						saved: { type: "boolean", description: "Whether HPHT was successfully saved" },
						hpht: { type: "string", format: "date-time", description: "Recorded HPHT date" },
						estimatedDueDate: { type: "string", format: "date", description: "Calculated due date (280 days from HPHT)" }
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
			description: "Invalid date format",
			type: "object",
			properties: {
				success: { type: "boolean" },
				message: { type: "string" }
			}
		}
	}
};

export const getFullKiaDataSchema = {
	tags: ["KIA - Pregnancy Tracking"],
	summary: "Get all KIA data",
	description: "Retrieve all pregnancy tracking (KIA) data including checkups, tests, and checklist",
	response: {
		200: {
			description: "All KIA data retrieved successfully",
			type: "object",
			properties: {
				success: { type: "boolean", description: "Operation success status" },
				data: {
					type: "object",
					description: "Complete KIA pregnancy tracking data",
					properties: {
						facilityCheckup: {
							type: "array",
							description: "Facility/clinic checkup records",
							items: {
								type: "object",
								properties: {
									id: { type: "string" },
									facilityName: { type: "string" },
									doctorName: { type: "string" },
									controlDate: { type: "string", format: "date-time" },
									recordedAt: { type: "string", format: "date-time" }
								}
							}
						},
						physicalCheckup: {
							type: "array",
							description: "Physical examination records",
							items: {
								type: "object",
								properties: {
									id: { type: "string" },
									bloodPressure: { type: "string" },
									weight: { type: "number" },
									height: { type: "number" },
									fundalHeight: { type: "number" },
									lila: { type: "integer" },
									bloodType: { type: "string" },
									bloodSugar: { type: "integer" },
									urineProtein: { type: "string" },
									recordedAt: { type: "string", format: "date-time" }
								}
							}
						},
						checklist: {
							type: "array",
							description: "Care services checklist records",
							items: {
								type: "object",
								properties: {
									id: { type: "string" },
									fetalHeartbeat: { type: "boolean" },
									counseling: { type: "boolean" },
									tetanusImmunization: { type: "boolean" },
									healthScreening: { type: "boolean" },
									ironSuplement: { type: "boolean" },
									ppia: { type: "boolean" },
									isCompleted: { type: "boolean" },
									recordedAt: { type: "string", format: "date-time" }
								}
							}
						},
						lab: {
							type: "array",
							description: "Lab test results",
							items: {
								type: "object",
								properties: {
									id: { type: "string" },
									hemoglobin: { type: "number" },
									bloodType: { type: "string" },
									bloodSugar: { type: "integer" },
									urineProtein: { type: "string" },
									recordedAt: { type: "string", format: "date-time" }
								}
							}
						},
						hpht: { type: "string", format: "date", description: "Last menstrual period date" },
						pregnancyWeek: { type: "integer", description: "Current calculated pregnancy week" },
						estimatedDueDate: { type: "string", format: "date", description: "Estimated delivery date" }
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

export const getFacilityCheckupDataSchema = {
	tags: ["KIA - Pregnancy Tracking"],
	summary: "Get facility checkup data",
	description: "Retrieve saved facility/clinic checkup records",
	response: {
		200: {
			description: "Facility checkup data retrieved successfully",
			type: "object",
			properties: {
				success: { type: "boolean", description: "Operation success status" },
				data: {
					type: "array",
					description: "List of facility checkup records",
					items: {
						type: "object",
						properties: {
							id: { type: "string", description: "Record ID" },
							facilityName: { type: "string", description: "Healthcare facility name" },
							doctorName: { type: "string", description: "Attending doctor name" },
							controlDate: { type: "string", format: "date-time", description: "Checkup date" },
							recordedAt: { type: "string", format: "date-time", description: "When the record was created" }
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

export const getPhysicalCheckupDataSchema = {
	tags: ["KIA - Pregnancy Tracking"],
	summary: "Get physical checkup data",
	description: "Retrieve saved physical examination records and vital signs",
	response: {
		200: {
			description: "Physical checkup data retrieved successfully",
			type: "object",
			properties: {
				success: { type: "boolean", description: "Operation success status" },
				data: {
					type: "array",
					description: "List of physical checkup records",
					items: {
						type: "object",
						properties: {
							id: { type: "string", description: "Record ID" },
							bloodPressure: { type: "string", description: "Blood pressure reading (e.g., 120/80)" },
							weight: { type: "number", description: "Weight in kg" },
							height: { type: "number", description: "Height in cm" },
							fundalHeight: { type: "number", description: "Fundal height in cm" },
							lila: { type: "integer", description: "LILA (arm circumference) in cm" },
							bloodType: { type: "string", description: "Blood type" },
							bloodSugar: { type: "integer", description: "Blood sugar level" },
							urineProtein: { type: "string", description: "Urine protein level" },
							recordedAt: { type: "string", format: "date-time", description: "When the record was created" }
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

export const getChecklistDataSchema = {
	tags: ["KIA - Pregnancy Tracking"],
	summary: "Get pregnancy care checklist",
	description: "Retrieve pregnancy care services checklist records",
	response: {
		200: {
			description: "Checklist data retrieved successfully",
			type: "object",
			properties: {
				success: { type: "boolean", description: "Operation success status" },
				data: {
					type: "array",
					description: "List of care services checklist records",
					items: {
						type: "object",
						properties: {
							id: { type: "string", description: "Record ID" },
							fetalHeartbeat: { type: "boolean", description: "Whether fetal heartbeat was checked" },
							counseling: { type: "boolean", description: "Whether counseling was provided" },
							tetanusImmunization: { type: "boolean", description: "Whether tetanus immunization was given" },
							healthScreening: { type: "boolean", description: "Whether health screening was completed" },
							ironSuplement: { type: "boolean", description: "Whether iron supplement was provided" },
							ppia: { type: "boolean", description: "Whether PPIA services were completed" },
							isCompleted: { type: "boolean", description: "Overall checklist completion status" },
							recordedAt: { type: "string", format: "date-time", description: "When the record was created" }
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

export const getLabDataSchema = {
	tags: ["KIA - Pregnancy Tracking"],
	summary: "Get lab test results",
	description: "Retrieve laboratory test results records",
	response: {
		200: {
			description: "Lab data retrieved successfully",
			type: "object",
			properties: {
				success: { type: "boolean", description: "Operation success status" },
				data: {
					type: "array",
					description: "List of lab test result records",
					items: {
						type: "object",
						properties: {
							id: { type: "string", description: "Record ID" },
							hemoglobin: { type: "number", description: "Hemoglobin level (g/dL)" },
							bloodType: { type: "string", description: "Blood type" },
							bloodSugar: { type: "integer", description: "Blood sugar level (mg/dL)" },
							urineProtein: { type: "string", description: "Urine protein level" },
							recordedAt: { type: "string", format: "date-time", description: "When the record was created" }
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

export const downloadCsvReportSchema = {
	tags: ["KIA - Pregnancy Tracking"],
	summary: "Download KIA data as CSV",
	description: "Export all pregnancy tracking data as CSV file for external use or record keeping",
	response: {
		200: {
			description: "CSV file successfully generated and ready for download",
			type: "string",
			format: "binary",
			headers: {
				"Content-Type": { type: "string", description: "text/csv; charset=utf-8" },
				"Content-Disposition": { type: "string", description: "File attachment header with dynamic filename" }
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
			description: "Bad request or error generating CSV",
			type: "object",
			properties: {
				success: { type: "boolean" },
				message: { type: "string" }
			}
		}
	}
};

export const downloadPdfReportSchema = {
	tags: ["KIA - Pregnancy Tracking"],
	summary: "Download KIA data as PDF",
	description: "Export all pregnancy tracking data as formatted PDF report for printing or archiving",
	response: {
		200: {
			description: "PDF file successfully generated and ready for download",
			type: "string",
			format: "binary",
			headers: {
				"Content-Type": { type: "string", description: "application/pdf" },
				"Content-Disposition": { type: "string", description: "File attachment header with dynamic filename" }
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
			description: "Bad request or error generating PDF",
			type: "object",
			properties: {
				success: { type: "boolean" },
				message: { type: "string" }
			}
		}
	}
};
