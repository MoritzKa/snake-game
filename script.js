const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const restartButton = document.getElementById('restartButton');

const gridSize = 20; // Size of each grid cell
const canvasSize = canvas.width; // Assuming square canvas
const tileCount = canvasSize / gridSize; // Number of tiles in each row/column

// Game state
let snake, food, dx, dy, score, gameLoopTimeout, changingDirection, gameOver;

function initializeGame() {
    // Initial snake position and properties
    snake = [
        { x: Math.floor(tileCount / 2) * gridSize, y: Math.floor(tileCount / 2) * gridSize }, // Head
        { x: (Math.floor(tileCount / 2) - 1) * gridSize, y: Math.floor(tileCount / 2) * gridSize }, // Body segment 1
        { x: (Math.floor(tileCount / 2) - 2) * gridSize, y: Math.floor(tileCount / 2) * gridSize }  // Body segment 2
    ];
    // Initial movement direction (right)
    dx = gridSize;
    dy = 0;
    score = 0;
    scoreElement.textContent = score;
    changingDirection = false; // Prevent rapid direction changes causing self-collision
    gameOver = false;
    restartButton.style.display = 'none'; // Hide restart button initially
    generateFood();
    startGameLoop();
}

// --- Drawing Functions ---

function clearCanvas() {
    ctx.fillStyle = '#fff'; // Background color from CSS
    ctx.fillRect(0, 0, canvasSize, canvasSize);
}

function drawSnakePart(snakePart) {
    ctx.fillStyle = '#4CAF50'; // Snake color
    ctx.strokeStyle = '#333'; // Snake border color
    ctx.fillRect(snakePart.x, snakePart.y, gridSize, gridSize);
    ctx.strokeRect(snakePart.x, snakePart.y, gridSize, gridSize);
}

function drawSnake() {
    snake.forEach(drawSnakePart);
}

function drawFood() {
    ctx.fillStyle = '#f7931a'; // Bitcoin orange
    ctx.strokeStyle = '#e68a00'; // Darker orange border
    ctx.font = `${gridSize * 0.9}px Arial`; // Adjust font size relative to grid size
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    // Draw the Bitcoin symbol '₿' centered in the grid cell
    ctx.fillText('₿', food.x + gridSize / 2, food.y + gridSize / 2 + 1); // +1 for slight vertical adjustment
    ctx.strokeText('₿', food.x + gridSize / 2, food.y + gridSize / 2 + 1);
}

// --- Game Logic Functions ---

function moveSnake() {
    // Create the new snake head position based on current direction
    const head = { x: snake[0].x + dx, y: snake[0].y + dy };
    // Add the new head to the beginning of the snake array
    snake.unshift(head);

    // Check if snake ate food
    const didEatFood = snake[0].x === food.x && snake[0].y === food.y;
    if (didEatFood) {
        score += 10;
        scoreElement.textContent = score;
        generateFood(); // Generate new food
    } else {
        // Remove the last part of the snake's tail if no food was eaten
        snake.pop();
    }
}

function generateFood() {
    let newFoodX, newFoodY;
    // Keep generating coordinates until they are not on the snake
    while (true) {
        newFoodX = Math.floor(Math.random() * tileCount) * gridSize;
        newFoodY = Math.floor(Math.random() * tileCount) * gridSize;
        // Check if the new food position overlaps with any part of the snake
        let collision = false;
        for (let part of snake) {
            if (part.x === newFoodX && part.y === newFoodY) {
                collision = true;
                break;
            }
        }
        if (!collision) {
            break; // Found a valid spot
        }
    }
    food = { x: newFoodX, y: newFoodY };
}

function checkCollision() {
    const head = snake[0];

    // Check wall collision
    if (head.x < 0 || head.x >= canvasSize || head.y < 0 || head.y >= canvasSize) {
        return true;
    }

    // Check self collision (ignore the head itself)
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            return true;
        }
    }

    return false;
}

function handleGameOver() {
    gameOver = true;
    clearTimeout(gameLoopTimeout); // Stop the game loop
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvasSize, canvasSize);
    ctx.font = '40px Arial';
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.fillText('Game Over!', canvasSize / 2, canvasSize / 2 - 20);
    ctx.font = '20px Arial';
    ctx.fillText(`Final Score: ${score}`, canvasSize / 2, canvasSize / 2 + 20);
    restartButton.style.display = 'block'; // Show restart button
}

// --- Event Handling ---

function changeDirection(event) {
    if (changingDirection || gameOver) return; // Prevent changing direction if already changing or game over
    changingDirection = true;

    const keyPressed = event.key;
    const goingUp = dy === -gridSize;
    const goingDown = dy === gridSize;
    const goingRight = dx === gridSize;
    const goingLeft = dx === -gridSize;

    // Prevent moving in the opposite direction
    if (keyPressed === 'ArrowUp' && !goingDown) { dx = 0; dy = -gridSize; }
    if (keyPressed === 'ArrowDown' && !goingUp) { dx = 0; dy = gridSize; }
    if (keyPressed === 'ArrowLeft' && !goingRight) { dx = -gridSize; dy = 0; }
    if (keyPressed === 'ArrowRight' && !goingLeft) { dx = gridSize; dy = 0; }
}

// --- Game Loop ---

function gameLoop() {
    if (gameOver) return;

    // Allow next direction change
    changingDirection = false;

    gameLoopTimeout = setTimeout(() => {
        clearCanvas();
        drawFood();
        moveSnake();
        if (checkCollision()) {
            handleGameOver();
            return; // Stop the loop immediately on game over
        }
        drawSnake();
        gameLoop(); // Continue the loop
    }, 150); // Game speed (lower number = faster snake)
}

function startGameLoop() {
    // Clear any previous loop timeout if restarting
    if (gameLoopTimeout) {
        clearTimeout(gameLoopTimeout);
    }
    gameLoop();
}

// --- Initialization ---
document.addEventListener('keydown', changeDirection);
restartButton.addEventListener('click', initializeGame);

initializeGame(); // Start the game when the script loads
