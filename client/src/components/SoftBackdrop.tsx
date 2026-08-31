/**
 * SoftBackdrop.tsx
 *
 * ログイン・会員登録・404 で使う全画面の背景。
 *
 * 以前はdōTERRAの写真の上に濃い緑のスクリムを敷いていたが、
 * 写真を外したため、パステルのグラデーションとぼかした円で density を作る。
 * 画像ファイルを一切使わないので、読み込み待ちもレイアウトのズレも起きない。
 */
export default function SoftBackdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden bg-hero-gradient">
      <span className="soft-blob natu-float -left-24 -top-24 h-80 w-80 bg-blossom-300 opacity-40" />
      <span className="soft-blob -right-28 top-16 h-96 w-96 bg-aqua-300 opacity-35" />
      <span className="soft-blob natu-float bottom-[-6rem] left-1/3 h-72 w-72 bg-butter-300 opacity-35" />
      <span className="soft-blob -bottom-24 -right-16 h-64 w-64 bg-mint-300 opacity-30" />
    </div>
  );
}
