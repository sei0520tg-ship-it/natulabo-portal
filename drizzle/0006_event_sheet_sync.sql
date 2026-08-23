ALTER TABLE `events` ADD `groupName` varchar(64);--> statement-breakpoint
ALTER TABLE `events` ADD `sourceKey` varchar(191);--> statement-breakpoint
ALTER TABLE `events` ADD `syncedAt` timestamp;--> statement-breakpoint
ALTER TABLE `events` ADD CONSTRAINT `events_sourceKey_unique` UNIQUE(`sourceKey`);
