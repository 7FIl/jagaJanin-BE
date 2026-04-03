export const getMealLogsSchema = {
	tags: ["Dashboard"],
	summary: "Get meal logs",
	description: "Get meal logs for a specific date",
	querystring: {
		type: "object",
		required: ["date"],
		properties: {
			date: { type: "string", pattern: "^\\d{2}-\\d{2}-\\d{4}$", description: "Date in DD-MM-YYYY format" }
		},
		additionalProperties: false
	},
	response: {
		200: {
			description: "Meal logs retrieved successfully",
			type: "object",
			properties: {
				success: { type: "boolean", description: "Operation success status" },
				data: {
					type: "array",
					description: "List of meal logs for the specified date",
					items: {
						type: "object",
						properties: {
							id: { type: "string", description: "Meal log ID" },
							foodId: { type: "integer", description: "Food item ID" },
							foodName: { type: "string", description: "Food name" },
							quantity: { type: "integer", description: "Quantity consumed" },
							calories: { type: "number", description: "Total calories for this meal" },
							protein: { type: "number", description: "Protein in grams" },
							carbs: { type: "number", description: "Carbohydrates in grams" },
							fat: { type: "number", description: "Fat in grams" },
							date: { type: "string", format: "date", description: "Date of meal" },
							createdAt: { type: "string", format: "date-time", description: "When the log was created" }
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
			description: "Invalid date format or bad request",
			type: "object",
			properties: {
				success: { type: "boolean" },
				message: { type: "string" }
			}
		}
	}
};

export const createMealLogSchema = {
	tags: ["Dashboard"],
	summary: "Create meal log",
	description: "Log a meal with food item and quantity consumed",
	body: {
		type: "object",
		required: ["foodId", "quantity", "date"],
		properties: {
			foodId: { type: "integer", minimum: 1, description: "Food item ID from food database" },
			quantity: { type: "integer", minimum: 1, description: "Quantity consumed" },
			date: { type: "string", pattern: "^\\d{2}-\\d{2}-\\d{4}$", description: "Date of meal (DD-MM-YYYY)" }
		},
		additionalProperties: false
	},
	response: {
		201: {
			description: "Meal log created successfully",
			type: "object",
			properties: {
				success: { type: "boolean", description: "Operation success status" },
				data: {
					type: "object",
					description: "Created meal log",
					properties: {
						id: { type: "string", description: "New meal log ID" },
						foodId: { type: "integer", description: "Food item ID" },
						foodName: { type: "string", description: "Food name" },
						quantity: { type: "integer", description: "Quantity consumed" },
						calories: { type: "number", description: "Total calories" },
						date: { type: "string", format: "date", description: "Date of meal" },
						createdAt: { type: "string", format: "date-time", description: "Creation timestamp" }
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
			description: "Invalid request data or food not found",
			type: "object",
			properties: {
				success: { type: "boolean" },
				message: { type: "string", description: "Error message (e.g., 'Food not found', 'Invalid date format')" }
			}
		}
	}
};

export const getDashboardDataSchema = {
	tags: ["Dashboard"],
	summary: "Get dashboard overview data",
	description: "Get overall dashboard data including nutrition, pregnancy progress, and recommendations",
	response: {
		200: {
			description: "Dashboard data retrieved successfully",
			type: "object",
			properties: {
				success: { type: "boolean", description: "Operation success status" },
				data: {
					type: "object",
					description: "Complete dashboard overview",
					properties: {
						pregnancyWeek: { type: "integer", description: "Current pregnancy week" },
						dueDate: { type: "string", format: "date", description: "Expected due date" },
						nutritionStatus: {
							type: "object",
							description: "Nutrition compliance metrics",
							properties: {
								caloriesConsumed: { type: "number" },
								caloriesTarget: { type: "number" },
								compliancePercentage: { type: "number" }
							}
						},
						recentMeals: {
							type: "array",
							description: "Recent meal logs",
							items: {
								type: "object",
								properties: {
									id: { type: "string" },
									foodName: { type: "string" },
									calories: { type: "number" },
									date: { type: "string", format: "date" }
								}
							}
						},
						recommendations: {
							type: "array",
							description: "Personalized health recommendations",
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
		400: {
			description: "Bad request or user data missing",
			type: "object",
			properties: {
				success: { type: "boolean" },
				message: { type: "string" }
			}
		},
		500: {
			description: "Server error retrieving dashboard data",
			type: "object",
			properties: {
				success: { type: "boolean" },
				message: { type: "string" }
			}
		}
	}
};

export const getMealRecommendationsSchema = {
	tags: ["Dashboard"],
	summary: "Get meal recommendations",
	description: "Get personalized meal recommendations based on pregnancy week and nutritional needs",
	response: {
		200: {
			description: "Meal recommendations retrieved successfully",
			type: "object",
			properties: {
				success: { type: "boolean", description: "Operation success status" },
				data: {
					type: "array",
					description: "List of recommended meals",
					items: {
						type: "object",
						properties: {
							id: { type: "string", description: "Meal recommendation ID" },
							name: { type: "string", description: "Food name" },
							calories: { type: "number", description: "Calorie content" },
							protein: { type: "number", description: "Protein in grams" },
							carbs: { type: "number", description: "Carbohydrates in grams" },
							fat: { type: "number", description: "Fat in grams" },
							nutrition: {
								type: "object",
								description: "Detailed nutrition info",
								properties: {
									calcium: { type: "number" },
									iron: { type: "number" },
									folic_acid: { type: "number" }
								}
							},
							servingSize: { type: "string", description: "Recommended serving size" },
							category: { type: "string", description: "Food category (protein, vegetables, grains, etc.)" }
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

export const getDailyProgressTrackingSchema = {
	tags: ["Dashboard"],
	summary: "Get daily progress",
	description: "Get daily nutrition and health progress tracking data",
	response: {
		200: {
			description: "Daily progress retrieved successfully",
			type: "object",
			properties: {
				success: { type: "boolean", description: "Operation success status" },
				data: {
					type: "object",
					description: "Daily progress metrics",
					properties: {
						date: { type: "string", format: "date", description: "Progress date" },
						caloriesConsumed: { type: "number", description: "Total calories consumed today" },
						caloriesTarget: { type: "number", description: "Daily calorie target" },
						macronutrients: {
							type: "object",
							description: "Macronutrient breakdown",
							properties: {
								protein: { type: "number", description: "Protein in grams" },
								carbs: { type: "number", description: "Carbohydrates in grams" },
								fat: { type: "number", description: "Fat in grams" }
							}
						},
						mealCount: { type: "integer", description: "Number of meals logged today" },
						completionPercentage: { type: "number", description: "Calories completion percentage (0-100)" },
						waterIntake: { type: "number", description: "Water intake in liters" },
						exerciseMinutes: { type: "integer", description: "Exercise minutes completed" }
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

export const getWeeklyProgressTrackingSchema = {
	tags: ["Dashboard"],
	summary: "Get weekly progress",
	description: "Get weekly nutrition and health progress tracking with trends",
	response: {
		200: {
			description: "Weekly progress retrieved successfully",
			type: "object",
			properties: {
				success: { type: "boolean", description: "Operation success status" },
				data: {
					type: "object",
					description: "Weekly progress metrics",
					properties: {
						week: { type: "string", description: "Week identifier (e.g., week of 2024-01-08)" },
						averageCalories: { type: "number", description: "Average daily calories for the week" },
						totalCalories: { type: "number", description: "Total calories consumed in the week" },
						weeklyTrend: {
							type: "array",
							description: "Daily breakdown for the week",
							items: {
								type: "object",
								properties: {
									date: { type: "string", format: "date" },
									calories: { type: "number" },
									mealCount: { type: "integer" }
								}
							}
						},
						averageMacros: {
							type: "object",
							description: "Average macronutrient composition",
							properties: {
								protein: { type: "number" },
								carbs: { type: "number" },
								fat: { type: "number" }
							}
						},
						compliancePercentage: { type: "number", description: "Overall weekly compliance percentage" }
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

export const updateMealLogSchema = {
	tags: ["Dashboard"],
	summary: "Update meal log",
	description: "Update an existing meal log entry (food ID or quantity)",
	params: {
		type: "object",
		required: ["mealLogId"],
		properties: {
			mealLogId: { type: "string", description: "Meal log ID to update" }
		}
	},
	body: {
		type: "object",
		required: [],
		properties: {
			foodId: { type: "integer", minimum: 1, description: "New food item ID" },
			quantity: { type: "integer", minimum: 1, description: "Updated quantity" }
		},
		anyOf: [
			{ required: ["foodId"] },
			{ required: ["quantity"] }
		],
		additionalProperties: false
	},
	response: {
		200: {
			description: "Meal log updated successfully",
			type: "object",
			properties: {
				success: { type: "boolean", description: "Operation success status" },
				data: {
					type: "object",
					description: "Updated meal log",
					properties: {
						id: { type: "string", description: "Meal log ID" },
						foodId: { type: "integer", description: "Updated food ID" },
						quantity: { type: "integer", description: "Updated quantity" },
						calories: { type: "number", description: "Updated calorie total" },
						date: { type: "string", format: "date", description: "Meal date" }
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
			description: "Invalid request data, meal log not found, or at least one field required",
			type: "object",
			properties: {
				success: { type: "boolean" },
				message: { type: "string" }
			}
		},
		404: {
			description: "Meal log not found",
			type: "object",
			properties: {
				success: { type: "boolean" },
				message: { type: "string" }
			}
		}
	}
};

export const deleteMealLogsByDateSchema = {
	tags: ["Dashboard"],
	summary: "Delete meal logs by date",
	description: "Delete all meal logs for a specific date",
	querystring: {
		type: "object",
		required: ["date"],
		properties: {
			date: { type: "string", pattern: "^\\d{2}-\\d{2}-\\d{4}$", description: "Date to delete logs from (DD-MM-YYYY)" }
		},
		additionalProperties: false
	},
	response: {
		200: {
			description: "Meal logs deleted successfully",
			type: "object",
			properties: {
				success: { type: "boolean", description: "Operation success status" },
				data: {
					type: "object",
					description: "Deletion result",
					properties: {
						deletedCount: { type: "integer", description: "Number of meal logs deleted" },
						date: { type: "string", format: "date", description: "Date that was cleared" }
					}
				},
				message: { type: "string", description: "Success message (e.g., 'Deleted 5 meal logs')" }
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
			description: "Invalid date format or bad request",
			type: "object",
			properties: {
				success: { type: "boolean" },
				message: { type: "string" }
			}
		}
	}
};
