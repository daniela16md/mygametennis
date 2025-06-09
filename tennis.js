const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Constants
const paddleWidth = 10, paddleHeight = 100;
const ballRadius = 10;
const paddleSpeed = 8;
const maxScore = 5;

// Game state
let playerY, aiY;
let ballX, ballY, ballSpeedX, ballSpeedY;
let playerScore = 0, aiScore = 0;
let gameRunning = false;
let gamePaused = false;
let loopId = null;
const keysPressed = {};

// Key listeners
document.addEventListener("keydown", (e) => {
  keysPressed[e.key] = true;
  if (e.code === "Space") togglePause();
});
document.addEventListener("keyup", (e) => {
  keysPressed[e.key] = false;
});

// === INIT GAME ===
function initGame() {
  cancelAnimationFrame(loopId);
  loopId = null;

  playerY = canvas.height / 2 - paddleHeight / 2;
  aiY = playerY;
  ballX = canvas.width / 2;
  ballY = canvas.height / 2;
  ballSpeedX = 5 * (Math.random() > 0.5 ? 1 : -1);
  ballSpeedY = 5 * (Math.random() > 0.5 ? 1 : -1);
  playerScore = 0;
  aiScore = 0;
  gameRunning = true;
  gamePaused = false;

  document.getElementById("overlay").style.display = "none";
  const pauseBtn = document.getElementById("pauseBtn");
  if (pauseBtn) pauseBtn.textContent = "⏸ Pause";

  const startBtn = document.getElementById("startBtn");
  if (startBtn) startBtn.style.display = "none";

  loopId = requestAnimationFrame(gameLoop);
}

// === DRAWING FUNCTIONS ===
function drawRect(x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

function drawCircle(x, y, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

function drawText(text, x, y, size = 24) {
  ctx.fillStyle = "#fff";
  ctx.font = `${size}px Arial`;
  ctx.fillText(text, x, y);
}

// === GAME LOGIC ===
function resetBall() {
  ballX = canvas.width / 2;
  ballY = canvas.height / 2;
  ballSpeedX = -ballSpeedX;
  ballSpeedY = 5 * (Math.random() > 0.5 ? 1 : -1);
}

function checkGameOver() {
  if (playerScore >= maxScore || aiScore >= maxScore) {
    gameRunning = false;
    const message = playerScore > aiScore
      ? "🎉 Vous avez gagné !"
      : "Ting 🐭 a gagné...";
    document.getElementById("message").textContent = message;
    document.getElementById("overlay").style.display = "block";

    const startBtn = document.getElementById("startBtn");
    if (startBtn) startBtn.style.display = "block";
  }
}

function update() {
  if (!gameRunning || gamePaused) return;

  // Player movement
  if (keysPressed["ArrowUp"]) {
    playerY = Math.max(0, playerY - paddleSpeed * 1.5);
  }
  if (keysPressed["ArrowDown"]) {
    playerY = Math.min(canvas.height - paddleHeight, playerY + paddleSpeed * 1.5);
  }

  // Ball movement
  ballX += ballSpeedX;
  ballY += ballSpeedY;

  // Bounce on top/bottom
  if (ballY <= 0 || ballY >= canvas.height) ballSpeedY = -ballSpeedY;

  // AI movement
  aiY += ((ballY - (aiY + paddleHeight / 2))) * 0.1;

  // Collisions
  if (
    ballX - ballRadius < 10 &&
    ballY > playerY &&
    ballY < playerY + paddleHeight
  ) {
    ballSpeedX = -ballSpeedX;
  }

  if (
    ballX + ballRadius > canvas.width - 10 &&
    ballY > aiY &&
    ballY < aiY + paddleHeight
  ) {
    ballSpeedX = -ballSpeedX;
  }

  // Scoring
  if (ballX < 0) {
    aiScore++;
    checkGameOver();
    resetBall();
  } else if (ballX > canvas.width) {
    playerScore++;
    checkGameOver();
    resetBall();
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawRect(0, 0, canvas.width, canvas.height, "#2e8b57");
  drawRect(0, playerY, paddleWidth, paddleHeight, "#fff");
  drawRect(canvas.width - paddleWidth, aiY, paddleWidth, paddleHeight, "#fff");
  drawCircle(ballX, ballY, ballRadius, "#90ee90");
  drawText(`Cole: ${playerScore}`, 100, 30);
  drawText(`Ting: ${aiScore}`, canvas.width - 150, 30);

  if (gamePaused) {
    drawText("⏸ Pause", canvas.width / 2 - 50, canvas.height / 2, 36);
  }
}

// === GAME LOOP ===
function gameLoop() {
  loopId = null;
  update();
  draw();
  if (gameRunning && !gamePaused) {
    loopId = requestAnimationFrame(gameLoop);
  }
}

// === CONTROLS ===
function moveUp() {
  if (playerY > 0) playerY -= paddleSpeed;
}

function moveDown() {
  if (playerY + paddleHeight < canvas.height) playerY += paddleSpeed;
}

function togglePause() {
  if (!gameRunning) return;
  gamePaused = !gamePaused;

  const pauseBtn = document.getElementById("pauseBtn");
  if (pauseBtn) pauseBtn.textContent = gamePaused ? "▶ Reprendre" : "⏸ Pause";

  if (!gamePaused && loopId === null) {
    loopId = requestAnimationFrame(gameLoop);
  }
}

function restartGame() {
  initGame();
}

// === RESPONSIVE CANVAS ===
function resizeCanvas() {
  const ratio = canvas.width / canvas.height;
  const width = Math.min(window.innerWidth - 20, 800);
  canvas.style.width = width + "px";
  canvas.style.height = width / ratio + "px";
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

// NOTE: Removed auto-call to initGame();

