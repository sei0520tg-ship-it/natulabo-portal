# Manusからの移行手順

2026年9月1日、Manusのプロジェクトが消失したことを受けて作成。
**Manusに一切依存せず**、GitHubとClaude Codeだけでサイトを運用するための手順をまとめる。

---

## 1. 何が残っていて、何が失われたか

### 残っているもの（GitHubに全部ある）

- アプリのコード一式
- **動画180本の一覧**（`server/seed/natulaboVideos.ts`）— 管理画面のボタン1つで完全復元できる
- DBのテーブル定義（`drizzle/`）— 空のDBに対して流せば同じ構造が再現できる
- イベント連携、バックアップ道具、UIリニューアル

### 失われたもの（バックアップが取れなかったため）

| データ | 影響 |
| --- | --- |
| 会員アカウント | 再登録が必要 |
| 視聴進捗 | 復元不可 |
| イベント | スプレッドシート連携で再投入できる |
| 体験談・お知らせ・初期設定・問い合わせ窓口・外部リンク | 管理画面から再登録 |
| アップロード画像 | Manusストレージにあったため消失 |

---

## 2. Manus依存の棚卸しと対応

| 機能 | Manus依存 | 対応 | 状態 |
| --- | --- | --- | --- |
| セッション管理 | なし（自前JWT） | 対応不要 | ✅ |
| ロゴ表示 | あり | `BrandMark` が失敗時に自前SVGへ切替 | ✅ 対応済み |
| ホスティング | あり | Dockerfile を用意。どこでも動く | ✅ 準備済み |
| 定期実行 | あり（manus-heartbeat） | GitHub Actions へ | 未着手 |
| **ログインの入口** | **あり（Manus OAuth）** | **要作り直し** | ❌ 未着手 |
| 画像アップロード | あり（Forge API） | S3 / R2 へ（`@aws-sdk/client-s3` は依存済み） | 未着手 |
| データベース | 不明（接続情報ごと消失） | 新規に用意する | ❌ 未着手 |

**ログインが最大の障害。** これが無いと会員が誰も入れない。
ただしセッションの検証・発行はすべて自前実装（`server/_core/sdk.ts` の `createSessionToken` / `verifySession`）なので、
**差し替えるのは「本人確認をして openId を得る」入口だけ**で済む。

---

## 3. 移行先の構成（推奨）

| 役割 | 推奨 | 理由 |
| --- | --- | --- |
| ホスティング | Railway | GitHub連携で push するだけで自動デプロイ。Dockerfile をそのまま使える |
| データベース | Railway の MySQL | 同じ画面で完結し、接続情報が自動で環境変数に入る |
| 画像保存 | Cloudflare R2 | 無料枠が大きく、転送量課金が無い |
| ログイン | Google ログイン | 会員の多くがGoogleアカウントを持つ。招待コードの仕組みは既存のものを流用 |
| 定期実行 | GitHub Actions | 追加費用ゼロ |

---

## 4. 手順

### ステップ1: ホスティングとDBを用意する（要アカウント作成）

1. Railway にGitHubアカウントでサインアップ
2. 「New Project」→「Deploy from GitHub repo」→ `natulabo-portal` を選択
3. 同じプロジェクト内に「New」→「Database」→「MySQL」を追加
4. アプリ側の環境変数に、DBの `DATABASE_URL` を紐付ける

Dockerfile があるので、ビルド設定は不要。

### ステップ2: 環境変数を設定する

| 変数 | 値 | 必須 |
| --- | --- | --- |
| `DATABASE_URL` | Railway が自動で用意する | ○ |
| `JWT_SECRET` | 32文字以上のランダム文字列 | ○ |
| `OWNER_OPEN_ID` | 管理者にするアカウントの識別子 | ○ |
| `EVENT_SHEET_CSVS` | イベント連携用（任意） | |

`OAUTH_SERVER_URL` と `BUILT_IN_FORGE_API_*` は**設定しない**（Manus専用のため）。

### ステップ3: DBの構造を作る

```bash
DATABASE_URL='新しいDBのURL' pnpm run db:push
```

空のDBに対して実行するので、マイグレーションは最初から順に流れる。

### ステップ4: 動画180本を復元する

管理画面 `/admin/videos` の「180本をインポート」を押す。これで動画は完全に元通りになる。

### ステップ5: ログインを作り直す（別途）

Google ログインへの差し替え。ここだけは実装が必要。

差し替える範囲:
- `client/src/const.ts` の `getLoginUrl()` — 自前のログイン画面を指すようにする
- `server/_core/oauth.ts` の `/api/oauth/callback` — Googleから受け取った情報で `sdk.createSessionToken()` を呼ぶ
- `server/_core/sdk.ts` の `getUserInfoWithJwt` 経路 — DBを正とするように整理

`createSessionToken` / `verifySession` / Cookie の扱いは**そのまま使える**。

### ステップ6: 定期実行をGitHub Actionsへ

`/api/scheduled/*` の認証を、Manusのcron判定から共有シークレットに変更する。
そのうえで GitHub Actions のスケジュール実行から叩く。

---

## 5. 移行後に得られるもの

- **GitHubにpushすると自動でデプロイされる**。今の「Manusに指示 → Publishを押す」手作業が不要になる
- Claude Code から直接デプロイ状況を確認できる
- DBのバックアップを自分の手で取れる（`pnpm run db:backup`）
- 特定のサービスが落ちてもデータを失わない

---

## 6. 当面の運用（移行が終わるまで）

ローカルで開発サーバーを動かせば、**同じWi-Fi内のスマホからも確認できる**。

```bash
pnpm run dev
```

`http://<MacのIP>:3000` でアクセスする。IPは `ipconfig getifaddr en0` で確認。
公開ページ（トップ・ログイン・登録）はDBもログインも不要なため、この方法で見た目の確認ができる。
