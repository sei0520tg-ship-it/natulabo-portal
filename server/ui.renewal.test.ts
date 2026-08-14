import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const readProjectFile = (relativePath: string) =>
  fs.readFileSync(path.resolve(process.cwd(), relativePath), "utf8");

describe("UIリニューアルの構成", () => {
  it("ランディングページに森林ヒーローとブランド文字出現演出を保持する", () => {
    const home = readProjectFile("client/src/pages/Home.tsx");

    expect(home).toContain("forest_bg_loop_1b4e6054.mp4");
    expect(home).toContain("NATU LABO");
    expect(home).toContain("natu-hero-letter");
    expect(home).toContain("NatuLabo Portal");
  });

  it("会員ホームに公式画像を使ったトピックス操作と高可読性キャプションを保持する", () => {
    const dashboard = readProjectFile("client/src/pages/Dashboard.tsx");

    expect(dashboard).toContain('aria-label="前のお知らせ"');
    expect(dashboard).toContain('aria-label="次のお知らせ"');
    expect(dashboard).toContain("doterraAssets.memberRoseField");
    expect(dashboard).toContain("rgba(10,25,13,0.74)");
  });

  it("ログイン・レシピ・初期設定に公式画像と誤リンクのない導線を保持する", () => {
    const login = readProjectFile("client/src/pages/Login.tsx");
    const recipes = readProjectFile("client/src/pages/Recipes.tsx");
    const setup = readProjectFile("client/src/pages/Setup.tsx");

    expect(login).toContain("doterraAssets.loginGarden");
    expect(recipes).toContain("const recipeImages");
    expect(recipes).toContain("recipeImages[recipe.category]");
    expect(setup).not.toContain("youtube.com/embed/dQw4w9WgXcQ");
  });

  it("会員コンテンツに共通ビジュアルヒーローと個別レシピURLを保持する", () => {
    const visualHero = readProjectFile("client/src/components/ContentVisualHero.tsx");
    const videos = readProjectFile("client/src/pages/Videos.tsx");
    const setup = readProjectFile("client/src/pages/Setup.tsx");
    const app = readProjectFile("client/src/App.tsx");
    const recipes = readProjectFile("client/src/pages/Recipes.tsx");

    expect(visualHero).toContain("dōTERRA公式掲載画像");
    expect(videos).toContain("videoFallbackImages");
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

    expect(visualHero).toContain("sm:min-h-[17rem]");
    expect(visualHero).toContain('alt={imageAlt}');
    pages.forEach((page) => expect(page).toContain("ContentVisualHero"));
    expect(adminVideos).toContain("サムネイル画像URL");
    expect(adminTestimonials).toContain("t.imageUrl ? <img");
  });

  it("会員レイアウトと全体テーマにキーボードフォーカス導線を保持する", () => {
    const memberLayout = readProjectFile("client/src/components/MemberLayout.tsx");
    const css = readProjectFile("client/src/index.css");

    expect(memberLayout).toContain('aria-label="プロフィールを開く"');
    expect(css).toContain(":focus-visible");
    expect(css).toContain("prefers-reduced-motion: reduce");
  });
});
