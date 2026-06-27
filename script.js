const gameArea = document.getElementById("gameArea");
const player = document.getElementById("player");
const scoreText = document.getElementById("score");
const livesText = document.getElementById("lives");
const timeText = document.getElementById("time");
const message = document.getElementById("message");
const startBtn = document.getElementById("startBtn");

const leftBtn = document.getElementById("leftBtn");
const rightBtn = document.getElementById("rightBtn");

let score = 0;
let lives = 3;
let timeLeft = 45;

let gameRunning = false;
let playerX = 0;
let playerSpeed = 7;

let objects = [];
let keys = {
  left: false,
  right: false
};

let spawnTimer;
let countdownTimer;
let gameAnimation;

const items = [
  { emoji: "⭐", type: "score", points: 1 },
  { emoji: "💎", type: "score", points: 3 },
  { emoji: "❤️", type: "life", points: 1 },
  { emoji: "💣", type: "bomb", points: 0 }
];

startBtn.addEventListener("click", startGame);

document.addEventListener("keydown", function (event) {
  if (event.key === "ArrowLeft" || event.key.toLowerCase() === "a") {
    keys.left = true;
  }

  if (event.key === "ArrowRight" || event.key.toLowerCase() === "d") {
    keys.right = true;
  }
});

document.addEventListener("keyup", function (event) {
  if (event.key === "ArrowLeft" || event.key.toLowerCase() === "a") {
    keys.left = false;
  }

  if (event.key === "ArrowRight" || event.key.toLowerCase() === "d") {
    keys.right = false;
  }
});

leftBtn.addEventListener("pointerdown", function () {
  keys.left = true;
});

leftBtn.addEventListener("pointerup", function () {
  keys.left = false;
});

leftBtn.addEventListener("pointerleave", function () {
  keys.left = false;
});

rightBtn.addEventListener("pointerdown", function () {
  keys.right = true;
});

rightBtn.addEventListener("pointerup", function () {
  keys.right = false;
});

rightBtn.addEventListener("pointerleave", function () {
  keys.right = false;
});

function startGame() {
  score = 0;
  lives = 3;
  timeLeft = 45;
  objects = [];
  gameRunning = true;

  scoreText.textContent = score;
  livesText.textContent = lives;
  timeText.textContent = timeLeft;

  message.textContent = "Catch the good stuff!";
  startBtn.textContent = "Restart Game";

  clearOldObjects();

  playerX = gameArea.clientWidth / 2 - player.offsetWidth / 2;
  updatePlayerPosition();

  clearInterval(spawnTimer);
  clearInterval(countdownTimer);
  cancelAnimationFrame(gameAnimation);

  spawnTimer = setInterval(createFallingObject, 750);

  countdownTimer = setInterval(function () {
    timeLeft--;
    timeText.textContent = timeLeft;

    if (timeLeft <= 0) {
      endGame();
    }
  }, 1000);

  gameLoop();
}

function gameLoop() {
  if (!gameRunning) {
    return;
  }

  movePlayer();
  moveObjects();

  gameAnimation = requestAnimationFrame(gameLoop);
}

function movePlayer() {
  if (keys.left) {
    playerX -= playerSpeed;
  }

  if (keys.right) {
    playerX += playerSpeed;
  }

  const maxX = gameArea.clientWidth - player.offsetWidth;

  if (playerX < 0) {
    playerX = 0;
  }

  if (playerX > maxX) {
    playerX = maxX;
  }

  updatePlayerPosition();
}

function updatePlayerPosition() {
  player.style.left = playerX + "px";
  player.style.transform = "translateX(0)";
}

function createFallingObject() {
  if (!gameRunning) {
    return;
  }

  const randomItem = items[Math.floor(Math.random() * items.length)];

  const objectElement = document.createElement("div");
  objectElement.classList.add("falling-object");
  objectElement.textContent = randomItem.emoji;

  const startX = Math.random() * (gameArea.clientWidth - 45);

  objectElement.style.left = startX + "px";
  objectElement.style.top = "-50px";

  gameArea.appendChild(objectElement);

  const speed = 2.2 + Math.random() * 2 + score * 0.025;

  objects.push({
    element: objectElement,
    x: startX,
    y: -50,
    speed: speed,
    item: randomItem
  });
}

function moveObjects() {
  for (let i = objects.length - 1; i >= 0; i--) {
    const object = objects[i];

    object.y += object.speed;
    object.element.style.top = object.y + "px";

    if (isColliding(object.element, player)) {
      catchObject(object);
      removeObject(i);
      continue;
    }

    if (object.y > gameArea.clientHeight + 60) {
      removeObject(i);
    }
  }
}

function catchObject(object) {
  const item = object.item;

  if (item.type === "score") {
    score += item.points;
    scoreText.textContent = score;
    message.textContent = `Nice! +${item.points}`;
    createFloatText("+" + item.points, object.element);
  }

  if (item.type === "life") {
    lives++;
    livesText.textContent = lives;
    message.textContent = "Extra life ❤️";
    createFloatText("+1 life", object.element);
  }

  if (item.type === "bomb") {
    lives--;
    livesText.textContent = lives;
    message.textContent = "Bomb! Be careful 💣";
    createFloatText("-1 life", object.element);
    shakePlayer();

    if (lives <= 0) {
      endGame();
    }
  }
}

function removeObject(index) {
  objects[index].element.remove();
  objects.splice(index, 1);
}

function isColliding(firstElement, secondElement) {
  const first = firstElement.getBoundingClientRect();
  const second = secondElement.getBoundingClientRect();

  return !(
    first.bottom < second.top ||
    first.top > second.bottom ||
    first.right < second.left ||
    first.left > second.right
  );
}

function createFloatText(text, objectElement) {
  const rect = objectElement.getBoundingClientRect();

  const floatText = document.createElement("div");
  floatText.classList.add("float-text");
  floatText.textContent = text;

  floatText.style.left = rect.left + "px";
  floatText.style.top = rect.top + "px";

  document.body.appendChild(floatText);

  setTimeout(function () {
    floatText.remove();
  }, 900);
}

function shakePlayer() {
  player.classList.add("shake");

  setTimeout(function () {
    player.classList.remove("shake");
  }, 260);
}

function endGame() {
  gameRunning = false;

  clearInterval(spawnTimer);
  clearInterval(countdownTimer);
  cancelAnimationFrame(gameAnimation);

  clearOldObjects();

  keys.left = false;
  keys.right = false;

  if (lives <= 0) {
    message.textContent = `Game Over! Your score is ${score}`;
  } else {
    message.textContent = `Time is up! Your score is ${score}`;
  }
}

function clearOldObjects() {
  const oldObjects = document.querySelectorAll(".falling-object");

  oldObjects.forEach(function (object) {
    object.remove();
  });

  objects = [];
}