# NatuLabo Portal — データベーススキーマ設計書

> **DB**: MySQL / TiDB  
> **ORM**: Drizzle ORM  
> **スキーマファイル**: `drizzle/schema.ts`

---

## テーブル一覧

| テーブル名 | 用途 |
|-----------|------|
| `users` | 会員情報 |
| `invitations` | 招待コード |
| `setup_steps` | 「はじめに」ステップ |
| `contact_items` | 問い合わせ窓口 |
| `videos` | 学習動画ライブラリ |
| `events` | イベント・カレンダー |
| `external_links` | 外部リンク集 |
| `managed_images` | 管理画像スロット |
| `login_logs` | ログイン履歴 |
| `page_views` | ページ閲覧ログ |
| `video_views` | 動画視聴ログ |
| `testimonials` | 体験談 |
| `topics` | トピックスカルーセル |

---

## テーブル詳細

### users（会員情報）

| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| id | INT | PK, AUTO_INCREMENT | 主キー |
| openId | VARCHAR(64) | NOT NULL, UNIQUE | Manus OAuth ID |
| name | TEXT | - | 氏名 |
| email | VARCHAR(320) | - | メールアドレス |
| loginMethod | VARCHAR(64) | - | ログイン方法 |
| role | ENUM('user','admin') | DEFAULT 'user' | 権限 |
| address | TEXT | - | 住所 |
| phone | VARCHAR(32) | - | 電話番号 |
| brandRegisteredAt | TIMESTAMP | - | dōTERRA登録日 |
| siteRegisteredAt | TIMESTAMP | DEFAULT NOW() | サイト登録日 |
| invitationCode | VARCHAR(64) | - | 使用した招待コード |
| createdAt | TIMESTAMP | DEFAULT NOW() | 作成日時 |
| updatedAt | TIMESTAMP | ON UPDATE NOW() | 更新日時 |
| lastSignedIn | TIMESTAMP | DEFAULT NOW() | 最終ログイン日時 |

### invitations（招待コード）

| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| id | INT | PK, AUTO_INCREMENT | 主キー |
| code | VARCHAR(64) | NOT NULL, UNIQUE | 招待コード |
| createdBy | INT | - | 発行した管理者ID |
| usedBy | INT | - | 使用した会員ID |
| usedAt | TIMESTAMP | - | 使用日時 |
| expiresAt | TIMESTAMP | - | 有効期限 |
| maxUses | INT | DEFAULT 1 | 最大使用回数 |
| useCount | INT | DEFAULT 0 | 使用回数 |
| note | TEXT | - | メモ |
| createdAt | TIMESTAMP | DEFAULT NOW() | 作成日時 |

### setup_steps（はじめにステップ）

| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| id | INT | PK | 主キー |
| sortOrder | INT | DEFAULT 0 | 表示順 |
| title | VARCHAR(255) | NOT NULL | タイトル |
| description | TEXT | - | 説明文 |
| videoUrl | TEXT | - | 動画URL |
| imageKey | TEXT | - | S3キー |
| imageUrl | TEXT | - | 表示URL |
| linkUrl | TEXT | - | リンクURL |
| linkLabel | VARCHAR(128) | - | リンクラベル |
| isPublished | BOOLEAN | DEFAULT true | 公開フラグ |
| createdAt | TIMESTAMP | DEFAULT NOW() | 作成日時 |
| updatedAt | TIMESTAMP | ON UPDATE NOW() | 更新日時 |

> **注記**: 7番目のステップとして「NFR購入方法」がDBに挿入済み。

### videos（学習動画ライブラリ）

| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| id | INT | PK | 主キー |
| category | VARCHAR(128) | NOT NULL | カテゴリ |
| title | VARCHAR(255) | NOT NULL | タイトル |
| description | TEXT | - | 説明 |
| videoUrl | TEXT | NOT NULL | YouTube URL等 |
| thumbnailUrl | TEXT | - | サムネイルURL |
| isLatest | BOOLEAN | DEFAULT false | 新着フラグ |
| isPublished | BOOLEAN | DEFAULT true | 公開フラグ |
| sortOrder | INT | DEFAULT 0 | 表示順 |
| createdAt | TIMESTAMP | DEFAULT NOW() | 作成日時 |
| updatedAt | TIMESTAMP | ON UPDATE NOW() | 更新日時 |

### video_views（動画視聴ログ）

| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| id | INT | PK | 主キー |
| userId | INT | NOT NULL | 会員ID |
| videoId | INT | NOT NULL | 動画ID |
| lastPosition | INT | DEFAULT 0 | 最後の再生位置（秒） |
| duration | INT | DEFAULT 0 | 動画総尺（秒） |
| progressPct | INT | DEFAULT 0 | 視聴率（0〜100） |
| completed | ENUM('yes','no') | DEFAULT 'no' | 完了フラグ（90%以上） |
| viewedAt | TIMESTAMP | DEFAULT NOW() | 初回視聴日時 |
| updatedAt | TIMESTAMP | ON UPDATE NOW() | 更新日時 |

### testimonials（体験談）

| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| id | INT | PK | 主キー |
| title | VARCHAR(200) | NOT NULL | タイトル |
| authorName | VARCHAR(100) | NOT NULL | 投稿者名 |
| authorLabel | VARCHAR(100) | - | 属性（例: 2児の母/愛用歴3年） |
| category | VARCHAR(50) | DEFAULT '健康' | カテゴリ（健康・美容・メンタル・家族・その他） |
| content | TEXT | NOT NULL | 本文 |
| oilsUsed | TEXT | - | 使用オイル（カンマ区切り） |
| imageUrl | TEXT | - | アイコン画像URL |
| isPublished | ENUM('published','draft') | DEFAULT 'published' | 公開状態 |
| sortOrder | INT | DEFAULT 0 | 表示順 |
| createdAt | TIMESTAMP | DEFAULT NOW() | 作成日時 |
| updatedAt | TIMESTAMP | ON UPDATE NOW() | 更新日時 |

### topics（トピックスカルーセル）

| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| id | INT | PK | 主キー |
| title | VARCHAR(200) | NOT NULL | タイトル |
| body | TEXT | - | 本文（任意） |
| imageUrl | TEXT | - | 背景画像URL（任意） |
| buttonText | VARCHAR(100) | - | ボタンラベル（任意） |
| buttonUrl | TEXT | - | ボタンリンク先（任意） |
| sortOrder | INT | DEFAULT 0 | 表示順 |
| isPublished | ENUM('published','draft') | DEFAULT 'published' | 公開状態 |
| createdAt | TIMESTAMP | DEFAULT NOW() | 作成日時 |
| updatedAt | TIMESTAMP | ON UPDATE NOW() | 更新日時 |

---

## ER図（テキスト表現）

```
users ──────────── invitations (createdBy / usedBy)
  │
  ├── login_logs (userId)
  ├── page_views (userId)
  └── video_views (userId, videoId) ── videos

setup_steps       （独立テーブル）
contact_items     （独立テーブル）
events            （独立テーブル）
external_links    （独立テーブル）
managed_images    （独立テーブル）
testimonials      （独立テーブル）
topics            （独立テーブル）
```

---

## マイグレーション履歴

| ファイル | 内容 |
|---------|------|
| 0000_*.sql | 初期テーブル作成（users, invitations, setup_steps, contact_items, videos, events, external_links, managed_images, login_logs, page_views） |
| 0001_*.sql | video_viewsテーブル追加 |
| 0002_*.sql | testimonialsテーブル追加 |
| 0003_*.sql | managed_imagesテーブル追加（重複分） |
| 0004_*.sql | topicsテーブル追加 |
