/**
 * password.ts
 *
 * パスワードのハッシュ化と照合。
 *
 * Manus の OAuth を廃止したため、本人確認を自前で行う必要が生じた。
 * 外部サービスにも追加ライブラリにも依存しないよう、Node 標準の scrypt を使う。
 *
 * 保存形式: `scrypt$<N>$<r>$<p>$<salt(hex)>$<hash(hex)>`
 *   パラメータを一緒に保存しておくことで、将来コストを上げても
 *   既存のパスワードをそのまま検証できる。
 */

import { randomBytes, scrypt as scryptCb, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCb) as (
  password: string | Buffer,
  salt: string | Buffer,
  keylen: number,
  options: { N: number; r: number; p: number; maxmem: number }
) => Promise<Buffer>;

/** コストパラメータ。N を上げるほど総当たりに強くなるがログインが遅くなる。 */
const N = 16384;
const R = 8;
const P = 1;
const KEYLEN = 64;
// scrypt は既定の maxmem(32MB) を超えるとエラーになるため明示的に広げる
const MAXMEM = 64 * 1024 * 1024;

export const MIN_PASSWORD_LENGTH = 8;

export async function hashPassword(password: string): Promise<string> {
  if (password.length < MIN_PASSWORD_LENGTH) {
    throw new Error(`パスワードは${MIN_PASSWORD_LENGTH}文字以上にしてください`);
  }
  const salt = randomBytes(16);
  const hash = await scrypt(password.normalize("NFKC"), salt, KEYLEN, { N, r: R, p: P, maxmem: MAXMEM });
  return `scrypt$${N}$${R}$${P}$${salt.toString("hex")}$${hash.toString("hex")}`;
}

/**
 * 照合。
 * 保存値が壊れている・未設定の場合は false を返す（例外にしない）。
 * 比較は timingSafeEqual で行い、応答時間から情報が漏れないようにする。
 */
export async function verifyPassword(password: string, stored: string | null | undefined): Promise<boolean> {
  if (!stored) return false;
  const parts = stored.split("$");
  if (parts.length !== 6 || parts[0] !== "scrypt") return false;

  const [, nRaw, rRaw, pRaw, saltHex, hashHex] = parts;
  const n = Number(nRaw);
  const r = Number(rRaw);
  const p = Number(pRaw);
  if (!Number.isFinite(n) || !Number.isFinite(r) || !Number.isFinite(p)) return false;

  let expected: Buffer;
  try {
    expected = Buffer.from(hashHex, "hex");
  } catch {
    return false;
  }
  if (expected.length === 0) return false;

  try {
    const actual = await scrypt(
      password.normalize("NFKC"),
      Buffer.from(saltHex, "hex"),
      expected.length,
      { N: n, r, p, maxmem: MAXMEM }
    );
    return actual.length === expected.length && timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}
