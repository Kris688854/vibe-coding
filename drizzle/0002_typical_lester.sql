CREATE TABLE `body_metrics` (
	`id` text PRIMARY KEY NOT NULL,
	`weight_kg` real NOT NULL,
	`body_fat_percentage` real,
	`recorded_at` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `body_metrics_recorded_at_idx` ON `body_metrics` (`recorded_at`);