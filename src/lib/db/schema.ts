import { relations, sql } from "drizzle-orm";
import {
  index,
  integer,
  primaryKey,
  real,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";

export const muscles = sqliteTable(
  "muscles",
  {
    id: text("id").primaryKey(),
    slug: text("slug").notNull().unique(),
    name: text("name").notNull(),
    nameEn: text("name_en").notNull(),
    category: text("category").notNull(),
    color: text("color").notNull(),
    primaryMeshKeys: text("primary_mesh_keys", { mode: "json" })
      .$type<string[]>()
      .notNull(),
    secondaryMeshKeys: text("secondary_mesh_keys", { mode: "json" })
      .$type<string[]>()
      .notNull(),
    sortOrder: integer("sort_order").notNull(),
  },
  (table) => ({
    categoryIdx: index("muscles_category_idx").on(table.category),
  }),
);

export const exercises = sqliteTable(
  "exercises",
  {
    id: text("id").primaryKey(),
    slug: text("slug").notNull().unique(),
    name: text("name").notNull(),
    nameEn: text("name_en").notNull(),
    category: text("category").notNull(),
    difficulty: text("difficulty").notNull(),
    description: text("description").notNull(),
    instructions: text("instructions", { mode: "json" })
      .$type<string[]>()
      .notNull(),
    equipment: text("equipment", { mode: "json" }).$type<string[]>().notNull(),
    heroMeshKeys: text("hero_mesh_keys", { mode: "json" })
      .$type<string[]>()
      .notNull(),
    createdAt: text("created_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    categoryIdx: index("exercises_category_idx").on(table.category),
    difficultyIdx: index("exercises_difficulty_idx").on(table.difficulty),
  }),
);

export const exerciseMuscles = sqliteTable(
  "exercise_muscles",
  {
    exerciseId: text("exercise_id")
      .notNull()
      .references(() => exercises.id, { onDelete: "cascade" }),
    muscleId: text("muscle_id")
      .notNull()
      .references(() => muscles.id, { onDelete: "cascade" }),
    role: text("role").notNull(),
  },
  (table) => ({
    pk: primaryKey({
      columns: [table.exerciseId, table.muscleId, table.role],
    }),
    exerciseIdx: index("exercise_muscles_exercise_idx").on(table.exerciseId),
    muscleIdx: index("exercise_muscles_muscle_idx").on(table.muscleId),
  }),
);

export const nutritionProfiles = sqliteTable("nutrition_profiles", {
  id: text("id").primaryKey(),
  goal: text("goal").notNull(),
  sex: text("sex").notNull(),
  age: integer("age").notNull(),
  heightCm: real("height_cm").notNull(),
  weightKg: real("weight_kg").notNull(),
  activityLevel: text("activity_level").notNull(),
  dietPreference: text("diet_preference").notNull(),
  allergies: text("allergies", { mode: "json" }).$type<string[]>().notNull(),
  createdAt: text("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export const nutritionPlans = sqliteTable(
  "nutrition_plans",
  {
    id: text("id").primaryKey(),
    profileId: text("profile_id")
      .notNull()
      .references(() => nutritionProfiles.id, { onDelete: "cascade" }),
    targetCalories: integer("target_calories").notNull(),
    proteinGrams: integer("protein_grams").notNull(),
    carbsGrams: integer("carbs_grams").notNull(),
    fatGrams: integer("fat_grams").notNull(),
    waterMl: integer("water_ml").notNull(),
    mealPlanJson: text("meal_plan_json", { mode: "json" })
      .$type<unknown>()
      .notNull(),
    aiRawJson: text("ai_raw_json", { mode: "json" }).$type<unknown>(),
    calculationSource: text("calculation_source").notNull(),
    createdAt: text("created_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    profileIdx: index("nutrition_plans_profile_idx").on(table.profileId),
  }),
);

export const trainingPlanProfiles = sqliteTable("training_plan_profiles", {
  id: text("id").primaryKey(),
  goal: text("goal").notNull(),
  trainingDaysPerWeek: integer("training_days_per_week").notNull(),
  experienceLevel: text("experience_level").notNull(),
  splitType: text("split_type").notNull(),
  equipmentAccess: text("equipment_access").notNull(),
  sessionDurationMinutes: integer("session_duration_minutes").notNull(),
  restrictions: text("restrictions", { mode: "json" }).$type<string[]>().notNull(),
  createdAt: text("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export const trainingPlans = sqliteTable(
  "training_plans",
  {
    id: text("id").primaryKey(),
    profileId: text("profile_id")
      .notNull()
      .references(() => trainingPlanProfiles.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    summary: text("summary").notNull(),
    explanation: text("explanation", { mode: "json" })
      .$type<string[]>()
      .notNull(),
    generationSource: text("generation_source").notNull(),
    createdAt: text("created_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    profileIdx: index("training_plans_profile_idx").on(table.profileId),
  }),
);

export const trainingPlanDays = sqliteTable(
  "training_plan_days",
  {
    id: text("id").primaryKey(),
    planId: text("plan_id")
      .notNull()
      .references(() => trainingPlans.id, { onDelete: "cascade" }),
    dayIndex: integer("day_index").notNull(),
    label: text("label").notNull(),
    focus: text("focus").notNull(),
    summary: text("summary").notNull(),
  },
  (table) => ({
    planIdx: index("training_plan_days_plan_idx").on(table.planId),
  }),
);

export const trainingPlanDayExercises = sqliteTable(
  "training_plan_day_exercises",
  {
    id: text("id").primaryKey(),
    dayId: text("day_id")
      .notNull()
      .references(() => trainingPlanDays.id, { onDelete: "cascade" }),
    exerciseId: text("exercise_id")
      .notNull()
      .references(() => exercises.id, { onDelete: "restrict" }),
    orderIndex: integer("order_index").notNull(),
    sets: integer("sets").notNull(),
    reps: text("reps").notNull(),
    restSeconds: integer("rest_seconds").notNull(),
    notes: text("notes").notNull(),
  },
  (table) => ({
    dayIdx: index("training_plan_day_exercises_day_idx").on(table.dayId),
    exerciseIdx: index("training_plan_day_exercises_exercise_idx").on(
      table.exerciseId,
    ),
  }),
);

export const bodyMetrics = sqliteTable(
  "body_metrics",
  {
    id: text("id").primaryKey(),
    weightKg: real("weight_kg").notNull(),
    bodyFatPercentage: real("body_fat_percentage"),
    recordedAt: text("recorded_at").notNull(),
    createdAt: text("created_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    recordedAtIdx: index("body_metrics_recorded_at_idx").on(table.recordedAt),
  }),
);

export const exerciseRelations = relations(exercises, ({ many }) => ({
  muscleLinks: many(exerciseMuscles),
  trainingPlanEntries: many(trainingPlanDayExercises),
}));

export const muscleRelations = relations(muscles, ({ many }) => ({
  exerciseLinks: many(exerciseMuscles),
}));

export const exerciseMuscleRelations = relations(exerciseMuscles, ({ one }) => ({
  exercise: one(exercises, {
    fields: [exerciseMuscles.exerciseId],
    references: [exercises.id],
  }),
  muscle: one(muscles, {
    fields: [exerciseMuscles.muscleId],
    references: [muscles.id],
  }),
}));

export const trainingPlanProfileRelations = relations(
  trainingPlanProfiles,
  ({ many }) => ({
    plans: many(trainingPlans),
  }),
);

export const trainingPlanRelations = relations(trainingPlans, ({ one, many }) => ({
  profile: one(trainingPlanProfiles, {
    fields: [trainingPlans.profileId],
    references: [trainingPlanProfiles.id],
  }),
  days: many(trainingPlanDays),
}));

export const trainingPlanDayRelations = relations(
  trainingPlanDays,
  ({ one, many }) => ({
    plan: one(trainingPlans, {
      fields: [trainingPlanDays.planId],
      references: [trainingPlans.id],
    }),
    exercises: many(trainingPlanDayExercises),
  }),
);

export const trainingPlanDayExerciseRelations = relations(
  trainingPlanDayExercises,
  ({ one }) => ({
    day: one(trainingPlanDays, {
      fields: [trainingPlanDayExercises.dayId],
      references: [trainingPlanDays.id],
    }),
    exercise: one(exercises, {
      fields: [trainingPlanDayExercises.exerciseId],
      references: [exercises.id],
    }),
  }),
);
