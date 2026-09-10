import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword, MIN_PASSWORD_LENGTH } from "./password";

describe("パスワードのハッシュ化と照合", () => {
  it("正しいパスワードで照合が通る", async () => {
    const stored = await hashPassword("natulabo1234");
    expect(await verifyPassword("natulabo1234", stored)).toBe(true);
  });

  it("誤ったパスワードは通らない", async () => {
    const stored = await hashPassword("natulabo1234");
    expect(await verifyPassword("natulabo1235", stored)).toBe(false);
    expect(await verifyPassword("", stored)).toBe(false);
  });

  it("同じパスワードでも毎回異なるハッシュになる（ソルトが効いている）", async () => {
    const a = await hashPassword("natulabo1234");
    const b = await hashPassword("natulabo1234");
    expect(a).not.toBe(b);
    expect(await verifyPassword("natulabo1234", a)).toBe(true);
    expect(await verifyPassword("natulabo1234", b)).toBe(true);
  });

  it("保存値にパラメータが含まれ、後から強度を上げても検証できる形式である", async () => {
    const stored = await hashPassword("natulabo1234");
    const parts = stored.split("$");
    expect(parts[0]).toBe("scrypt");
    expect(parts).toHaveLength(6);
  });

  it("短すぎるパスワードは拒否する", async () => {
    await expect(hashPassword("a".repeat(MIN_PASSWORD_LENGTH - 1))).rejects.toThrow();
  });

  it("保存値が無い・壊れている場合は例外にせず false を返す", async () => {
    expect(await verifyPassword("natulabo1234", null)).toBe(false);
    expect(await verifyPassword("natulabo1234", undefined)).toBe(false);
    expect(await verifyPassword("natulabo1234", "")).toBe(false);
    expect(await verifyPassword("natulabo1234", "壊れた値")).toBe(false);
    expect(await verifyPassword("natulabo1234", "bcrypt$1$2$3$4$5")).toBe(false);
  });

  it("全角と半角の表記ゆれを正規化して扱う", async () => {
    // 日本語入力の全角英数で登録してしまっても、半角で入れ直せるようにする
    const stored = await hashPassword("ｎａｔｕｌａｂｏ１２３４");
    expect(await verifyPassword("natulabo1234", stored)).toBe(true);
  });
});
