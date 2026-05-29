CREATE TABLE `contact_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sortOrder` int NOT NULL DEFAULT 0,
	`category` varchar(64) NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`linkUrl` text,
	`linkLabel` varchar(128),
	`iconName` varchar(64),
	`isPublished` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `contact_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`category` varchar(64) NOT NULL,
	`startAt` timestamp NOT NULL,
	`endAt` timestamp,
	`location` varchar(255),
	`formUrl` text,
	`isPublished` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `external_links` (
	`id` int AUTO_INCREMENT NOT NULL,
	`category` varchar(128) NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`url` text NOT NULL,
	`isPublished` boolean NOT NULL DEFAULT true,
	`sortOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `external_links_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `invitations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`code` varchar(64) NOT NULL,
	`createdBy` int,
	`usedBy` int,
	`usedAt` timestamp,
	`expiresAt` timestamp,
	`maxUses` int DEFAULT 1,
	`useCount` int DEFAULT 0,
	`note` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `invitations_id` PRIMARY KEY(`id`),
	CONSTRAINT `invitations_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `login_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`loginAt` timestamp NOT NULL DEFAULT (now()),
	`ipAddress` varchar(64),
	`userAgent` text,
	CONSTRAINT `login_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `managed_images` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slot` varchar(128) NOT NULL,
	`label` varchar(255) NOT NULL,
	`imageKey` text,
	`imageUrl` text,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `managed_images_id` PRIMARY KEY(`id`),
	CONSTRAINT `managed_images_slot_unique` UNIQUE(`slot`)
);
--> statement-breakpoint
CREATE TABLE `page_views` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`pageName` varchar(128) NOT NULL,
	`pageUrl` varchar(512) NOT NULL,
	`viewedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `page_views_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `setup_steps` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sortOrder` int NOT NULL DEFAULT 0,
	`title` varchar(255) NOT NULL,
	`description` text,
	`videoUrl` text,
	`imageKey` text,
	`imageUrl` text,
	`linkUrl` text,
	`linkLabel` varchar(128),
	`isPublished` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `setup_steps_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `video_views` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`videoId` int NOT NULL,
	`viewedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `video_views_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `videos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`category` varchar(128) NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`videoUrl` text NOT NULL,
	`thumbnailUrl` text,
	`isLatest` boolean NOT NULL DEFAULT false,
	`isPublished` boolean NOT NULL DEFAULT true,
	`sortOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `videos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `address` text;--> statement-breakpoint
ALTER TABLE `users` ADD `phone` varchar(32);--> statement-breakpoint
ALTER TABLE `users` ADD `brandRegisteredAt` timestamp;--> statement-breakpoint
ALTER TABLE `users` ADD `siteRegisteredAt` timestamp DEFAULT (now());--> statement-breakpoint
ALTER TABLE `users` ADD `invitationCode` varchar(64);