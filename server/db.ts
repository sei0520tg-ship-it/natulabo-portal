import { and, desc, eq, gte, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  InsertTestimonial,
  InsertTopic,
  contactItems,
  events,
  externalLinks,
  invitations,
  loginLogs,
  managedImages,
  pageViews,
  setupSteps,
  testimonials,
  topics,
  users,
  videoViews,
  videos,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ─── Users ───────────────────────────────────────────────────────────────────

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;

  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};

  const textFields = ["name", "email", "loginMethod"] as const;
  for (const field of textFields) {
    const value = user[field];
    if (value === undefined) continue;
    const normalized = value ?? null;
    values[field] = normalized;
    updateSet[field] = normalized;
  }

  if (user.lastSignedIn !== undefined) {
    values.lastSignedIn = user.lastSignedIn;
    updateSet.lastSignedIn = user.lastSignedIn;
  }
  if (user.role !== undefined) {
    values.role = user.role;
    updateSet.role = user.role;
  } else if (user.openId === ENV.ownerOpenId) {
    values.role = "admin";
    updateSet.role = "admin";
  }
  if (!values.lastSignedIn) values.lastSignedIn = new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();

  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

export async function getAllUsers() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(users).orderBy(desc(users.createdAt));
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result[0];
}

export async function updateUserProfile(
  id: number,
  data: { name?: string; address?: string; phone?: string; brandRegisteredAt?: Date }
) {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set(data).where(eq(users.id, id));
}

export async function setUserRole(id: number, role: "user" | "admin") {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set({ role }).where(eq(users.id, id));
}

// ─── Invitations ─────────────────────────────────────────────────────────────

export async function getInvitationByCode(code: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(invitations).where(eq(invitations.code, code)).limit(1);
  return result[0];
}

export async function getAllInvitations() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(invitations).orderBy(desc(invitations.createdAt));
}

export async function createInvitation(data: {
  code: string;
  createdBy?: number;
  maxUses?: number;
  expiresAt?: Date;
  note?: string;
}) {
  const db = await getDb();
  if (!db) return;
  await db.insert(invitations).values(data);
}

export async function useInvitation(code: string, userId: number) {
  const db = await getDb();
  if (!db) return;
  await db
    .update(invitations)
    .set({ usedBy: userId, usedAt: new Date(), useCount: sql`useCount + 1` })
    .where(eq(invitations.code, code));
}

// ─── Setup Steps ─────────────────────────────────────────────────────────────

export async function getSetupSteps() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(setupSteps).where(eq(setupSteps.isPublished, true)).orderBy(setupSteps.sortOrder);
}

export async function getAllSetupSteps() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(setupSteps).orderBy(setupSteps.sortOrder);
}

export async function upsertSetupStep(data: Partial<typeof setupSteps.$inferInsert> & { id?: number }) {
  const db = await getDb();
  if (!db) return;
  if (data.id) {
    const { id, ...rest } = data;
    await db.update(setupSteps).set(rest).where(eq(setupSteps.id, id));
  } else {
    await db.insert(setupSteps).values(data as typeof setupSteps.$inferInsert);
  }
}

export async function deleteSetupStep(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(setupSteps).where(eq(setupSteps.id, id));
}

// ─── Contact Items ────────────────────────────────────────────────────────────

export async function getContactItems() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(contactItems).where(eq(contactItems.isPublished, true)).orderBy(contactItems.sortOrder);
}

export async function getAllContactItems() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(contactItems).orderBy(contactItems.sortOrder);
}

export async function upsertContactItem(data: Partial<typeof contactItems.$inferInsert> & { id?: number }) {
  const db = await getDb();
  if (!db) return;
  if (data.id) {
    const { id, ...rest } = data;
    await db.update(contactItems).set(rest).where(eq(contactItems.id, id));
  } else {
    await db.insert(contactItems).values(data as typeof contactItems.$inferInsert);
  }
}

export async function deleteContactItem(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(contactItems).where(eq(contactItems.id, id));
}

// ─── Videos ──────────────────────────────────────────────────────────────────

export async function getVideos() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(videos).where(eq(videos.isPublished, true)).orderBy(videos.category, videos.sortOrder);
}

export async function getAllVideos() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(videos).orderBy(videos.category, videos.sortOrder);
}

export async function upsertVideo(data: Partial<typeof videos.$inferInsert> & { id?: number }) {
  const db = await getDb();
  if (!db) return;
  if (data.id) {
    const { id, ...rest } = data;
    await db.update(videos).set(rest).where(eq(videos.id, id));
  } else {
    await db.insert(videos).values(data as typeof videos.$inferInsert);
  }
}

export async function deleteVideo(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(videos).where(eq(videos.id, id));
}

