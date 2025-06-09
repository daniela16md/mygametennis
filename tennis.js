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

let moveDirection = 0;
const keysPressed = {};

// Input
document.addEventListener("keydown", (e) => {
  keysPressed[e.key] = true;
  if (e.code === "Space") togglePause();
});
document.addEventListener("keyup", (e) => {
  keysPressed[e.key] = false;
});

// Game init
function initGame() {
  cancelAnimationFrame(loopId);

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
  document.getElementById("pauseBtn").textContent = "⏸ Pause";
  document.getElementById("startBtn").style.display = "none";

  gameLoop();
}

// Game loop
function gameLoop() {
  if (!gameRunning) return;
  if (!gamePaused) {
    update();
    draw();
  }
  loopId = requestAnimationFrame(gameLoop);
}

// Update logic
function update() {
    // 👇 REMOVE these 3 lines — they're interfering:
    // if (keysPressed["ArrowUp"]) moveDirection = -1;
    // else if (keysPressed["ArrowDown"]) moveDirection = 1;
    // else moveDirection = 0;
  
    // ✅ NEW: use keys independently
    let keyDirection = 0;
    if (keysPressed["ArrowUp"]) keyDirection = -1;
    else if (keysPressed["ArrowDown"]) keyDirection = 1;
  
    // ✅ Combine key or mobile move direction
    const direction = moveDirection !== 0 ? moveDirection : keyDirection;
  
    // ✅ Move paddle using direction
    if (direction === -1) {
      playerY = Math.max(0, playerY - paddleSpeed);
    } else if (direction === 1) {
      playerY = Math.min(canvas.height - paddleHeight, playerY + paddleSpeed);
    }
  
    // 👇 rest of your update() logic
    ballX += ballSpeedX;
    ballY += ballSpeedY;
    if (ballY <= 0 || ballY >= canvas.height) ballSpeedY = -ballSpeedY;
    aiY += ((ballY - (aiY + paddleHeight / 2))) * 0.1;
  
    if (ballX - ballRadius < paddleWidth && ballY > playerY && ballY < playerY + paddleHeight) {
      ballSpeedX = -ballSpeedX;
    }
  
    if (ballX + ballRadius > canvas.width - paddleWidth && ballY > aiY && ballY < aiY + paddleHeight) {
      ballSpeedX = -ballSpeedX;
    }
  
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

// Draw everything
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#2e8b57";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Paddles
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, playerY, paddleWidth, paddleHeight);
  ctx.fillRect(canvas.width - paddleWidth, aiY, paddleWidth, paddleHeight);

  // Ball
  ctx.beginPath();
  ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
  ctx.fillStyle = "#90ee90";
  ctx.fill();

  // Scores
  ctx.fillStyle = "#fff";
  ctx.font = "24px Arial";
  ctx.fillText(`Cole: ${playerScore}`, 100, 30);
  ctx.fillText(`Ting: ${aiScore}`, canvas.width - 150, 30);

  // Pause text
  if (gamePaused) {
    ctx.font = "36px Arial";
    ctx.fillText("⏸ Pause", canvas.width / 2 - 60, canvas.height / 2);
  }
}

// Utility
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
    document.getElementById("overlay").style.display = "flex";
    document.getElementById("startBtn").style.display = "block";
  }
}

// Controls
function startMove(dir) {
  moveDirection = dir;
}
function stopMove() {
  moveDirection = 0;
}
function togglePause() {
  if (!gameRunning) return;
  gamePaused = !gamePaused;
  document.getElementById("pauseBtn").textContent = gamePaused ? "▶ Reprendre" : "⏸ Pause";
}
function restartGame() {
  initGame();
}

// Resize for responsiveness
function resizeCanvas() {
    const aspectRatio = 800 / 500;
    const marginVertical = 120;  // space for buttons/footer
    const marginHorizontal = 20; // small horizontal margin
  
    const vw = window.innerWidth;
    const vh = window.innerHeight;
  
    let maxWidth, maxHeight;
  
    if (vw > vh) {
      // Landscape: limit height more strictly to avoid too tall canvas
      maxHeight = vh - marginVertical * 1.5; // smaller height in landscape
      maxWidth = vw - marginHorizontal;
    } else {
      // Portrait: more height available
      maxHeight = vh - marginVertical;
      maxWidth = vw - marginHorizontal;
    }
  
    let newWidth = maxWidth;
    let newHeight = newWidth / aspectRatio;
  
    if (newHeight > maxHeight) {
      newHeight = maxHeight;
      newWidth = newHeight * aspectRatio;
    }
  
    // Set canvas internal pixel size fixed (for game logic)
    canvas.width = 800;
    canvas.height = 500;
  
    // Set CSS size to scale canvas visually
    canvas.style.width = newWidth + "px";
    canvas.style.height = newHeight + "px";
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();
// === Touch Move Paddle ===
canvas.addEventListener("touchstart", handleTouch);
canvas.addEventListener("touchmove", handleTouch);

function handleTouch(event) {
  event.preventDefault();
  const touch = event.touches[0];
  const rect = canvas.getBoundingClientRect();
  const touchY = touch.clientY - rect.top;

  // Center paddle on touch Y (clamped within canvas)
  playerY = Math.min(
    canvas.height - paddleHeight,
    Math.max(0, touchY - paddleHeight / 2)
  );
}