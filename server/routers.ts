import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { storagePut } from "./storage";
import * as db from "./db";

// Admin guard middleware
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "管理者権限が必要です" });
  }
  return next({ ctx });
});

export const appRouter = router({
  system: systemRouter,

  // ─── Auth ────────────────────────────────────────────────────────────────
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ─── Invitations ─────────────────────────────────────────────────────────
  invitation: router({
    validate: publicProcedure
      .input(z.object({ code: z.string() }))
      .query(async ({ input }) => {
        const inv = await db.getInvitationByCode(input.code);
        if (!inv) return { valid: false, reason: "招待コードが見つかりません" };
        if (inv.expiresAt && inv.expiresAt < new Date()) return { valid: false, reason: "招待コードの有効期限が切れています" };
        const maxUses = inv.maxUses ?? 1;
        const useCount = inv.useCount ?? 0;
        if (useCount >= maxUses) return { valid: false, reason: "招待コードの使用回数上限に達しています" };
        return { valid: true };
      }),
    list: adminProcedure.query(() => db.getAllInvitations()),
    create: adminProcedure
      .input(z.object({
        code: z.string().min(4),
        maxUses: z.number().optional(),
        expiresAt: z.date().optional(),
        note: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.createInvitation({ ...input, createdBy: ctx.user.id });
        return { success: true };
      }),
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteInvitation(input.id);
        return { success: true };
      }),
  }),

  // ─── Member Registration ──────────────────────────────────────────────────
  member: router({
    register: publicProcedure
      .input(z.object({
        invitationCode: z.string(),
        name: z.string().min(1),
        email: z.string().email(),
        phone: z.string().optional(),
        address: z.string().optional(),
        brandRegisteredAt: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const inv = await db.getInvitationByCode(input.invitationCode);
        if (!inv) throw new TRPCError({ code: "BAD_REQUEST", message: "招待コードが無効です" });
        if (inv.expiresAt && inv.expiresAt < new Date()) throw new TRPCError({ code: "BAD_REQUEST", message: "招待コードの有効期限が切れています" });
        const maxUses = inv.maxUses ?? 1;
        const useCount = inv.useCount ?? 0;
        if (useCount >= maxUses) throw new TRPCError({ code: "BAD_REQUEST", message: "招待コードの使用回数上限に達しています" });
        // If user is already logged in, update their profile
        if (ctx.user) {
          await db.updateUserProfile(ctx.user.id, {
            name: input.name,
            address: input.address,
            phone: input.phone,
            brandRegisteredAt: input.brandRegisteredAt ? new Date(input.brandRegisteredAt) : undefined,
          });
          await db.useInvitation(input.invitationCode, ctx.user.id);
        }
        return { success: true };
      }),
    updateProfile: protectedProcedure
      .input(z.object({
        name: z.string().optional(),
        address: z.string().optional(),
        phone: z.string().optional(),
        brandRegisteredAt: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.updateUserProfile(ctx.user.id, {
          name: input.name,
          address: input.address,
          phone: input.phone,
          brandRegisteredAt: input.brandRegisteredAt ? new Date(input.brandRegisteredAt) : undefined,
        });
        return { success: true };
      }),
  }),

  // ─── Logs ─────────────────────────────────────────────────────────────────
  log: router({
    pageView: protectedProcedure
      .input(z.object({ pageName: z.string(), pageUrl: z.string() }))
      .mutation(async ({ ctx, input }) => {
        await db.recordPageView(ctx.user.id, input.pageName, input.pageUrl);
        return { success: true };
      }),
    videoView: protectedProcedure
      .input(z.object({ videoId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.recordVideoView(ctx.user.id, input.videoId);
        return { success: true };
      }),
  }),

  // ─── Setup Steps ──────────────────────────────────────────────────────────
  setup: router({
    list: protectedProcedure.query(() => db.getSetupSteps()),
    adminList: adminProcedure.query(() => db.getAllSetupSteps()),
    upsert: adminProcedure
      .input(z.object({
        id: z.number().optional(),
        sortOrder: z.number().optional(),
        title: z.string(),
        description: z.string().optional(),
        videoUrl: z.string().optional(),
        imageUrl: z.string().optional(),
        imageKey: z.string().optional(),
        linkUrl: z.string().optional(),
        linkLabel: z.string().optional(),
        isPublished: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        await db.upsertSetupStep(input);
        return { success: true };
      }),
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteSetupStep(input.id);
        return { success: true };
      }),
  }),

  // ─── Contact Items ────────────────────────────────────────────────────────
  contact: router({
    list: protectedProcedure.query(() => db.getContactItems()),
    adminList: adminProcedure.query(() => db.getAllContactItems()),
    upsert: adminProcedure
      .input(z.object({
        id: z.number().optional(),
        sortOrder: z.number().optional(),
        category: z.string(),
        title: z.string(),
        description: z.string().optional(),
        linkUrl: z.string().optional(),
        linkLabel: z.string().optional(),
        iconName: z.string().optional(),
        isPublished: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        await db.upsertContactItem(input);
        return { success: true };
      }),
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteContactItem(input.id);
        return { success: true };
      }),
  }),

  // ─── Videos ───────────────────────────────────────────────────────────────
  video: router({
    list: protectedProcedure.query(() => db.getVideos()),
    adminList: adminProcedure.query(() => db.getAllVideos()),
    upsert: adminProcedure
      .input(z.object({
        id: z.number().optional(),
        category: z.string(),
        title: z.string(),
        description: z.string().optional(),
        videoUrl: z.string(),
        thumbnailUrl: z.string().optional(),
        isLatest: z.boolean().optional(),
        isPublished: z.boolean().optional(),
        sortOrder: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        await db.upsertVideo(input);
        return { success: true };
      }),
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteVideo(input.id);
        return { success: true };
      }),
    // 視聴進捗を保存（プレイヤーかず5秒ごとに呼び出す）
    saveProgress: protectedProcedure
      .input(z.object({
        videoId: z.number(),
        lastPosition: z.number(), // 秒
        duration: z.number(),     // 秒
      }))
      .mutation(async ({ ctx, input }) => {
        await db.saveVideoProgress(ctx.user.id, input.videoId, input.lastPosition, input.duration);
        return { success: true };
      }),
    // 特定動画の視聴進捗を取得（再生開始位置の後読み用）
    getProgress: protectedProcedure
      .input(z.object({ videoId: z.number() }))
      .query(async ({ ctx, input }) => {
        return db.getVideoProgress(ctx.user.id, input.videoId);
      }),
    // 自分の全動画視聴進捗一覧
    myProgress: protectedProcedure.query(({ ctx }) => db.getAllVideoProgressByUser(ctx.user.id)),
    // 管理者：全会員の視聴進捗一覧
    allProgress: adminProcedure.query(() => db.getAllVideoProgressAdmin()),
  }),

  // ─── Events ───────────────────────────────────────────────────────────────
  event: router({
    list: protectedProcedure
      .input(z.object({ from: z.date().optional() }).optional())
      .query(({ input }) => db.getEvents(input?.from)),
    adminList: adminProcedure.query(() => db.getAllEvents()),
    upsert: adminProcedure
      .input(z.object({
        id: z.number().optional(),
        title: z.string(),
        description: z.string().optional(),
        category: z.string(),
        startAt: z.date(),
        endAt: z.date().optional(),
        location: z.string().optional(),
        formUrl: z.string().optional(),
        isPublished: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        await db.upsertEvent(input);
        return { success: true };
      }),
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteEvent(input.id);
        return { success: true };
      }),
  }),

  // ─── External Links ───────────────────────────────────────────────────────
  link: router({
    list: protectedProcedure.query(() => db.getExternalLinks()),
    adminList: adminProcedure.query(() => db.getAllExternalLinks()),
    upsert: adminProcedure
      .input(z.object({
        id: z.number().optional(),
        category: z.string(),
        title: z.string(),
        description: z.string().optional(),
        url: z.string(),
        isPublished: z.boolean().optional(),
        sortOrder: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        await db.upsertExternalLink(input);
        return { success: true };
      }),
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteExternalLink(input.id);
        return { success: true };
      }),
  }),

  // ─── Managed Images ───────────────────────────────────────────────────────
  image: router({
    list: protectedProcedure.query(() => db.getManagedImages()),
    upload: adminProcedure
      .input(z.object({
        slot: z.string(),
        label: z.string(),
        base64: z.string(),
        mimeType: z.string(),
      }))
      .mutation(async ({ input }) => {
        const buffer = Buffer.from(input.base64, "base64");
        const key = `images/${input.slot}-${Date.now()}`;
        const { url } = await storagePut(key, buffer, input.mimeType);
        await db.upsertManagedImage(input.slot, input.label, url, key);
        return { success: true, url };
      }),
    updateUrl: adminProcedure
      .input(z.object({ slot: z.string(), label: z.string(), imageUrl: z.string() }))
      .mutation(async ({ input }) => {
        await db.upsertManagedImage(input.slot, input.label, input.imageUrl);
        return { success: true };
      }),
  }),

  // ─── Testimonials ──────────────────────────────────────────────────────────
  testimonial: router({
    list: publicProcedure.query(() => db.getTestimonials(true)),
    adminList: adminProcedure.query(() => db.getTestimonials(false)),
    upsert: adminProcedure
      .input(
        z.object({
          id: z.number().optional(),
          title: z.string().min(1),
          authorName: z.string().min(1),
          authorLabel: z.string().optional(),
          content: z.string().min(1),
          category: z.string().default("健康"),
          oilsUsed: z.string().optional(),
          imageUrl: z.string().optional(),
          isPublished: z.enum(["published", "draft"]).default("draft"),
          sortOrder: z.number().default(0),
        })
      )
      .mutation(async ({ input }) => {
        await db.upsertTestimonial(input);
        return { success: true };
      }),
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteTestimonial(input.id);
        return { success: true };
      }),
  }),
  // ─── Topics ──────────────────────────────────────────────────────────────
  topic: router({
    list: protectedProcedure.query(() => db.getTopics(true)),
    adminList: adminProcedure.query(() => db.getTopics(false)),
    upsert: adminProcedure
      .input(
        z.object({
          id: z.number().optional(),
          title: z.string().min(1).max(200),
          body: z.string().optional(),
          imageUrl: z.string().optional(),
          buttonText: z.string().optional(),
          buttonUrl: z.string().optional(),
          sortOrder: z.number().default(0),
          isPublished: z.enum(["published", "draft"]).default("published"),
        })
      )
      .mutation(async ({ input }) => {
        await db.upsertTopic(input);
        return { success: true };
      }),
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteTopic(input.id);
        return { success: true };
      }),
  }),

  // ─── Admin ────────────────────────────────────────────────────────────────
  admin: router({
    stats: adminProcedure.query(() => db.getDashboardStats()),
    users: adminProcedure.query(() => db.getAllUsers()),
    userDetail: adminProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const user = await db.getUserById(input.id);
        const loginHistory = await db.getLoginLogsByUser(input.id);
        const pageHistory = await db.getPageViewsByUser(input.id);
        return { user, loginHistory, pageHistory };
      }),
    setRole: adminProcedure
      .input(z.object({ userId: z.number(), role: z.enum(["user", "admin"]) }))
      .mutation(async ({ input }) => {
        await db.setUserRole(input.userId, input.role);
        return { success: true };
      }),
    pageViewStats: adminProcedure.query(() => db.getPageViewStats()),
    videoViewStats: adminProcedure.query(() => db.getVideoViewStats()),
    allPageViews: adminProcedure.query(() => db.getAllPageViews()),
  }),
});

export type AppRouter = typeof appRouter;
