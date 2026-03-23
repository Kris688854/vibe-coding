ALTER TABLE `exercises` ADD `primary_days` text DEFAULT '[]' NOT NULL;--> statement-breakpoint
ALTER TABLE `exercises` ADD `secondary_days` text DEFAULT '[]' NOT NULL;--> statement-breakpoint
ALTER TABLE `exercises` ADD `excluded_days` text DEFAULT '[]' NOT NULL;