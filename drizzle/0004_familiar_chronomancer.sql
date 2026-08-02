CREATE TABLE `topics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(200) NOT NULL,
	`body` text,
	`imageUrl` text,
	`buttonText` varchar(100),
	`buttonUrl` text,
	`sortOrder` int NOT NULL DEFAULT 0,
	`isPublished` enum('published','draft') NOT NULL DEFAULT 'published',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `topics_id` PRIMARY KEY(`id`)
);