// ─── Events ──────────────────────────────────────────────────────────────────

export async function getEvents(from?: Date) {
  const db = await getDb();
  if (!db) return [];
  const conditions = [eq(events.isPublished, true)];
  if (from) conditions.push(gte(events.startAt, from));
  return db.select().from(events).where(and(...conditions)).orderBy(events.startAt);
}

export async function getAllEvents() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(events).orderBy(events.startAt);
}

export async function upsertEvent(data: Partial<typeof events.$inferInsert> & { id?: number }) {
  const db = await getDb();
  if (!db) return;
  if (data.id) {
    const { id, ...rest } = data;
    await db.update(events).set(rest).where(eq(events.id, id));
  } else {
    await db.insert(events).values(data as typeof events.$inferInsert);
  }
}

export async function deleteEvent(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(events).where(eq(events.id, id));
}

// ─── External Links ───────────────────────────────────────────────────────────

export async function getExternalLinks() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(externalLinks).where(eq(externalLinks.isPublished, true)).orderBy(externalLinks.category, externalLinks.sortOrder);
}

export async function getAllExternalLinks() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(externalLinks).orderBy(externalLinks.category, externalLinks.sortOrder);
}

export async function upsertExternalLink(data: Partial<typeof externalLinks.$inferInsert> & { id?: number }) {
  const db = await getDb();
  if (!db) return;
  if (data.id) {
    const { id, ...rest } = data;
    await db.update(externalLinks).set(rest).where(eq(externalLinks.id, id));
  } else {
    await db.insert(externalLinks).values(data as typeof externalLinks.$inferInsert);
  }
}

export async function deleteExternalLink(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(externalLinks).where(eq(externalLinks.id, id));
}

// ─── Managed Images ───────────────────────────────────────────────────────────

export async function getManagedImages() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(managedImages);
}

export async function getManagedImageBySlot(slot: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(managedImages).where(eq(managedImages.slot, slot)).limit(1);
  return result[0];
}

export async function upsertManagedImage(slot: string, label: string, imageUrl: string, imageKey?: string) {
  const db = await getDb();
  if (!db) return;
  await db
    .insert(managedImages)
    .values({ slot, label, imageUrl, imageKey })
    .onDuplicateKeyUpdate({ set: { imageUrl, imageKey } });
}

// ─── Logs ─────────────────────────────────────────────────────────────────────

export async function recordLoginLog(userId: number, ipAddress?: string, userAgent?: string) {
  const db = await getDb();
  if (!db) return;
  await db.insert(loginLogs).values({ userId, ipAddress, userAgent });
}

export async function recordPageView(userId: number, pageName: string, pageUrl: string) {
  const db = await getDb();
  if (!db) return;
  await db.insert(pageViews).values({ userId, pageName, pageUrl });
}

export async function recordVideoView(userId: number, videoId: number) {
  const db = await getDb();
  if (!db) return;
  // 既存レコードがない場合のみ初回記録を挿入
  const existing = await db
    .select({ id: videoViews.id })
    .from(videoViews)
    .where(and(eq(videoViews.userId, userId), eq(videoViews.videoId, videoId)))
    .limit(1);
  if (existing.length === 0) {
    await db.insert(videoViews).values({ userId, videoId, lastPosition: 0, duration: 0, progressPct: 0, completed: "no" });
  }
}

/** 視聴進捗を保存（アップサート） */
export async function saveVideoProgress(
  userId: number,
  videoId: number,
  lastPosition: number,
  duration: number
) {
  const db = await getDb();
  if (!db) return;
  const progressPct = duration > 0 ? Math.min(100, Math.round((lastPosition / duration) * 100)) : 0;
  const completed = progressPct >= 90 ? "yes" : "no";
  const existing = await db
    .select({ id: videoViews.id })
    .from(videoViews)
    .where(and(eq(videoViews.userId, userId), eq(videoViews.videoId, videoId)))
    .limit(1);
  if (existing.length > 0) {
    await db
      .update(videoViews)
      .set({ lastPosition, duration, progressPct, completed, updatedAt: new Date() })
      .where(and(eq(videoViews.userId, userId), eq(videoViews.videoId, videoId)));
  } else {
    await db.insert(videoViews).values({ userId, videoId, lastPosition, duration, progressPct, completed });
  }
}

/** ユーザーの特定動画の視聴進捗を取得 */
export async function getVideoProgress(userId: number, videoId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db
    .select()
    .from(videoViews)
    .where(and(eq(videoViews.userId, userId), eq(videoViews.videoId, videoId)))
    .limit(1);
  return result[0] ?? null;
}

