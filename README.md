# Autonomous Snake AI (自律型AIスネークシミュレーター)

15×15のグリッド上を、最適化された探索アルゴリズムで自律走行するSnake（蛇ゲーム）Webアプリケーションです。  
ユーザーの操作は不要で、スタートボタンを押すだけでAIが最も効率の良いルートを計算・判断しながらリンゴを捕食していく様子を鑑賞できます。

GitHub Actionsに対応しており、リポジトリにプッシュするだけでGitHub Pagesに自動デプロイされます。

---

## 🌟 主な機能・特徴

1. **途中で絶対に死なない 100% 完全完走アルゴリズム (Hamiltonian Cycle + Shortcuts)**
   - 全196マス（14×14）を一筆書きで漏れなく巡回する「完全ハミルトン閉路」を基底に採用。
   - **安全ショートカット（近道）機能**: 序盤〜中盤はリンゴへの最短ルートを計算して素早く直行。
   - **完全な生存保証**: 体が長くなった際や袋小路のリスクがある場合は、自動的にハミルトン閉路の巡回走行に移行するため、**途中で進路が塞がれてゲームオーバーになることが数学的に0%（100%確実に最後まで完走・全マス制覇）** します。

2. **2個同時出現のリンゴシステム**
   - 盤面には常に2個のリンゴがランダムな位置に出現。
   - より安全かつ近いリンゴから優先して捕食し、**2個とも食べ終わった瞬間に次の2個が再生成**されます。

3. **洗練されたモノトーン Vinyl 音楽プレイヤー**
   - 上部に回転するアナログレコード盤（サムネイル付き）。再生中は360度滑らかに回転、停止で停止。
   - レコードとボタンの間にトラック情報（曲名・アーティスト名）をスマートに表示。
   - 前へ・再生/ストップ・次へのスキップボタン、および音量調節スライダー＆ミュート機能。
   - プレイリスト（3曲ループ対応）：
     1. `Midnight Coast Chill` / Sound Eve
     2. `Book` / RYU ITO MUSIC
     3. `Driftwood` / RYU ITO MUSIC
   - リンゴA・Bの座標、直線距離、現在のメインターゲット状態をサイドパネルで可視化。
   - AIの思考プロセス（「リンゴAを最短追尾中」「尾追従モードで安全旋回中」など）をリアルタイム表示。

4. **鑑賞体験を高めるコントロール**
   - シミュレーション速度調整（ゆったり 200ms / ノーマル 100ms / 高速 50ms / 超高速 15ms）。
   - 一時停止 / 再開 / リセット機能。
   - 捕食時のネオンパーティクルエフェクト。

---


## 💻 ローカルでの確認方法

静的Webサイト（HTML/CSS/JS）のため、特別なビルドツールは不要です。
以下のいずれかの方法でブラウザですぐに開くことができます：

- **ダブルクリック**: `index.html` をブラウザで直接開く。
- **VS Code Live Server**: VS Code拡張機能「Live Server」で開く。
- **ローカルサーバー実行 (PowerShell / Python)**:
  ```powershell
  python -m http.server 8080
  ```
  ブラウザで `http://localhost:8080` を開く。

---

## 🛠️ 技術スタック
- **Core**: Vanilla HTML5, Vanilla JavaScript (ES6+)
- **Graphics**: HTML5 Canvas API (High-DPI support, Particle System)
- **Styling**: Vanilla CSS3 (Glassmorphism, Cyberpunk Neon Theme, CSS Variables, Responsive Grid)
- **Typography**: Google Fonts (Outfit, JetBrains Mono)
- **CI/CD**: GitHub Actions (`actions/deploy-pages@v4`)
