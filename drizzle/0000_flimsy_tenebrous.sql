CREATE TABLE `tasksTable` (
	`id` text PRIMARY KEY NOT NULL,
	`description` text NOT NULL,
	`date` text NOT NULL,
	`priority` text NOT NULL,
	`isCompleted` integer NOT NULL,
	`notification_id` text NOT NULL,
	`notification_minutes_before` integer
);
