ALTER TABLE `video_views` ADD `lastPosition` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `video_views` ADD `duration` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `video_views` ADD `progressPct` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `video_views` ADD `completed` enum('yes','no') DEFAULT 'no' NOT NULL;--> statement-breakpoint
ALTER TABLE `video_views` ADD `updatedAt` timestamp DEFAULT (now()) NOT NULL ON UPDATE CURRENT_TIMESTAMP;