# NatuLabo Portal — Manusでの共有・引き継ぎガイド

更新日: 2026年11月3日

## 今回の運用方針

所有者からの指定に基づき、既存のManusサイトとデータベースを使って運用します。知人がManusで管理・修正し、コードはこのGitHubリポジトリで共有します。

| 項目 | 使用先 |
| --- | --- |
| コード | https://github.com/sei0520tg-ship-it/natulabo-portal |
| 基準ブランチ | `main` |
| GitHub所有者 | `sei0520tg-ship-it` |
| サイト・DB・公開操作 | 現在使用中のManusタスク |
| ManusタスクURL・現行の公開URL | 所有者がManus画面から確認して共有 |

旧資料に記載されたManus公開URLは、2026年11月3日の確認ではHTTP 404でした。現在使用中のManusタスクやDBへのアクセス、現行の公開URLは、このGitHub側の整備では確認していません。

## 1. 知人に渡すもの

1. このGitHubリポジトリのURLと本ガイド。
2. 既存サイトを編集するための、対象Manusタスクへの共同編集招待。
3. 直接GitHubへ変更を保存する場合は、知人自身のGitHubアカウントへの招待。

コードを見る・取得するだけならGitHubへの招待は不要です。別のリポジトリへコピーしても、既存サイトのDBやManusの公開設定が自動的に引き継がれるわけではありません。

## 2. 既存のManusタスクを共同編集する

サイト所有者が、実際に運用しているManusタスクを開き、共有メニューから共同編集（Collaboration）を選んで知人を招待します。通常の閲覧用リンクと、タスクを編集するための招待を区別してください。

知人は招待を受け入れ、対象サイトのプレビューと編集可能なタスクを確認します。既存の会員・動画・イベントが表示されることを確認してから修正を始めてください。

Manusのプロジェクト共有だけでは個別タスクが共有されない場合があります。サイトが紐付くタスク自体への招待を確認します。

参考: [Manusの共同編集手順](https://help.manus.im/en/articles/12135428-how-can-i-use-manus-collab)、[Manus Projectsの共有範囲](https://www.manus.im/features/projects)

## 3. GitHubの編集権限と同期を確認する

直接このリポジトリへ保存する知人には、所有者が[共同編集者の設定](https://github.com/sei0520tg-ship-it/natulabo-portal/settings/access)から招待します。知人が招待を受け入れてから利用できます。所有者と同じユーザー名を再招待する必要はありません。

次に、Manusの対象サイトのGitHub設定を開き、接続先が `sei0520tg-ship-it/natulabo-portal` であることと、`main` の同期状態を確認します。既存の接続を使い、リポジトリ名と所有者名は維持します。

Manusの公式なWebサイト同期は、Manusから書き出したリポジトリとの接続を前提としています。GitHub Connectorでコードを読めることだけでは、既存サイトとの自動同期が設定済みとは判断できません。接続先が異なる場合は、既存タスクのコードとGitHubの差分を確認し、変更を失わない形で統合します。

参考: [Manus GitHub Integration](https://manus.im/docs/website-builder/github-integration)

## 4. Manusに渡す引き継ぎ文

以下を、既存サイトのManusタスクで使用してください。

```text
NatuLabo Portalの管理・修正を引き継ぎます。
コードの共有先は https://github.com/sei0520tg-ship-it/natulabo-portal 、基準はmainです。

最初にREADME.mdとdocs/15_manus_handoff.mdを読んでください。
現在のManusタスク、サイト、DB、登録済みデータ、環境変数、公開設定を引き継いで使います。
新しいサイトやDBは作成せず、既存DBの初期化・削除・サンプルデータへの置換を行わないでください。

GitHubとの接続先と同期状態を確認してください。
Manus側に未反映の変更があれば差分を確認して統合し、mainの最新内容を取り込んでください。
環境変数やDB接続情報はGitHubへ保存せず、Manus内の設定を使ってください。

修正後は型チェック、テスト、ビルドと、プレビュー上の主要画面を確認してください。
変更をGitHubへ反映し、既存サイトへ公開するときは、その対象と公開結果のURLを確認してください。
```

## 5. 日々の修正と公開

1. 同時に編集している人がいないことと、Manus側の未反映の変更を確認する。
2. GitHubの `main` と同期してから編集する。ローカル開発では作業ブランチとPRを使う。
3. `pnpm run check`、`pnpm test`、`pnpm run build` を実行する。
4. Manusのプレビューでログイン、会員ページ、管理画面とスマートフォン表示を確認する。
5. GitHubへの保存と、Manus上の既存サイトへの公開結果を確認する。

画面・文言の修正だけならDBの変更は不要です。DB構造の変更が必要なときは、バックアップと変更内容を確認してからマイグレーションを適用します。通常の引き継ぎ時に `pnpm db:push` や動画の一括再投入を実行する必要はありません。

## 関連資料

- [管理者ガイド](05_admin_guide.md) — 操作の参考。URL・認証の記述には初期仕様が含まれます。
- [ManusとClaude Codeの併用手順](14_manus_claude_workflow.md) — 開発時の作業分担。
- [バックアップと復旧](12_backup_and_recovery.md) — DBを変更するときの手順。
- [過去のManus移行検討](13_manus_migration.md) — 当時の検討記録。今回の引き継ぎで新規インフラは作成しません。