/** ユーザーの全動画の視聴進捗一覧を取得 */
export async function getAllVideoProgressByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(videoViews)
    .where(eq(videoViews.userId, userId))
    .orderBy(desc(videoViews.updatedAt));
}

/** 管理者用：全会員の視聴進捗一覧 */
export async function getAllVideoProgressAdmin() {
  const db = await getDb();
  if (!db) return [];
  return db
    .select({
      id: videoViews.id,
      userId: videoViews.userId,
      videoId: videoViews.videoId,
      lastPosition: videoViews.lastPosition,
      duration: videoViews.duration,
      progressPct: videoViews.progressPct,
      completed: videoViews.completed,
      viewedAt: videoViews.viewedAt,
      updatedAt: videoViews.updatedAt,
      userName: users.name,
      userEmail: users.email,
      videoTitle: videos.title,
    })
    .from(videoViews)
    .leftJoin(users, eq(videoViews.userId, users.id))
    .leftJoin(videos, eq(videoViews.videoId, videos.id))
    .orderBy(desc(videoViews.updatedAt))
    .limit(500);
}

export async function getLoginLogsByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(loginLogs).where(eq(loginLogs.userId, userId)).orderBy(desc(loginLogs.loginAt)).limit(50);
}

export async function getPageViewsByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(pageViews).where(eq(pageViews.userId, userId)).orderBy(desc(pageViews.viewedAt)).limit(100);
}

export async function getAllPageViews() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(pageViews).orderBy(desc(pageViews.viewedAt)).limit(500);
}

export async function getPageViewStats() {
  const db = await getDb();
  if (!db) return [];
  return db
    .select({ pageName: pageViews.pageName, count: sql<number>`COUNT(*)` })
    .from(pageViews)
    .groupBy(pageViews.pageName)
    .orderBy(desc(sql`COUNT(*)`));
}

export async function getVideoViewStats() {
  const db = await getDb();
  if (!db) return [];
  return db
    .select({ videoId: videoViews.videoId, count: sql<number>`COUNT(*)` })
    .from(videoViews)
    .groupBy(videoViews.videoId)
    .orderBy(desc(sql`COUNT(*)`));
}

export async function getDashboardStats() {
  const db = await getDb();
  if (!db) return { totalUsers: 0, totalPageViews: 0, totalVideoViews: 0, totalEvents: 0 };
  const [userCount] = await db.select({ count: sql<number>`COUNT(*)` }).from(users);
  const [pvCount] = await db.select({ count: sql<number>`COUNT(*)` }).from(pageViews);
  const [vvCount] = await db.select({ count: sql<number>`COUNT(*)` }).from(videoViews);
  const [evCount] = await db.select({ count: sql<number>`COUNT(*)` }).from(events);
  return {
    totalUsers: userCount?.count ?? 0,
    totalPageViews: pvCount?.count ?? 0,
    totalVideoViews: vvCount?.count ?? 0,
    totalEvents: evCount?.count ?? 0,
  };
}

export async function deleteInvitation(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(invitations).where(eq(invitations.id, id));
}

// ── Testimonials ──────────────────────────────────────────────────────────
export async function getTestimonials(onlyPublished = true) {
  const db = await getDb();
  if (!db) return [];
  const query = db.select().from(testimonials);
  if (onlyPublished) {
    return query.where(eq(testimonials.isPublished, "published")).orderBy(testimonials.sortOrder, testimonials.createdAt);
  }
  return query.orderBy(testimonials.sortOrder, testimonials.createdAt);
}

export async function upsertTestimonial(data: InsertTestimonial & { id?: number }) {
  const db = await getDb();
  if (!db) return;
  if (data.id) {
    const { id, ...rest } = data;
    await db.update(testimonials).set({ ...rest, updatedAt: new Date() }).where(eq(testimonials.id, id));
  } else {
    await db.insert(testimonials).values(data);
  }
}

export async function deleteTestimonial(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(testimonials).where(eq(testimonials.id, id));
}

// ─── Topics ────────────────────────────────────────────────────────────────

export async function getTopics(publishedOnly = true) {
  const db = await getDb();
  if (!db) return [];
  const query = db.select().from(topics);
  if (publishedOnly) {
    return query.where(eq(topics.isPublished, "published")).orderBy(topics.sortOrder, topics.createdAt);
  }
  return query.orderBy(topics.sortOrder, topics.createdAt);
}

export async function upsertTopic(data: InsertTopic & { id?: number }) {
  const db = await getDb();
  if (!db) return;
  if (data.id) {
    const { id, ...rest } = data;
    await db.update(topics).set({ ...rest, updatedAt: new Date() }).where(eq(topics.id, id));
  } else {
    await db.insert(topics).values(data);
  }
}

export async function deleteTopic(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(topics).where(eq(topics.id, id));
}
