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
					type: "object",
					description: "Meal logs with summary for the specified date",
					properties: {
						date: { type: "string", description: "Date in DD-MM-YYYY format" },
						meals: {
							type: "array",
							description: "List of meal logs for the specified date",
							items: {
								type: "object",
								properties: {
									mealLogId: { type: "string", description: "Meal log ID" },
									foodId: { type: "integer", description: "Food item ID" },
									foodName: { type: "string", description: "Food name" },
									quantity: { type: "integer", description: "Quantity consumed" },
									calories: { type: "number", description: "Calories per serving" },
									gram: { type: "number", description: "Grams per serving" },
									protein: { type: "number", description: "Protein in grams per serving" },
									fat: { type: "number", description: "Fat in grams per serving" },
									createdAt: { type: "string", format: "date-time", description: "When the log was created" },
									updatedAt: { type: "string", format: "date-time", description: "When the log was last updated" }
								}
							}
						},
						totalCalories: { type: "number", description: "Total calories for the day" },
						mealCount: { type: "integer", description: "Number of meals logged" }
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
	description: "Get overall dashboard data including pregnancy progress, daily and weekly meal recommendations",
	response: {
		200: {
			description: "Dashboard data retrieved successfully",
			type: "object",
			required: ["success", "data", "message"],
			properties: {
				success: { type: "boolean", description: "Operation success status" },
				data: {
					type: "object",
					description: "Complete dashboard overview",
					required: ["avatarUrl", "trimester", "weeks", "dailyProgress", "weeklyProgress", "dailyRecommendation"],
					properties: {
						avatarUrl: { type: "string", format: "uri", description: "User avatar URL" },
						trimester: { type: "string", description: "Current pregnancy trimester" },
						weeks: { type: "integer", description: "Current pregnancy week" },
						dailyProgress: {
							type: "object",
							description: "Daily meal progress",
							properties: {
								caloriesConsumed: { type: "number" },
								caloriesTarget: { type: "number" },
								compliancePercentage: { type: "number" }
							}
						},
						weeklyProgress: {
							type: "object",
							description: "Weekly meal progress",
							properties: {
								caloriesConsumed: { type: "number" },
								caloriesTarget: { type: "number" },
								compliancePercentage: { type: "number" }
							}
						},
						dailyRecommendation: {
							type: "object",
							description: "Daily meal recommendations",
							properties: {
								staple: {
									type: "object",
									properties: {
										name: { type: "string" },
										quantity: { type: "integer" },
										gram: { type: "number" },
										price: { type: "number" },
										picture: { type: "string", format: "uri" }
									}
								},
								side: {
									type: "object",
									properties: {
										name: { type: "string" },
										quantity: { type: "integer" },
										gram: { type: "number" },
										price: { type: "number" },
										picture: { type: "string", format: "uri" }
									}
								},
								vegetable: {
									type: "object",
									properties: {
										name: { type: "string" },
										quantity: { type: "integer" },
										gram: { type: "number" },
										price: { type: "number" },
										picture: { type: "string", format: "uri" }
									}
								},
								totalPrice: { type: "number" }
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
					type: "object",
					description: "Daily meal recommendations by category",
					properties: {
						staple: {
							type: "object",
							description: "Staple food recommendation",
							properties: {
								name: { type: "string" },
								quantity: { type: "integer" },
								gram: { type: "number" },
								price: { type: "number" },
								picture: { type: "string", format: "uri" }
							}
						},
						side: {
							type: "object",
							description: "Side dish recommendation",
							properties: {
								name: { type: "string" },
								quantity: { type: "integer" },
								gram: { type: "number" },
								price: { type: "number" },
								picture: { type: "string", format: "uri" }
							}
						},
						vegetable: {
							type: "object",
							description: "Vegetable recommendation",
							properties: {
								name: { type: "string" },
								quantity: { type: "integer" },
								gram: { type: "number" },
								price: { type: "number" },
								picture: { type: "string", format: "uri" }
							}
						},
						totalPrice: { type: "number", description: "Total price for all meals" }
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
	description: "Get weekly nutrition and health progress tracking with daily breakdown",
	response: {
		200: {
			description: "Weekly progress retrieved successfully",
			type: "object",
			properties: {
				success: { type: "boolean", description: "Operation success status" },
				data: {
					type: "object",
					description: "Weekly progress metrics with daily breakdown",
					properties: {
						week: {
							type: "array",
							description: "Daily breakdown for the week",
							items: {
								type: "object",
								properties: {
									day: { type: "string", description: "Day name (e.g., Monday)" },
									date: { type: "string", description: "Date in DD-MM-YYYY format" },
									calories: { type: "number", description: "Total calories consumed on that day" },
									foods: { type: "array", description: "List of food items consumed", items: { type: "string" } }
								}
							}
						},
						totalCalories: { type: "number", description: "Total calories consumed in the week" },
						dailyCalorieGoal: { type: "number", description: "Daily calorie goal from pregnancy profile" }
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
