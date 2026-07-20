CREATE TABLE `ai_rate_limits` (
	`tenant_id` text NOT NULL,
	`actor_id` text NOT NULL,
	`use_case` text NOT NULL,
	`window_start` text NOT NULL,
	`calls` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `ai_rate_limits_window` ON `ai_rate_limits` (`tenant_id`,`actor_id`,`use_case`,`window_start`);