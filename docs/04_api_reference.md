# NatuLabo Portal — tRPC API リファレンス

> **フレームワーク**: tRPC 11  
> **エンドポイント**: `/api/trpc`  
> **認証**: `publicProcedure` / `protectedProcedure` / `adminProcedure`

---

## 認証レベル

| レベル | 説明 |
|-------|------|
| `publicProcedure` | 認証不要。誰でもアクセス可能 |
| `protectedProcedure` | ログイン済み会員のみ |
| `adminProcedure` | role: admin のユーザーのみ |

---

## auth ルーター

| プロシージャ | 認証 | 種別 | 説明 |
|------------|------|------|------|
| `auth.me` | protected | query | 現在のログインユーザー情報取得 |
| `auth.logout` | protected | mutation | ログアウト |

---

## invitation ルーター

| プロシージャ | 認証 | 種別 | 説明 |
|------------|------|------|------|
| `invitation.validate` | public | query | 招待コードの有効性確認 |
| `invitation.list` | admin | query | 招待コード一覧取得 |
| `invitation.create` | admin | mutation | 招待コード発行 |
| `invitation.delete` | admin | mutation | 招待コード削除 |

---

## member ルーター

| プロシージャ | 認証 | 種別 | 説明 |
|------------|------|------|------|
| `member.register` | protected | mutation | 会員登録（招待コード＋プロフィール） |
| `member.updateProfile` | protected | mutation | プロフィール更新 |
| `member.list` | admin | query | 会員一覧取得 |
| `member.updateRole` | admin | mutation | ロール変更（user/admin） |
| `member.delete` | admin | mutation | 会員削除 |

---

## video ルーター

| プロシージャ | 認証 | 種別 | 説明 |
|------------|------|------|------|
| `video.list` | protected | query | 動画一覧取得（公開済みのみ） |
| `video.adminList` | admin | query | 動画一覧取得（全件） |
| `video.upsert` | admin | mutation | 動画追加・更新 |
| `video.delete` | admin | mutation | 動画削除 |
| `video.saveProgress` | protected | mutation | 視聴進捗保存 |
| `video.getProgress` | protected | query | 視聴進捗取得 |

---

## event ルーター

| プロシージャ | 認証 | 種別 | 説明 |
|------------|------|------|------|
| `event.list` | protected | query | イベント一覧取得 |
| `event.upsert` | admin | mutation | イベント追加・更新 |
| `event.delete` | admin | mutation | イベント削除 |

---

## link ルーター

| プロシージャ | 認証 | 種別 | 説明 |
|------------|------|------|------|
| `link.list` | protected | query | 外部リンク一覧取得 |
| `link.upsert` | admin | mutation | リンク追加・更新 |
| `link.delete` | admin | mutation | リンク削除 |

---

## setup ルーター

| プロシージャ | 認証 | 種別 | 説明 |
|------------|------|------|------|
| `setup.list` | protected | query | ステップ一覧取得 |
| `setup.upsert` | admin | mutation | ステップ追加・更新 |
| `setup.delete` | admin | mutation | ステップ削除 |

---

## contact ルーター

| プロシージャ | 認証 | 種別 | 説明 |
|------------|------|------|------|
| `contact.list` | protected | query | 問い合わせ窓口一覧取得 |
| `contact.upsert` | admin | mutation | 窓口追加・更新 |
| `contact.delete` | admin | mutation | 窓口削除 |

---

## testimonial ルーター

| プロシージャ | 認証 | 種別 | 説明 |
|------------|------|------|------|
| `testimonial.list` | public | query | 体験談一覧取得（公開済みのみ） |
| `testimonial.adminList` | admin | query | 体験談一覧取得（全件） |
| `testimonial.upsert` | admin | mutation | 体験談追加・更新 |
| `testimonial.delete` | admin | mutation | 体験談削除 |

---

## topic ルーター

| プロシージャ | 認証 | 種別 | 説明 |
|------------|------|------|------|
| `topic.list` | protected | query | トピックス一覧取得（公開済みのみ） |
| `topic.adminList` | admin | query | トピックス一覧取得（全件） |
| `topic.upsert` | admin | mutation | トピックス追加・更新 |
| `topic.delete` | admin | mutation | トピックス削除 |

---

## log ルーター

| プロシージャ | 認証 | 種別 | 説明 |
|------------|------|------|------|
| `log.pageView` | protected | mutation | ページビュー記録 |
| `log.loginLogs` | admin | query | ログイン履歴取得 |
| `log.pageViews` | admin | query | ページビューログ取得 |
| `log.videoViews` | admin | query | 動画視聴ログ取得 |

---

## image ルーター

| プロシージャ | 認証 | 種別 | 説明 |
|------------|------|------|------|
| `image.list` | admin | query | 管理画像スロット一覧 |
| `image.upload` | admin | mutation | 画像アップロード（S3） |
| `image.delete` | admin | mutation | 画像削除 |

