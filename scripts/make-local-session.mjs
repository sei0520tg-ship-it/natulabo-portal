#!/usr/bin/env node
/**
 * make-local-session.mjs
 *
 * ローカル確認用のセッションCookieを発行する。
 *
 * 本番と同じ仕組み（jose の HS256 JWT）を使うので、認証まわりの挙動も
 * そのまま再現できる。Manus に一切依存しない。
 *
 * 使い方:
 *   node scripts/make-local-session.mjs            # トークンだけ出力
 *   node scripts/make-local-session.mjs --snippet  # ブラウザに貼るコードを出力
 */
import "dotenv/config";
import { SignJWT } from "jose";

const openId = process.env.OWNER_OPEN_ID || "local-admin";
const secret = process.env.JWT_SECRET;
if (!secret) {
  console.error("JWT_SECRET が未設定です（.env を確認してください）");
  process.exit(1);
}

const token = await new SignJWT({
  openId,
  appId: process.env.VITE_APP_ID || "local",
  name: "管理者（ローカル確認用）",
})
  .setProtectedHeader({ alg: "HS256", typ: "JWT" })
  .setExpirationTime(Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30)
  .sign(new TextEncoder().encode(secret));

if (process.argv.includes("--snippet")) {
  console.log(`document.cookie = "app_session_id=${token}; path=/; max-age=2592000"; location.href = "/dashboard";`);
} else {
  console.log(token);
}
