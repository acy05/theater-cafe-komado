# シアター喫茶 こまど

実在する小さな映画館・シアターカフェの公式サイトを参照し、店舗像と情報設計から作り直した5ページの制作プレビューです。「こまど」は仮称です。

公開サイト: https://acy05.github.io/theater-cafe-komado/
GitHub: https://github.com/acy05/theater-cafe-komado

## 起動と確認

```sh
npm ci
npm run dev
npm run build
npm test
```

開発プレビュー: http://127.0.0.1:4188/

Playwrightはインストール済みのGoogle Chromeを使用します。`npm test`の前にdev serverを起動してください。別URLは`QA_URL`で指定できます。ブラウザー撮影・テストは順番に実行します。

## 設計とページ

- `DESIGN_SYSTEM.md`：実在店の参考、店舗像、情報構造、配色・書体・レスポンシブ方針。
- `MOTION_SYSTEM.md`：入場・操作・スクロール・reduced motion。
- `index.html`：お店の入口、番組表、喫茶、貸切、お店だより、営業案内。
- `events.html`：種別の絞り込み、詳細、人数、金額、確認、予約体験。
- `space.html`：空き日を選び、開始・終了時間、利用目的、人数、相談内容を入力する予約相談体験。選択内容を問い合わせへ引き継ぎます。
- `journal.html`：記事一覧・全文・絞り込み、記事管理デモ。
- `contact.html`：必須入力、メール形式、確認・修正のデモ。

## お店の方による更新

お店だより下部の「記事を編集する」で、記事の追加・編集・端末内保存・JSON書き出しを試せます。保存キーは`komado.articles.v1`です。前案の記事や保存領域を変更しません。管理者認証、端末間共有、サイトへの公開は未接続です。

催事の初期情報は`app.js`の`events`、記事の初期情報は`defaultArticles`。正式な店名・案内文は各HTML。画像は`assets/komado-cafe.webp`と`assets/komado-coffee.webp`を差し替えます。altテキストと生成イメージの注記も合わせて更新してください。写真は今回新たに生成したコンセプト画像です。旧写真は表示に使用していません。

## 検証記録

最新の確認は `qa/real-cafe-redesign/REPORT.md`。画面一覧は http://127.0.0.1:4188/qa/real-cafe-redesign/index.html 。PC 1440px / tablet 820px / mobile 390px の実表示・操作、320〜1440pxの9幅のレイアウト検証を記録しています。前案の検証記録は別の履歴として保持しています。

## 公開に必要な作業

予約在庫・席の確保・メール送信・WordPress等の共有CMS・認証・決済・公開は未接続です。問い合わせ内容は送信されません。カレンダーは2026年11月28日〜2027年11月末のサンプルです。既存サーバーとドメインの仕様、正式な店舗情報・料金・催事・運用条件を確認し、本番保存先・通知・更新機能を接続してから公開する必要があります。

`dist/`は静的なフロントエンドです。ビルド成功は本番の予約受付を意味しません。全体の本番適合判定は`UNVERIFIED_PROVISIONAL`です。
