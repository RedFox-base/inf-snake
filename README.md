# Autonomous Snake AI & Music Player (自律型AIスネーク × 音楽プレイヤー)

**ver 1.2**

14×14のグリッド上を、ハミルトン閉路＋ショートカットのアルゴリズムで自律走行するSnake（蛇ゲーム）Webアプリケーションです。  
ユーザーの操作は不要で、スタートボタンを押すだけでAIがリンゴを捕食していく様子を鑑賞できます。  
画面右側（スマホでは盤面の下）には、BGMを流せるモノトーンのレコード風音楽プレイヤーを備えています。

GitHub Actionsに対応しており、`main` / `master` ブランチにプッシュするとGitHub Pagesに自動デプロイされます。

---

## 🌟 主な機能・特徴

### 1. 死なないことを目指した自律走行AI (Hamiltonian Cycle + Shortcuts)
- 全196マス（14×14）を一筆書きで巡回する「ハミルトン閉路」を基本ルートに採用。
- **安全ショートカット**: スキップする区間に自分の身体がなく、尻尾を追い越さない場合に限り、リンゴへ近道します。
- 近道が危険な場合は閉路どおりに進むため、身体で進路を塞いでしまうことを防ぎます。

### 2. なめらかな走行アニメーション
- 1マスあたり 140ms のゆったりした速度で進みます（`game.js` の `stepIntervalMs` で変更可能）。
- 描画は約 30fps（`TARGET_FPS` で調整可能）で、マスとマスの間を補間しながら頭と尻尾が動きます。
- 一時停止すると移動途中の位置のまま止まり、再開するとそのまま続きから動きます。
- 食べられたリンゴは、頭が近づくにつれて縮んで消えます。

### 3. 2個同時出現のリンゴシステム
- 盤面には常に2個のリンゴ（赤・オレンジ）がランダムな位置に出現。
- より早く到達できる方を優先して捕食し、**2個とも食べ終わると次の2個が再生成**されます。
- 空きマスがなくなると「完全制覇！」となりゲーム終了です。

### 4. モノトーン Vinyl 音楽プレイヤー
- YouTubeサムネイル付きのアナログレコード盤。再生中は回転し、停止すると止まります。
- トラック番号・曲名・アーティスト名を表示。曲名の横のアイコン（`box-arrow-up`）から元のYouTube動画を開けます。
- 前へ（`chevron-left`）・再生/一時停止・次へ（`chevron-right`）のボタン。曲が終わると自動で次の曲へ進みます。
- **音量調節**: 左にスピーカーアイコン（`volume-off-fill`）、右に調節バーを配置した枠なしのデザイン。
  - バーは動かした分が黒、残りの領域が灰色で表示されます。
  - アイコンをクリックするとミュート／解除（ミュート中はアイコンが薄くなります）。
- プレイリスト（3曲ループ）：
  1. `Midnight Coast Chill` / Sound Eve
  2. `Book` / RYU ITO MUSIC
  3. `Driftwood` / RYU ITO MUSIC

### 5. 操作・画面まわり
- スタート / 一時停止 / もう一度、リセットボタン。スコアと状態（待機中・走行中・完全制覇！など）を盤面上部に表示。
- スタートボタンは黒に近いグレーのモノトーンデザイン（走行中は淡いグレーの一時停止ボタンに切り替わります）。押した瞬間に沈み込むフィードバックがあり、スマホでも押しやすい高さにしています。
- アイコンはすべて Bootstrap Icons で統一。
- **スマホ対応**: 幅 860px 以下では、盤面を主役にした縦並びのレイアウトに切り替わり、プレイヤーは「レコード｜曲情報」の横並びにコンパクト化されます。
- 画面左下にバージョン表記、右下に「利用規約・注意事項」リンク（クリックでポップアップ表示）。

---

## 📜 利用規約・注意事項（概要）

サイト右下のリンクから全文を確認できます。主な内容は以下のとおりです。

- 本サイトは個人が非営利で公開しているもので、広告の掲載や収益化は行っていません。
- BGMには、YouTubeで公開されている商用利用可能なフリー音源を使用しています。各楽曲の著作権は制作者に帰属します。
- 本サイトのコードは、生成AIを利用して作成しています。
- Cookie等による個人情報の収集・保存は行っていません。表示のために外部サービス（Google Fonts、jsDelivr、YouTubeのサムネイル画像）を読み込んでいます。

---

## 📁 ディレクトリ構成

```
.
├── index.html                 # 画面レイアウト・利用規約ポップアップ
├── style.css                  # スタイル（モノトーンデザイン・スマホ対応）
├── game.js                    # スネークAI・アニメーション描画
├── player.js                  # 音楽プレイヤー
├── terms.js                   # 利用規約・注意事項ポップアップの開閉
├── assets/music/              # BGM (mp3)
└── .github/workflows/deploy.yml  # GitHub Pages 自動デプロイ
```

---

## 💻 ローカルでの確認方法

静的Webサイト（HTML/CSS/JS）のため、ビルドは不要です。

- **ダブルクリック**: `index.html` をブラウザで直接開く。
- **VS Code Live Server**: VS Code拡張機能「Live Server」で開く。
- **ローカルサーバー実行 (Python)**:
  ```powershell
  python -m http.server 8080
  ```
  ブラウザで `http://localhost:8080` を開く。

※ 音楽はブラウザの自動再生制限により、再生ボタンを押したときに再生が始まります。

---

## 🚀 デプロイ（GitHub Pages）

1. リポジトリの **Settings → Pages → Build and deployment → Source** を **「GitHub Actions」** に設定します（初回のみ）。
2. `main`（または `master`）ブランチにプッシュすると、`.github/workflows/deploy.yml` が実行されて公開されます。
3. Actions タブの **Run workflow** から手動で実行することもできます。

---

## 🛠️ 技術スタック
- **Core**: Vanilla HTML5, Vanilla JavaScript (ES6+)
- **Graphics**: HTML5 Canvas API, `requestAnimationFrame` による補間アニメーション
- **Audio**: HTML5 Audio API（ローカルmp3再生）
- **Styling**: Vanilla CSS3（CSS Variables, Grid, メディアクエリによるレスポンシブ対応）
- **UI**: `<dialog>` 要素によるポップアップ
- **Icons**: Bootstrap Icons 1.11.3（jsDelivr CDN）
- **Typography**: Google Fonts (Inter, JetBrains Mono)
- **CI/CD**: GitHub Actions (`actions/checkout@v5`, `actions/configure-pages@v5`, `actions/upload-pages-artifact@v4`, `actions/deploy-pages@v4`)
