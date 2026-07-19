CREATE TABLE `approvals` (
	`id` text PRIMARY KEY NOT NULL,
	`tenant_id` text NOT NULL,
	`suggestion_id` text NOT NULL,
	`reviewer_id` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `artifacts` (
	`id` text PRIMARY KEY NOT NULL,
	`tenant_id` text NOT NULL,
	`product_id` text NOT NULL,
	`object_key` text NOT NULL,
	`sha256` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `audit_events` (
	`id` text PRIMARY KEY NOT NULL,
	`tenant_id` text NOT NULL,
	`event_type` text NOT NULL,
	`actor_id` text NOT NULL,
	`payload_json` text NOT NULL,
	`previous_hash` text,
	`event_hash` text NOT NULL,
	`sequence` integer NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` text PRIMARY KEY NOT NULL,
	`tenant_id` text NOT NULL,
	`name` text NOT NULL,
	`version` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `products_tenant_id_id` ON `products` (`tenant_id`,`id`);--> statement-breakpoint
CREATE TABLE `suggestions` (
	`id` text PRIMARY KEY NOT NULL,
	`tenant_id` text NOT NULL,
	`product_id` text NOT NULL,
	`source_fragment_id` text NOT NULL,
	`proposed_value` text NOT NULL,
	`status` text DEFAULT 'SUGGESTED' NOT NULL,
	`model_run_id` text,
	`created_at` text NOT NULL
);
