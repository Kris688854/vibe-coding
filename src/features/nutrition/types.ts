export type NutritionDayType = "training" | "rest";

export type NutritionPlanRequest = {
  age: number;
  sex: "male" | "female";
  heightCm: number;
  weightKg: number;
  activityLevel: "sedentary" | "light" | "moderate" | "active" | "very_active";
  goal: "fat_loss" | "maintenance" | "muscle_gain";
  dietPreference: "balanced" | "high_protein" | "vegetarian" | "low_carb";
  mealsPerDay: number;
  dayType?: NutritionDayType;
  allergies: string[];
  notes?: string;
};

export type NutritionCalculation = {
  maintenanceCalories: number;
  targetCalories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  waterMl: number;
};

export type MealPlanScenario = {
  summary: string;
  breakfast: string[];
  lunch: string[];
  dinner: string[];
  snacks: string[];
  substitutions: string[];
};

export type MealPlans = {
  cafeteria: MealPlanScenario;
  convenienceStore: MealPlanScenario;
  fitnessStandard: MealPlanScenario;
};

export type AiNutritionContent = {
  reasoning: string[];
  mealPlans: MealPlans;
};

export type NutritionPlanResponse = {
  calculation: NutritionCalculation;
  reasoning: string[];
  mealPlans: MealPlans;
  dayType: NutritionDayType;
  source: "rules" | "rules+ai";
};
