CREATE TABLE `messages` (
	`id` text PRIMARY KEY NOT NULL,
	`selected_chat_id` text NOT NULL,
	`content` text,
	`user_id` text,
	`user_name` text,
	`user_avatar_url` text,
	`message_type` text NOT NULL,
	`retries` integer,
	`status` text NOT NULL,
	`created_at` text NOT NULL,
	`file` text
);
