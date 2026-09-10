export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

/**
 * ログイン画面のURL。
 *
 * 以前は Manus のログインポータルへ組み立てたURLを返していたが、
 * Manus を廃止し、メール＋パスワードによる自前のログイン画面に切り替えた。
 * 呼び出し側は変更せずに済むよう、関数の形は保っている。
 */
export const getLoginUrl = () => "/login";
