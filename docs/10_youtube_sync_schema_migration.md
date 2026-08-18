# YouTube同期カラムのDB移行記録

更新日: 2026-08-18

## 実施内容

GitHub `main` の同期後、`videos` テーブルにYouTube動画同期用の以下のカラムを追加した。

同期確認時点では、ローカルHEAD・`origin/main`・`user_github/main` はいずれも `2e8456e` を指していた。

## GitHub同期の確認結果

| 確認項目 | 結果 |
|---|---|
| 同期コミット | `2e8456e` |
| ブランチ状態 | `main`、`origin/main`、`user_github/main` が同一コミットを参照 |
| 直前コミットとの `videos` 関連差分 | なし。確認時点のコミットは同期チェックポイントであり、スキーマ定義自体はすでに作業ツリーに反映済みだった。 |
| 現在のスキーマ定義 | `youtubeVideoId`、`publishedAt`、`syncedAt` を `videos` テーブルに定義済み |

| カラム | 型 | 用途 |
|---|---|---|
| `youtubeVideoId` | `varchar(32)`・一意制約 | YouTube動画IDによる重複防止 |
| `publishedAt` | `timestamp` | YouTube上の公開日時 |
| `syncedAt` | `timestamp` | 最終同期日時 |

## 適用方法と検証

`pnpm run db:push` を実行したところ、既存の `contact_items` テーブルを作成しようとして停止した。データベースには初期のDrizzle移行履歴のみが記録されており、後から追加済みのテーブルとローカルの移行履歴に差があることが原因である。

既存データを破壊しないため、生成された `drizzle/0006_wide_shooting_star.sql` の内容に相当する変更を、以下の順番で直接適用した。

1. `youtubeVideoId`、`publishedAt`、`syncedAt` を追加
2. `youtubeVideoId` に一意インデックス `videos_youtubeVideoId_unique` を追加
3. `SHOW COLUMNS` と `SHOW INDEX` で、3カラムおよび一意制約を確認

## 今後の方針

今回のカラムはDBに正常反映済みであり、アプリケーションのTypeScriptチェックとVitestも通過している。今後 `drizzle-kit migrate` を使う前には、既存テーブルの移行履歴を別途正規化し、既存テーブル作成SQLを再実行しない状態に整える。履歴の再構成は既存データに影響するため、実施前にバックアップと専用の検証環境を用意する。
