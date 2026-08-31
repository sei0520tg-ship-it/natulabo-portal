import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const readProjectFile = (relativePath: string) =>
  fs.readFileSync(path.resolve(process.cwd(), relativePath), "utf8");

describe("UIリニューアルの構成", () => {
  it("ランディングページに公式写真ヒーローとブランド文字出現演出を保持する", () => {
    const home = readProjectFile("client/src/pages/Home.tsx");

    // 写真をやめてパステルのグラデーションにした
    expect(home).not.toContain("doterraAssets.");
    expect(home).toContain("bg-hero-gradient");
    expect(home).toContain("soft-blob");
    expect(home).toContain("NATU LABO");
    expect(home).toContain("natu-hero-letter");
    expect(home).toContain("NatuLabo Portal");
  });

  it("会員ホームに公式画像を使ったトピックス操作と高可読性キャプションを保持する", () => {
    const dashboard = readProjectFile("client/src/pages/Dashboard.tsx");

    expect(dashboard).toContain('aria-label="前のお知らせ"');
    expect(dashboard).toContain('aria-label="次のお知らせ"');
    // 写真ではなくセクションごとのトーンで識別する
    expect(dashboard).not.toContain("doterraAssets.");
    expect(dashboard).toContain("sectionTone[item.href]");
  });

  it("あなたのためのコンテンツに重複しないトーンを割り当てる", () => {
    const theme = readProjectFile("client/src/lib/categoryTheme.ts");

    // 6枚のカードが同じ色で並ばないよう、ルートごとにトーンを持たせている
    ["/setup", "/videos", "/recipes", "/testimonials", "/calendar", "/links"].forEach((route) =>
      expect(theme).toContain(`"${route}"`)
    );
    // クラス名は完全な文字列で書くこと。動的に組み立てると
    // Tailwind v4 のスキャナが拾えずクラスごと消える。
    // 注意書き自体に悪い例を載せているので、コメントを除いてから検査する。
    const code = theme.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
    expect(code).not.toMatch(/["`']bg-\$\{/);
  });

  it("ログイン・レシピ・初期設定に公式画像と誤リンクのない導線を保持する", () => {
    const login = readProjectFile("client/src/pages/Login.tsx");
    const recipes = readProjectFile("client/src/pages/Recipes.tsx");
    const setup = readProjectFile("client/src/pages/Setup.tsx");

    expect(login).toContain("SoftBackdrop");
    expect(login).not.toContain("doterraAssets.");
    expect(recipes).toContain("const recipeTone");
    expect(recipes).toContain("recipeTone[recipe.category]");
    expect(setup).not.toContain("youtube.com/embed/dQw4w9WgXcQ");
  });

  it("会員コンテンツに共通ビジュアルヒーローと個別レシピURLを保持する", () => {
    const visualHero = readProjectFile("client/src/components/ContentVisualHero.tsx");
    const videos = readProjectFile("client/src/pages/Videos.tsx");
    const setup = readProjectFile("client/src/pages/Setup.tsx");
    const app = readProjectFile("client/src/App.tsx");
    const recipes = readProjectFile("client/src/pages/Recipes.tsx");

    // 写真をやめてパステルの面にしたので、ヒーローに img は存在しない
    expect(visualHero).not.toContain("<img");
    expect(visualHero).not.toContain("dōTERRA公式掲載画像");
    expect(videos).toContain("fallbackTones");
    expect(setup).toContain("ContentVisualHero");
    expect(app).toContain('path="/recipes/:id"');
    expect(recipes).toContain('useRoute("/recipes/:id")');
    expect(recipes).toContain("レシピ一覧へ戻る");
  });

  it("画像主体へ刷新した会員ページと管理一覧の運用導線を保持する", () => {
    const visualHero = readProjectFile("client/src/components/ContentVisualHero.tsx");
    const pages = ["Setup", "Videos", "CalendarPage", "Contact", "Links", "Testimonials"]
      .map((name) => readProjectFile(`client/src/pages/${name}.tsx`));
    const adminVideos = readProjectFile("client/src/pages/admin/AdminVideos.tsx");
    const adminTestimonials = readProjectFile("client/src/pages/admin/AdminTestimonials.tsx");

    // アイコンチップとトーンで構成されていること
    expect(visualHero).toContain("icon: Icon");
    expect(visualHero).toContain("tone(toneName)");
    // 装飾は読み上げ対象から外す
    expect(visualHero).toContain('aria-hidden="true"');
    pages.forEach((page) => expect(page).toContain("ContentVisualHero"));
    expect(adminVideos).toContain("サムネイル画像URL");
    expect(adminTestimonials).toContain("t.imageUrl ? <img");
  });

  it("参照しているCSS変数がすべて index.css で定義されている", () => {
    // 以前 --brown-600 など5変数が未定義のまま参照され、色が当たっていなかった。
    // 文字列の一致ではなく構造的な不変条件として検証し、再発を防ぐ。
    const css = readProjectFile("client/src/index.css");
    const defined = new Set(Array.from(css.matchAll(/^\s*(--[a-z0-9-]+)\s*:/gm), (m) => m[1]));

    // shadcn/ui と Tailwind が実行時に注入するものは対象外
    const runtimeProvided = /^--(tw-|radix-|sidebar-width|spacing$|reveal-delay|letter-delay)/;

    const dir = path.resolve(process.cwd(), "client/src");
    const walk = (d: string): string[] =>
      fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => {
        const full = path.join(d, e.name);
        if (e.isDirectory()) return walk(full);
        return /\.(tsx?|css)$/.test(e.name) ? [full] : [];
      });

    const missing = new Map<string, string>();
    for (const file of walk(dir)) {
      const text = fs.readFileSync(file, "utf8");
      for (const m of text.matchAll(/var\((--[a-zA-Z0-9-]+)/g)) {
        const name = m[1];
        if (defined.has(name) || runtimeProvided.test(name)) continue;
        if (!missing.has(name)) missing.set(name, path.relative(dir, file));
      }
    }

    expect(Array.from(missing.entries())).toEqual([]);
  });

  it("会員レイアウトと全体テーマにキーボードフォーカス導線を保持する", () => {
    const memberLayout = readProjectFile("client/src/components/MemberLayout.tsx");
    const css = readProjectFile("client/src/index.css");

    expect(memberLayout).toContain('aria-label="プロフィールを開く"');
    expect(css).toContain(":focus-visible");
    expect(css).toContain("prefers-reduced-motion: reduce");
  });

  it("イベント画面に共有カレンダー購読と個別予定追加の導線を保持する", () => {
    const calendar = readProjectFile("client/src/pages/CalendarPage.tsx");
    const server = readProjectFile("server/_core/index.ts");

    expect(calendar).toContain("NatuLaboイベントをカレンダーに購読");
    expect(calendar).toContain("Googleで購読");
    expect(calendar).toContain("/api/calendar/events/${event.id}.ics");
    expect(server).toContain('/api/calendar/natulabo.ics');
    expect(server).toContain('/api/calendar/events/:id.ics');
  });

  it("YouTubeプレイヤーをReact管理DOMから隔離し、公開日が新しい順で動画を取得する", () => {
    const player = readProjectFile("client/src/components/YouTubePlayer.tsx");
    const database = readProjectFile("server/db.ts");

    expect(player).toContain("const hostRef = useRef<HTMLDivElement | null>(null)");
    expect(player).toContain('document.createElement("div")');
    expect(player).toContain("hostRef.current?.replaceChildren(mountNode)");
    expect(database).toContain("orderBy(desc(videos.publishedAt), videos.sortOrder)");
  });
});
