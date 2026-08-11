# NatuLabo Portal — 開発者ガイド

> このドキュメントは、NatuLabo Portalの開発・保守を行う開発者向けの技術ガイドです。

---

## 1. 開発環境のセットアップ

```bash
# リポジトリのクローン
git clone <repository-url>
cd natulabo-portal

# 依存パッケージのインストール
pnpm install

# 開発サーバーの起動
pnpm dev
```

開発サーバーは `http://localhost:3000` で起動します。

---

## 2. 環境変数

以下の環境変数はManus platformから自動注入されます（手動設定不要）:

| 変数名 | 説明 |
|-------|------|
| `DATABASE_URL` | MySQL/TiDB接続文字列 |
| `JWT_SECRET` | セッションCookie署名シークレット |
| `VITE_APP_ID` | Manus OAuth アプリケーションID |
| `OAUTH_SERVER_URL` | Manus OAuth バックエンドURL |
| `VITE_OAUTH_PORTAL_URL` | Manus ログインポータルURL |
| `OWNER_OPEN_ID` | オーナーのOpenID |
| `OWNER_NAME` | オーナー名 |
| `BUILT_IN_FORGE_API_URL` | Manus built-in API URL |
| `BUILT_IN_FORGE_API_KEY` | Manus built-in API キー（サーバーサイド） |
| `VITE_FRONTEND_FORGE_API_KEY` | Manus built-in API キー（フロントエンド） |
| `VITE_FRONTEND_FORGE_API_URL` | Manus built-in API URL（フロントエンド） |

---

## 3. ディレクトリ構成

```
natulabo-portal/
├── client/
│   ├── index.html              # Google Fonts読み込み（Noto Serif JP, Cormorant Garamond）
│   └── src/
│       ├── App.tsx             # ルート定義
│       ├── index.css           # グローバルCSSテーマ（カラートークン）
│       ├── main.tsx            # Reactエントリーポイント
│       ├── const.ts            # 定数（getLoginUrl等）
│       ├── _core/hooks/
│       │   └── useAuth.ts      # 認証フック
│       ├── components/
│       │   ├── MemberLayout.tsx    # 会員向けレイアウト
│       │   ├── AdminLayout.tsx     # 管理者向けレイアウト
│       │   ├── YouTubePlayer.tsx   # YouTube iframe APIプレイヤー
│       │   └── ui/             # shadcn/uiコンポーネント
│       ├── hooks/
│       │   └── usePageView.ts  # ページビュー自動記録フック
│       ├── lib/
│       │   └── trpc.ts         # tRPCクライアント設定
│       └── pages/
│           ├── Home.tsx        # ランディングページ
│           ├── Login.tsx       # ログイン
│           ├── Register.tsx    # 会員登録
│           ├── Dashboard.tsx   # ダッシュボード
│           ├── Setup.tsx       # はじめに
│           ├── Contact.tsx     # 問い合わせ
│           ├── Videos.tsx      # 動画ライブラリ
│           ├── CalendarPage.tsx # カレンダー
│           ├── Links.tsx       # 外部リンク
│           ├── Testimonials.tsx # 体験談
│           ├── Recipes.tsx     # レシピ集
│           ├── Profile.tsx     # プロフィール
│           └── admin/          # 管理画面ページ群
├── drizzle/
│   ├── schema.ts               # DBスキーマ定義
│   ├── relations.ts            # テーブルリレーション
│   └── migrations/             # マイグレーションSQL
├── server/
│   ├── db.ts                   # DBクエリヘルパー
│   ├── routers.ts              # tRPCルーター
│   ├── storage.ts              # S3ストレージヘルパー
│   └── _core/                  # フレームワーク基盤（編集禁止）
├── shared/
│   ├── const.ts                # 共有定数
│   └── types.ts                # 共有型定義
└── docs/                       # プロジェクトドキュメント
```

---

## 4. 新機能の追加手順

新しい機能を追加する際は、以下の順序で作業します:

### Step 1: DBスキーマの更新

```typescript
// drizzle/schema.ts に新テーブルを追加
export const newFeature = mysqlTable("new_feature", {
  id: int("id").autoincrement().primaryKey(),
  // ... カラム定義
});
```

### Step 2: マイグレーションの実行

```bash
# マイグレーションSQLを生成
pnpm drizzle-kit generate

# 生成されたSQLをwebdev_execute_sqlで実行
```

### Step 3: DBクエリヘルパーの追加

```typescript
// server/db.ts に関数を追加
export async function getNewFeatures() {
  return db.select().from(newFeature);
}
```

### Step 4: tRPCルーターの追加

```typescript
// server/routers.ts に追加
newFeature: {
  list: protectedProcedure.query(async () => {
    return getNewFeatures();
  }),
}
```

### Step 5: フロントエンドの実装

```typescript
// client/src/pages/NewFeature.tsx
const { data } = trpc.newFeature.list.useQuery();
```

### Step 6: ルートの追加

```typescript
// client/src/App.tsx
<Route path="/new-feature" component={NewFeature} />
```

---

## 5. YouTube動画の追加方法

1. YouTubeの動画URLを取得（例: `https://www.youtube.com/watch?v=XXXXXXXXX`）
2. 管理画面 → 動画管理 → 新規追加
3. URLを貼り付けて保存

**YouTube iframe APIの仕組み**:
- `YouTubePlayer.tsx` が YouTube iframe API を使って動画を埋め込む
- 10秒ごとに視聴位置を `video_views` テーブルに保存
- 次回再生時、30秒以上視聴済みの場合は「続きから再生」ダイアログを表示
- 90%以上視聴で `completed: 'yes'` に更新

---

## 6. 静的アセットの管理

画像・動画などの静的ファイルは必ずManus Storageを使用します:

```bash
# アップロード
manus-upload-file --webdev /path/to/file.jpg
# → /manus-storage/file_XXXXXXXX.jpg のURLが返される
```

返されたURLをコードに直接記述します。ローカルファイルをプロジェクト内に置くとデプロイタイムアウトの原因になります。

---

## 7. テストの実行

```bash
# TypeScriptチェック
pnpm check

# Vitestテスト実行
pnpm test
```

テストファイル:
- `server/auth.logout.test.ts`: ログアウトAPIのテスト
- `server/natulabo.test.ts`: NatuLabo固有機能のテスト

---

## 8. デプロイ

1. `webdev_save_checkpoint` でチェックポイントを保存
2. 管理UIの「Publish」ボタンをクリック
3. `https://natulabo-jgdafshb.manus.space` で公開

> **注意**: デプロイはManus Autoscale（サーバーレス）を使用しています。非アクティブ時はインスタンスがスリープします。
