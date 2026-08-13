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

  it("会員ホームにトピックス操作のアクセシブルネームと高可読性オーバーレイを保持する", () => {
    const dashboard = readProjectFile("client/src/pages/Dashboard.tsx");

    expect(dashboard).toContain('aria-label="前のお知らせ"');
    expect(dashboard).toContain('aria-label="次のお知らせ"');
    expect(dashboard).toContain("rgba(10,25,13,0.92)");
  });

  it("会員レイアウトと全体テーマにキーボードフォーカス導線を保持する", () => {
    const memberLayout = readProjectFile("client/src/components/MemberLayout.tsx");
    const css = readProjectFile("client/src/index.css");

    expect(memberLayout).toContain('aria-label="プロフィールを開く"');
    expect(css).toContain(":focus-visible");
    expect(css).toContain("prefers-reduced-motion: reduce");
  });
});
