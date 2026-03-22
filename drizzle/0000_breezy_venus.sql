CREATE TABLE `exercise_muscles` (
	`exercise_id` text NOT NULL,
	`muscle_id` text NOT NULL,
	`role` text NOT NULL,
	PRIMARY KEY(`exercise_id`, `muscle_id`, `role`),
	FOREIGN KEY (`exercise_id`) REFERENCES `exercises`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`muscle_id`) REFERENCES `muscles`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `exercise_muscles_exercise_idx` ON `exercise_muscles` (`exercise_id`);--> statement-breakpoint
CREATE INDEX `exercise_muscles_muscle_idx` ON `exercise_muscles` (`muscle_id`);--> statement-breakpoint
CREATE TABLE `exercises` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`name_en` text NOT NULL,
	`category` text NOT NULL,
	`difficulty` text NOT NULL,
	`description` text NOT NULL,
	`instructions` text NOT NULL,
	`equipment` text NOT NULL,
	`hero_mesh_keys` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `exercises_slug_unique` ON `exercises` (`slug`);--> statement-breakpoint
CREATE INDEX `exercises_category_idx` ON `exercises` (`category`);--> statement-breakpoint
CREATE INDEX `exercises_difficulty_idx` ON `exercises` (`difficulty`);--> statement-breakpoint
CREATE TABLE `muscles` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`name_en` text NOT NULL,
	`category` text NOT NULL,
	`color` text NOT NULL,
	`primary_mesh_keys` text NOT NULL,
	`secondary_mesh_keys` text NOT NULL,
	`sort_order` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `muscles_slug_unique` ON `muscles` (`slug`);--> statement-breakpoint
CREATE INDEX `muscles_category_idx` ON `muscles` (`category`);--> statement-breakpoint
CREATE TABLE `nutrition_plans` (
	`id` text PRIMARY KEY NOT NULL,
	`profile_id` text NOT NULL,
	`target_calories` integer NOT NULL,
	`protein_grams` integer NOT NULL,
	`carbs_grams` integer NOT NULL,
	`fat_grams` integer NOT NULL,
	`water_ml` integer NOT NULL,
	`meal_plan_json` text NOT NULL,
	`ai_raw_json` text,
	`calculation_source` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`profile_id`) REFERENCES `nutrition_profiles`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `nutrition_plans_profile_idx` ON `nutrition_plans` (`profile_id`);--> statement-breakpoint
CREATE TABLE `nutrition_profiles` (
	`id` text PRIMARY KEY NOT NULL,
	`goal` text NOT NULL,
	`sex` text NOT NULL,
	`age` integer NOT NULL,
	`height_cm` real NOT NULL,
	`weight_kg` real NOT NULL,
	`activity_level` text NOT NULL,
	`diet_preference` text NOT NULL,
	`allergies` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
