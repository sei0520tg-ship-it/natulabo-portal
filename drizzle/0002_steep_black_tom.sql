CREATE TABLE `testimonials` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(200) NOT NULL,
	`authorName` varchar(100) NOT NULL,
	`authorLabel` varchar(100),
	`category` varchar(50) NOT NULL DEFAULT '健康',
	`content` text NOT NULL,
	`oilsUsed` text,
	`imageUrl` text,
	`isPublished` enum('published','draft') NOT NULL DEFAULT 'published',
	`sortOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `testimonials_id` PRIMARY KEY(`id`)
);
