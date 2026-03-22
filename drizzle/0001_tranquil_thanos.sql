CREATE TABLE `training_plan_day_exercises` (
	`id` text PRIMARY KEY NOT NULL,
	`day_id` text NOT NULL,
	`exercise_id` text NOT NULL,
	`order_index` integer NOT NULL,
	`sets` integer NOT NULL,
	`reps` text NOT NULL,
	`rest_seconds` integer NOT NULL,
	`notes` text NOT NULL,
	FOREIGN KEY (`day_id`) REFERENCES `training_plan_days`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`exercise_id`) REFERENCES `exercises`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE INDEX `training_plan_day_exercises_day_idx` ON `training_plan_day_exercises` (`day_id`);--> statement-breakpoint
CREATE INDEX `training_plan_day_exercises_exercise_idx` ON `training_plan_day_exercises` (`exercise_id`);--> statement-breakpoint
CREATE TABLE `training_plan_days` (
	`id` text PRIMARY KEY NOT NULL,
	`plan_id` text NOT NULL,
	`day_index` integer NOT NULL,
	`label` text NOT NULL,
	`focus` text NOT NULL,
	`summary` text NOT NULL,
	FOREIGN KEY (`plan_id`) REFERENCES `training_plans`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `training_plan_days_plan_idx` ON `training_plan_days` (`plan_id`);--> statement-breakpoint
CREATE TABLE `training_plan_profiles` (
	`id` text PRIMARY KEY NOT NULL,
	`goal` text NOT NULL,
	`training_days_per_week` integer NOT NULL,
	`experience_level` text NOT NULL,
	`split_type` text NOT NULL,
	`equipment_access` text NOT NULL,
	`session_duration_minutes` integer NOT NULL,
	`restrictions` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `training_plans` (
	`id` text PRIMARY KEY NOT NULL,
	`profile_id` text NOT NULL,
	`title` text NOT NULL,
	`summary` text NOT NULL,
	`explanation` text NOT NULL,
	`generation_source` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`profile_id`) REFERENCES `training_plan_profiles`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `training_plans_profile_idx` ON `training_plans` (`profile_id`);