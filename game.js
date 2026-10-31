/**
 * Autonomous Snake AI Simulator - Minimal White Edition
 * 14x14 Grid (196 cells) with Guaranteed 100% Win Rate via Hamiltonian Cycle + Shortcuts
 * 2 Simultaneous Apples, Pure White Eyes, Solid Green Connected Body
 */

(() => {
  // --- Constants & Config ---
  // 14x14 creates an exact even grid of 196 cells, mathematically guaranteeing
  // a complete closed Hamiltonian Cycle with 100% survival rate to the very last cell.
  const GRID_SIZE = 14;
  const CANVAS_SIZE = 588; // 14 * 42 = 588px (crisp integer scaling)
  const CELL_SIZE = CANVAS_SIZE / GRID_SIZE;
  const TOTAL_CELLS = GRID_SIZE * GRID_SIZE;

  // Colors for clean white theme
  const COLOR_BG = '#ffffff';
  const COLOR_GRID = '#f1f5f9';
  const COLOR_SNAKE_BODY = '#10b981'; // Solid opaque emerald green
  const COLOR_APPLE_1 = '#ef4444';    // Red apple
  const COLOR_APPLE_2 = '#f59e0b';    // Amber apple

  // Direction Vectors
  const DIRS = [
    { x: 0, y: -1 },
    { x: 1, y: 0 },
    { x: 0, y: 1 },
    { x: -1, y: 0 }
  ];

  // --- Precompute Complete Hamiltonian Cycle ---
  // Constructs an unbroken closed loop visiting all 196 cells exactly once:
  // Row 0: (0,0) -> (13,0)
  // Rows 1-13: Zig-zag from x=1 to x=13
  // Column 0: (0,13) -> (0,1) -> (0,0) closing the loop.
  const cycleIndexGrid = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(-1));
  const cycleList = [];

  let cycleIdx = 0;
  // Row 0: left to right
  for (let x = 0; x < GRID_SIZE; x++) {
    cycleIndexGrid[x][0] = cycleIdx++;
    cycleList.push({ x, y: 0 });
  }

  // Rows 1 to GRID_SIZE - 1
  for (let y = 1; y < GRID_SIZE; y++) {
    if (y % 2 === 1) {
      // Odd row: right to left (x = GRID_SIZE - 1 down to 1)
      for (let x = GRID_SIZE - 1; x >= 1; x--) {
        cycleIndexGrid[x][y] = cycleIdx++;
        cycleList.push({ x, y });
      }
    } else {
      // Even row: left to right (x = 1 to GRID_SIZE - 1)
      for (let x = 1; x < GRID_SIZE; x++) {
        cycleIndexGrid[x][y] = cycleIdx++;
        cycleList.push({ x, y });
      }
    }
  }

  // Column 0: bottom to top (y = GRID_SIZE - 1 down to 1)
  for (let y = GRID_SIZE - 1; y >= 1; y--) {
    cycleIndexGrid[0][y] = cycleIdx++;
    cycleList.push({ x: 0, y });
  }

  // Distance from cycle index `u` to `v` along the loop
  function cycleDist(u, v) {
    return (v - u + TOTAL_CELLS) % TOTAL_CELLS;
  }

  // --- State Variables ---
  let snake = [];
  let apples = []; // [{x, y, id, color}, ...]
  let currentTargetApple = null;
  let score = 0;
  let isRunning = false;
  let isGameOver = false;
  const stepIntervalMs = 140; // ゆったり鑑賞できる速度（ms / 1マス）

  // --- なめらかアニメーション用の状態 ---
  // ロジックは stepIntervalMs ごとに1マス進み、描画は毎フレーム（requestAnimationFrame）
  // 前のマスから次のマスへの途中位置を補間して描く
  let accumMs = 0;          // 前回の1マス移動からの経過時間（一時停止中は止まる）
  let lastFrameTime = null;
  let hasMotion = false;    // 補間すべき直前の移動があるか
  let prevTail = null;      // 直前の移動で抜けた尻尾のマス（捕食時は null）
  let eatenApple = null;    // 直前に食べたリンゴ（縮みながら消える演出用）

  // DOM Elements
  const canvas = document.getElementById('gameCanvas');
  canvas.width = CANVAS_SIZE;
  canvas.height = CANVAS_SIZE;
  const ctx = canvas.getContext('2d');
  const startBtn = document.getElementById('startBtn');
  const resetBtn = document.getElementById('resetBtn');
  const btnIcon = document.getElementById('btnIcon');
  const btnText = document.getElementById('btnText');
  const scoreValue = document.getElementById('scoreValue');
  const statusText = document.getElementById('statusText');

  // --- Utility functions ---
  function posEquals(p1, p2) {
    return p1 && p2 && p1.x === p2.x && p1.y === p2.y;
  }

  function isSnakeBody(pos) {
    for (let i = 0; i < snake.length; i++) {
      if (posEquals(pos, snake[i])) return true;
    }
    return false;
  }

  // --- Game Lifecycle ---
  function initGame() {
    isRunning = false;
    isGameOver = false;
    score = 0;
    accumMs = 0;
    hasMotion = false;
    prevTail = null;
    eatenApple = null;

    // Start with 3 segments along the cycle path
    // Around the middle area
    const startIdx = Math.floor(TOTAL_CELLS / 2);
    snake = [
      { ...cycleList[startIdx] },
      { ...cycleList[(startIdx - 1 + TOTAL_CELLS) % TOTAL_CELLS] },
      { ...cycleList[(startIdx - 2 + TOTAL_CELLS) % TOTAL_CELLS] }
    ];

    spawnNewApplesPair();
    updateAIPlan();
    updateUI();
  }

  // Spawn 2 apples simultaneously
  function spawnNewApplesPair() {
    apples = [];
    const available = [];
    for (let x = 0; x < GRID_SIZE; x++) {
      for (let y = 0; y < GRID_SIZE; y++) {
        const cell = { x, y };
        if (!isSnakeBody(cell)) {
          available.push(cell);
        }
      }
    }

    if (available.length === 0) {
      triggerWin();
      return;
    }

    // Apple 1
    const idx1 = Math.floor(Math.random() * available.length);
    const p1 = available.splice(idx1, 1)[0];
    apples.push({ x: p1.x, y: p1.y, id: 1, color: COLOR_APPLE_1 });

    // Apple 2 (if cell available)
    if (available.length > 0) {
      const idx2 = Math.floor(Math.random() * available.length);
      const p2 = available.splice(idx2, 1)[0];
      apples.push({ x: p2.x, y: p2.y, id: 2, color: COLOR_APPLE_2 });
    }
  }

  function manhattan(p1, p2) {
    return Math.abs(p1.x - p2.x) + Math.abs(p1.y - p2.y);
  }

  // スキップするサイクル区間に蛇の身体が1つでも含まれるか判定
  // （身体が含まれなければ、ショートカットしても身体が分断されず安全性が100%保たれる）
  function isSnakeBodyInCycleRange(u, v) {
    const dist = cycleDist(u, v);
    if (dist <= 1) return false;
    for (let i = 0; i < snake.length; i++) {
      const segIdx = cycleIndexGrid[snake[i].x][snake[i].y];
      const d = cycleDist(u, segIdx);
      if (d > 0 && d < dist) {
        return true; // スキップ区間に自分の身体が存在する
      }
    }
    return false;
  }

  // --- Autonomous AI: 自分の身体に当たらないギリギリの最短最善ルート ---
  function updateAIPlan() {
    if (apples.length === 0) return null;

    const head = snake[0];
    const tail = snake[snake.length - 1];
    const headIdx = cycleIndexGrid[head.x][head.y];
    const tailIdx = cycleIndexGrid[tail.x][tail.y];

    // 2つのリンゴのうち、より早く到達できる最善のターゲットを選択
    let target = apples[0];
    if (apples.length > 1) {
      const d0 = cycleDist(headIdx, cycleIndexGrid[apples[0].x][apples[0].y]) + manhattan(head, apples[0]) * 2;
      const d1 = cycleDist(headIdx, cycleIndexGrid[apples[1].x][apples[1].y]) + manhattan(head, apples[1]) * 2;
      target = d0 <= d1 ? apples[0] : apples[1];
    }
    currentTargetApple = target;
    const targetIdx = cycleIndexGrid[target.x][target.y];

    // 基本手（サイクル上の次の一歩）
    const defaultNextIdx = (headIdx + 1) % TOTAL_CELLS;
    const defaultNextPos = cycleList[defaultNextIdx];

    let bestNext = defaultNextPos;
    let bestScore = cycleDist(cycleIndexGrid[bestNext.x][bestNext.y], targetIdx) + manhattan(bestNext, target) * 3;

    // 上下左右4方向のうち、自分の身体に当たらないギリギリの最短最善手を探索
    for (const d of DIRS) {
      const nx = head.x + d.x;
      const ny = head.y + d.y;
      if (nx >= 0 && nx < GRID_SIZE && ny >= 0 && ny < GRID_SIZE) {
        const nextPos = { x: nx, y: ny };
        const nextIdx = cycleIndexGrid[nx][ny];

        // 移動先のマスが現在の身体でないこと（末尾は抜けるのでOK）
        const isBody = snake.some((seg, i) => i < snake.length - 1 && seg.x === nx && seg.y === ny);
        if (!isBody) {
          // 【身体に当たらないギリギリの条件】
          // 1. スキップする区間に自分の身体がないこと（身体を分断しない）
          // 2. 移動後に尻尾を追い越さないこと（tailIdxまでの距離 >= snake.length）
          if (!isSnakeBodyInCycleRange(headIdx, nextIdx)) {
            const distToTail = cycleDist(nextIdx, tailIdx);
            if (distToTail >= snake.length) {
              // リンゴ直撃なら絶対最優先（スコア最小化）
              const isDirectApple = apples.some(a => posEquals(nextPos, a));
              const scoreVal = isDirectApple ? -999999 : (cycleDist(nextIdx, targetIdx) + manhattan(nextPos, target) * 3);

              if (scoreVal < bestScore) {
                bestScore = scoreVal;
                bestNext = nextPos;
              }
            }
          }
        }
      }
    }

    return bestNext;
  }

  // 次の移動時のマスに「自分の身体」があるか判定
  // ※ リンゴを食べる場合は体が伸びて尾が残るため全セグメントが身体
  // ※ リンゴを食べない場合は尾が前進して空くため、末尾以外のセグメントが身体
  function isNextStepOccupiedByBody(nextPos) {
    if (!nextPos) return true;
    const willEat = apples.some(a => posEquals(nextPos, a));
    const checkLimit = willEat ? snake.length : snake.length - 1;
    for (let i = 0; i < checkLimit; i++) {
      if (posEquals(nextPos, snake[i])) {
        return true; // 次の移動先マスに自分の身体がある
      }
    }
    return false; // 身体はない（安全に進める）
  }

  // --- Step & Loop ---
  // 1マス分のゲームロジック（描画はフレームループ側で行う）
  function step() {
    if (!isRunning || isGameOver) return;

    const nextStep = updateAIPlan();

    // 【止まる条件】次の移動時のマスに自分の身体がある場合のみ止まる
    if (isNextStepOccupiedByBody(nextStep)) {
      triggerGameOver();
      return;
    }

    // 移動先のマスに身体はないため前進
    snake.unshift(nextStep);

    // リンゴ捕食判定
    let eatenIdx = -1;
    for (let i = 0; i < apples.length; i++) {
      if (posEquals(nextStep, apples[i])) {
        eatenIdx = i;
        break;
      }
    }

    if (eatenIdx !== -1) {
      score++;
      eatenApple = apples.splice(eatenIdx, 1)[0];
      prevTail = null; // 体が伸びるので尻尾は動かない

      // 2個とも食べたら次の2個が出現
      if (apples.length === 0) {
        spawnNewApplesPair();
      }
    } else {
      eatenApple = null;
      prevTail = snake.pop();
    }

    hasMotion = true;
    if (!isGameOver) updateUI();
  }

  // 毎フレーム呼ばれるループ：経過時間に応じてロジックを進め、補間して描画
  function frame(now) {
    if (lastFrameTime === null) lastFrameTime = now;
    // タブ切り替え後などに一気に進みすぎないよう上限を設ける
    const dt = Math.min(now - lastFrameTime, 100);
    lastFrameTime = now;

    if (isRunning && !isGameOver) {
      accumMs += dt;
      while (accumMs >= stepIntervalMs && isRunning && !isGameOver) {
        accumMs -= stepIntervalMs;
        step();
      }
    }

    render();
    requestAnimationFrame(frame);
  }

  // 0 → 1：直前のマスから現在のマスまでの移動の進み具合
  function getProgress() {
    if (!hasMotion) return 1;
    return Math.min(accumMs / stepIntervalMs, 1);
  }

  function lerpPoint(from, to, t) {
    return {
      x: (from.x + (to.x - from.x) * t + 0.5) * CELL_SIZE,
      y: (from.y + (to.y - from.y) * t + 0.5) * CELL_SIZE
    };
  }

  function cellCenter(p) {
    return { x: (p.x + 0.5) * CELL_SIZE, y: (p.y + 0.5) * CELL_SIZE };
  }

  // --- Render ---
  function render() {
    ctx.fillStyle = COLOR_BG;
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // 1. Subtle Minimal Grid (14x14)
    drawGrid();

    const t = getProgress();

    // 2. Apples (2 items)
    drawApples(t);

    // 3. Snake (Pure solid green, seamless, white eyes)
    drawSnake(t);
  }

  function drawGrid() {
    ctx.strokeStyle = COLOR_GRID;
    ctx.lineWidth = 1;
    for (let i = 1; i < GRID_SIZE; i++) {
      const p = i * CELL_SIZE;
      ctx.beginPath();
      ctx.moveTo(p, 0);
      ctx.lineTo(p, CANVAS_SIZE);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, p);
      ctx.lineTo(CANVAS_SIZE, p);
      ctx.stroke();
    }
  }

  function drawApples(t) {
    const list = apples.map(a => ({ apple: a, scale: 1 }));
    // 食べたリンゴは頭が近づくにつれて縮んで消える
    if (eatenApple && hasMotion && t < 1) {
      list.push({ apple: eatenApple, scale: 1 - t });
    }

    list.forEach(({ apple, scale }) => {
      const cx = (apple.x + 0.5) * CELL_SIZE;
      const cy = (apple.y + 0.5) * CELL_SIZE;
      const radius = CELL_SIZE * 0.36 * scale;
      if (radius <= 0.5) return;

      ctx.save();
      ctx.fillStyle = apple.color;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();

      // Clean apple stem
      ctx.strokeStyle = '#15803d';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(cx, cy - radius);
      ctx.quadraticCurveTo(cx + 2, cy - radius - 3, cx + 4, cy - radius - 4);
      ctx.stroke();

      ctx.restore();
    });
  }

  function drawSnake(t) {
    if (snake.length === 0) return;

    const bodyWidth = CELL_SIZE * 0.74;
    const capRadius = bodyWidth * 0.5;

    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.fillStyle = COLOR_SNAKE_BODY;
    ctx.strokeStyle = COLOR_SNAKE_BODY;

    // 1. Single segment edge-case
    if (snake.length === 1) {
      const c = cellCenter(snake[0]);
      ctx.beginPath();
      ctx.arc(c.x, c.y, capRadius, 0, Math.PI * 2);
      ctx.fill();
      drawEyes(c.x, c.y, capRadius);
      ctx.restore();
      return;
    }

    // 2. 補間した頭・尻尾の位置を求める
    //    頭：1つ前のマス(snake[1]) → 現在のマス(snake[0])
    //    尻尾：抜けたマス(prevTail) → 現在の末尾(snake[n-1])
    const last = snake.length - 1;
    const headPos = hasMotion ? lerpPoint(snake[1], snake[0], t) : cellCenter(snake[0]);
    const tailPos = (hasMotion && prevTail) ? lerpPoint(prevTail, snake[last], t) : cellCenter(snake[last]);

    // 3. Completely opaque solid green continuous body
    ctx.beginPath();
    ctx.moveTo(tailPos.x, tailPos.y);
    for (let i = last; i >= 1; i--) {
      const c = cellCenter(snake[i]);
      ctx.lineTo(c.x, c.y);
    }
    ctx.lineTo(headPos.x, headPos.y);
    ctx.lineWidth = bodyWidth;
    ctx.stroke();

    // 4. Head & tail caps
    ctx.beginPath();
    ctx.arc(headPos.x, headPos.y, capRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(tailPos.x, tailPos.y, capRadius, 0, Math.PI * 2);
    ctx.fill();

    // 5. Pure white eyes only (no black)
    drawEyes(headPos.x, headPos.y, capRadius);

    ctx.restore();
  }

  function drawEyes(cx, cy, radius) {
    let dir = { x: 0, y: -1 };
    if (snake.length > 1) {
      dir = { x: snake[0].x - snake[1].x, y: snake[0].y - snake[1].y };
    }
    const angle = Math.atan2(dir.y, dir.x);

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);

    // Eyes: Pure white dots only
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(radius * 0.36, -radius * 0.44, 2.8, 0, Math.PI * 2);
    ctx.arc(radius * 0.36, radius * 0.44, 2.8, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // --- UI Update & Handlers ---
  function updateUI() {
    scoreValue.textContent = score;

    if (isGameOver) {
      // 状態テキストは triggerGameOver / triggerWin 側で設定
      btnIcon.className = 'btn-icon bi bi-arrow-counterclockwise';
      btnText.textContent = 'もう一度';
      startBtn.classList.remove('running');
    } else if (isRunning) {
      statusText.textContent = '走行中';
      btnIcon.className = 'btn-icon bi bi-pause-fill';
      btnText.textContent = '一時停止';
      startBtn.classList.add('running');
    } else {
      statusText.textContent = '待機中';
      btnIcon.className = 'btn-icon bi bi-play-fill';
      btnText.textContent = 'スタート';
      startBtn.classList.remove('running');
    }
  }

  function toggleStart() {
    if (isGameOver) {
      initGame();
    }

    if (isRunning) {
      // 一時停止：移動途中の位置のまま止まる
      isRunning = false;
      updateUI();
    } else {
      isRunning = true;
      updateUI();
      // 静止状態からの開始時はすぐに1マス目を動き出す
      if (!hasMotion) {
        accumMs = 0;
        step();
      }
    }
  }

  function triggerGameOver() {
    isRunning = false;
    isGameOver = true;
    hasMotion = false;
    updateUI();
    statusText.textContent = '停止（身体接触）';
  }

  function triggerWin() {
    isRunning = false;
    isGameOver = true;
    updateUI();
    statusText.textContent = '完全制覇！';
  }

  // Listeners
  startBtn.addEventListener('click', toggleStart);
  resetBtn.addEventListener('click', () => {
    initGame();
  });

  // Init
  initGame();
  requestAnimationFrame(frame);
})();
