ALTER TABLE `videos` ADD `youtubeVideoId` varchar(32);--> statement-breakpoint
ALTER TABLE `videos` ADD `publishedAt` timestamp;--> statement-breakpoint
ALTER TABLE `videos` ADD `syncedAt` timestamp;--> statement-breakpoint
ALTER TABLE `videos` ADD CONSTRAINT `videos_youtubeVideoId_unique` UNIQUE(`youtubeVideoId`);
