import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createPublicCtx(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => {} } as unknown as TrpcContext["res"],
  };
}

function createUserCtx(): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "test-user",
      email: "test@example.com",
      name: "テストユーザー",
      loginMethod: "manus",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => {} } as unknown as TrpcContext["res"],
  };
}

function createAdminCtx(): TrpcContext {
  return {
    user: {
      id: 99,
      openId: "admin-user",
      email: "admin@example.com",
      name: "管理者",
      loginMethod: "manus",
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => {} } as unknown as TrpcContext["res"],
  };
}

describe("auth.me", () => {
  it("未ログイン時はnullを返す", async () => {
    const caller = appRouter.createCaller(createPublicCtx());
    const result = await caller.auth.me();
    expect(result).toBeNull();
  });

  it("ログイン時はユーザー情報を返す", async () => {
    const caller = appRouter.createCaller(createUserCtx());
    const result = await caller.auth.me();
    expect(result).not.toBeNull();
    expect(result?.name).toBe("テストユーザー");
  });
});

describe("invitation.validate", () => {
  it("存在しない招待コードはinvalidを返す", async () => {
    const caller = appRouter.createCaller(createPublicCtx());
    const result = await caller.invitation.validate({ code: "INVALID_CODE_XYZ" });
    expect(result.valid).toBe(false);
  });
});

describe("admin procedures", () => {
  it("一般ユーザーはadmin.statsにアクセスできない", async () => {
    const caller = appRouter.createCaller(createUserCtx());
    await expect(caller.admin.stats()).rejects.toThrow();
  });
});
