# NatuLabo Portal — 画面一覧・ページ構成

> **ルーター**: wouter  
> **レイアウト**: MemberLayout（会員）/ AdminLayout（管理者）/ 独立（ランディング・ログイン）

---

## 公開ページ（認証不要）

| パス | ファイル | 説明 |
|------|---------|------|
| `/` | `Home.tsx` | ランディングページ。森林ループ動画背景のヒーローセクション、About、Features、CTA |
| `/login` | `Login.tsx` | ログイン画面。NatuLaboロゴ＋Manus OAuthボタン |
| `/register` | `Register.tsx` | 会員登録画面。招待コード確認→プロフィール入力の2ステップ |

---

## 会員ページ（ログイン必須・MemberLayout）

| パス | ファイル | 説明 |
|------|---------|------|
| `/dashboard` | `Dashboard.tsx` | ダッシュボード。トピックスカルーセル＋メニューグリッド＋ウェルカムバナー |
| `/setup` | `Setup.tsx` | はじめに（初期設定フロー）。7ステップのアコーディオン形式 |
| `/contact` | `Contact.tsx` | 問い合わせ窓口。カテゴリ別リンクカード |
| `/videos` | `Videos.tsx` | 学習動画ライブラリ。YouTube iframe API、視聴進捗・続きから再生 |
| `/calendar` | `CalendarPage.tsx` | イベントカレンダー。月次カレンダー＋イベント一覧 |
| `/links` | `Links.tsx` | 外部リンク集。カテゴリ別リンクカード |
| `/testimonials` | `Testimonials.tsx` | 体験談一覧。カテゴリフィルター＋カード形式 |
| `/recipes` | `Recipes.tsx` | クラフトレシピ集。カテゴリタブ＋カード＋詳細モーダル＋検索 |
| `/profile` | `Profile.tsx` | プロフィール編集 |

---

## 管理画面（管理者のみ・AdminLayout）

| パス | ファイル | 説明 |
|------|---------|------|
| `/admin` | `AdminDashboard.tsx` | 管理ダッシュボード。統計サマリー |
| `/admin/users` | `AdminUsers.tsx` | 会員管理。一覧・ロール変更・削除 |
| `/admin/invitations` | `AdminInvitations.tsx` | 招待コード管理。発行・一覧・削除 |
| `/admin/videos` | `AdminVideos.tsx` | 動画管理。追加・編集・削除・公開切替 |
| `/admin/events` | `AdminEvents.tsx` | イベント管理。追加・編集・削除 |
| `/admin/links` | `AdminLinks.tsx` | 外部リンク管理。追加・編集・削除 |
| `/admin/setup` | `AdminSetup.tsx` | 初期設定ステップ管理 |
| `/admin/contact` | `AdminContact.tsx` | 問い合わせ窓口管理 |
| `/admin/images` | `AdminImages.tsx` | 画像スロット管理。S3アップロード |
| `/admin/logs` | `AdminLogs.tsx` | 閲覧ログ・ログイン履歴・動画視聴ログ |
| `/admin/testimonials` | `AdminTestimonials.tsx` | 体験談管理。追加・編集・削除・公開切替 |
| `/admin/topics` | `AdminTopics.tsx` | トピックス管理。追加・編集・削除・公開切替 |

---

## コンポーネント一覧

| ファイル | 説明 |
|---------|------|
| `MemberLayout.tsx` | 会員向けレイアウト。モバイルボトムナビ＋デスクトップサイドバー＋ロゴ |
| `AdminLayout.tsx` | 管理者向けレイアウト。サイドバーナビ |
| `YouTubePlayer.tsx` | YouTube iframe APIプレイヤー。エラーハンドリング・視聴進捗保存 |

---

## ナビゲーション構成（MemberLayout）

モバイルボトムナビ（スマートフォン）とデスクトップサイドバーの両方に以下の項目が表示されます:

1. ホーム（Dashboard）
2. はじめに（Setup）
3. お問い合わせ（Contact）
4. 動画（Videos）
5. 体験談（Testimonials）
6. レシピ（Recipes）
7. カレンダー（Calendar）
8. リンク（Links）
9. プロフィール（Profile）

---

## 画面遷移フロー

```
[ランディング /]
    │
    ├── [ログイン /login] → Manus OAuth → [ダッシュボード /dashboard]
    │                                          │
    └── [会員登録 /register]                   ├── /setup
         招待コード確認                         ├── /contact
         ↓                                    ├── /videos
         プロフィール入力                       ├── /calendar
         ↓                                    ├── /links
         登録完了                              ├── /testimonials
         ↓                                    ├── /recipes
         [ダッシュボード /dashboard]            └── /profile

[管理画面 /admin] ← role: admin のみアクセス可
    ├── /admin/users
    ├── /admin/invitations
    ├── /admin/videos
    ├── /admin/events
    ├── /admin/links
    ├── /admin/setup
    ├── /admin/contact
    ├── /admin/images
    ├── /admin/logs
    ├── /admin/testimonials
    └── /admin/topics
```
