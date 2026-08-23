import {
  boolean,
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

// ─────────────────────────────────────────────
// Users
// ─────────────────────────────────────────────
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  // Extended member fields
  address: text("address"),
  phone: varchar("phone", { length: 32 }),
  brandRegisteredAt: timestamp("brandRegisteredAt"),
  siteRegisteredAt: timestamp("siteRegisteredAt").defaultNow(),
  invitationCode: varchar("invitationCode", { length: 64 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─────────────────────────────────────────────
// Invitations
// ─────────────────────────────────────────────
export const invitations = mysqlTable("invitations", {
  id: int("id").autoincrement().primaryKey(),
  code: varchar("code", { length: 64 }).notNull().unique(),
  createdBy: int("createdBy"), // admin user id
  usedBy: int("usedBy"),       // user id who used it
  usedAt: timestamp("usedAt"),
  expiresAt: timestamp("expiresAt"),
  maxUses: int("maxUses").default(1),
  useCount: int("useCount").default(0),
  note: text("note"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Invitation = typeof invitations.$inferSelect;

// ─────────────────────────────────────────────
// Setup Steps (初期設定フロー)
// ─────────────────────────────────────────────
export const setupSteps = mysqlTable("setup_steps", {
  id: int("id").autoincrement().primaryKey(),
  sortOrder: int("sortOrder").default(0).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  videoUrl: text("videoUrl"),
  imageKey: text("imageKey"),   // S3 key
  imageUrl: text("imageUrl"),   // display URL
  linkUrl: text("linkUrl"),
  linkLabel: varchar("linkLabel", { length: 128 }),
  isPublished: boolean("isPublished").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SetupStep = typeof setupSteps.$inferSelect;

// ─────────────────────────────────────────────
// Contact Items (問い合わせ窓口)
// ─────────────────────────────────────────────
export const contactItems = mysqlTable("contact_items", {
  id: int("id").autoincrement().primaryKey(),
  sortOrder: int("sortOrder").default(0).notNull(),
  category: varchar("category", { length: 64 }).notNull(), // LINE / medical / app / other
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  linkUrl: text("linkUrl"),
  linkLabel: varchar("linkLabel", { length: 128 }),
  iconName: varchar("iconName", { length: 64 }), // lucide icon name
  isPublished: boolean("isPublished").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ContactItem = typeof contactItems.$inferSelect;

// ─────────────────────────────────────────────
// Videos (学習動画ライブラリ)
// ─────────────────────────────────────────────
export const videos = mysqlTable("videos", {
  id: int("id").autoincrement().primaryKey(),
  category: varchar("category", { length: 128 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  videoUrl: text("videoUrl").notNull(), // Google Drive / YouTube / etc.
  thumbnailUrl: text("thumbnailUrl"),
  isLatest: boolean("isLatest").default(false).notNull(),
  isPublished: boolean("isPublished").default(true).notNull(),
  sortOrder: int("sortOrder").default(0).notNull(),
  // YouTube 自動同期用。手動登録した動画では null のまま。
  youtubeVideoId: varchar("youtubeVideoId", { length: 32 }).unique(),
  publishedAt: timestamp("publishedAt"), // YouTube 上の公開日時
  syncedAt: timestamp("syncedAt"),       // 最後に同期した日時
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Video = typeof videos.$inferSelect;

// ─────────────────────────────────────────────
// Events (イベント・講座カレンダー)
// ─────────────────────────────────────────────
export const events = mysqlTable("events", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 64 }).notNull(), // company / team / online / workshop / seminar / business / user
  startAt: timestamp("startAt").notNull(),
  endAt: timestamp("endAt"),
  location: varchar("location", { length: 255 }),
  formUrl: text("formUrl"), // Google Form URL
  // 複数グループ（なちゅらぼ公式 / 樹里エリー限定 など）の出し分け用。
  // 未設定なら全会員向けとして扱う。
  groupName: varchar("groupName", { length: 64 }),
  // スプレッドシート同期用。手動登録したイベントでは null のまま。
  // 「シート名:フォーム送信日時」で一意になる。
  sourceKey: varchar("sourceKey", { length: 191 }).unique(),
  syncedAt: timestamp("syncedAt"),
  isPublished: boolean("isPublished").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Event = typeof events.$inferSelect;

// ─────────────────────────────────────────────
// External Links (外部リンク集)
// ─────────────────────────────────────────────
export const externalLinks = mysqlTable("external_links", {
  id: int("id").autoincrement().primaryKey(),
  category: varchar("category", { length: 128 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  url: text("url").notNull(),
  isPublished: boolean("isPublished").default(true).notNull(),
  sortOrder: int("sortOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ExternalLink = typeof externalLinks.$inferSelect;

// ─────────────────────────────────────────────
// Managed Images (画像管理)
// ─────────────────────────────────────────────
export const managedImages = mysqlTable("managed_images", {
  id: int("id").autoincrement().primaryKey(),
  slot: varchar("slot", { length: 128 }).notNull().unique(), // e.g. "oil_dictionary", "prohibited_use"
  label: varchar("label", { length: 255 }).notNull(),
  imageKey: text("imageKey"),
  imageUrl: text("imageUrl"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ManagedImage = typeof managedImages.$inferSelect;

// ─────────────────────────────────────────────
// Login Logs (ログイン履歴)
// ─────────────────────────────────────────────
export const loginLogs = mysqlTable("login_logs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  loginAt: timestamp("loginAt").defaultNow().notNull(),
  ipAddress: varchar("ipAddress", { length: 64 }),
  userAgent: text("userAgent"),
});

export type LoginLog = typeof loginLogs.$inferSelect;

// ─────────────────────────────────────────────
// Page View Logs (閲覧ログ)
// ─────────────────────────────────────────────
export const pageViews = mysqlTable("page_views", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  pageName: varchar("pageName", { length: 128 }).notNull(),
  pageUrl: varchar("pageUrl", { length: 512 }).notNull(),
  viewedAt: timestamp("viewedAt").defaultNow().notNull(),
});

export type PageView = typeof pageViews.$inferSelect;

// ─────────────────────────────────────────────
// Video View Logs (動画視聴ログ)
// ─────────────────────────────────────────────
export const videoViews = mysqlTable("video_views", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  videoId: int("videoId").notNull(),
  lastPosition: int("lastPosition").default(0).notNull(), // 最後に視聴した位置（秒）
  duration: int("duration").default(0).notNull(),         // 動画の総尺（秒）
  progressPct: int("progressPct").default(0).notNull(),   // 視聴率（0〜100%）
  completed: mysqlEnum("completed", ["yes", "no"]).default("no").notNull(), // 90%以上で完了
  viewedAt: timestamp("viewedAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type VideoView = typeof videoViews.$inferSelect;
export type InsertVideoView = typeof videoViews.$inferInsert;

// 体験談テーブル
export const testimonials = mysqlTable("testimonials", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 200 }).notNull(),
  authorName: varchar("authorName", { length: 100 }).notNull(),
  authorLabel: varchar("authorLabel", { length: 100 }), // 例: "2児の母 / 愛用歴3年"
  category: varchar("category", { length: 50 }).notNull().default("健康"), // 健康・美容・メンタル・家族・その他
  content: text("content").notNull(),
  oilsUsed: text("oilsUsed"), // 使用したオイル（カンマ区切り）
  imageUrl: text("imageUrl"), // アイコン画像URL（任意）
  isPublished: mysqlEnum("isPublished", ["published", "draft"]).default("published").notNull(),
  sortOrder: int("sortOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Testimonial = typeof testimonials.$inferSelect;
export type InsertTestimonial = typeof testimonials.$inferInsert;

// トピックスカルーセルテーブル（ダッシュボード上部のお知らせスライダー）
export const topics = mysqlTable("topics", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 200 }).notNull(),
  body: text("body"),                                          // 本文（任意）
  imageUrl: text("imageUrl"),                                  // 背景画像URL（任意）
  buttonText: varchar("buttonText", { length: 100 }),         // ボタンラベル（任意）
  buttonUrl: text("buttonUrl"),                               // ボタンリンク先（任意）
  sortOrder: int("sortOrder").default(0).notNull(),
  isPublished: mysqlEnum("isPublished", ["published", "draft"]).default("published").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Topic = typeof topics.$inferSelect;
export type InsertTopic = typeof topics.$inferInsert;
