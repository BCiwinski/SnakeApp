const DOWN = "down";
const UP = "up";
const RIGHT = "right";
const LEFT = "left";

const HEAD_ATTR = "head";
const SNAKE_ATTR = "snake";

const EMPTY = 0;
const HEAD = 1;
const SNAKE = 2;

const GameObjToAttr =
{
    1: HEAD_ATTR,
    2: SNAKE_ATTR
}

var Direction = DOWN;
var GameInProgess = false;

$(window.addEventListener('keydown', function (e) {

    switch (e.key) {
        case 's':
            Direction = DOWN;
            break;
        case 'w':
            Direction = UP;
            break;
        case 'd':
            Direction = RIGHT;
            break;
        case 'a':
            Direction = LEFT;
            break;
    }

    if ((e.key == 's' || 'a' || 's' || 'd') && !GameInProgess) {

        startGame($('#game-grid')[0], 10, $('#game-message')[0]);
    }

}, false))

function startGame(gridElement, sizeNumber, messageElement) {

    GameInProgess = true;

    clearBoard(gridElement);
    generateBoardElements(gridElement, sizeNumber);

    let grid = generateGrid(sizeNumber);

    let snake = generateSnake(grid, sizeNumber);

    let gameState = { gridElement: gridElement, grid: grid, size: sizeNumber, snake: snake, ended: false};

    updateGridElements(gameState, gridElement);

    sleep(250).then(() => { gameTick(gameState, gridElement, messageElement) });
}

function clearBoard(gridElement) {

    while (gridElement.hasChildNodes()) {

        gridElement.removeChild(gridElement.firstElementChild);
    }
}

function generateBoardElements(gridElement, sizeNumber) {

    let columns = "auto";

    for (let i = 1; i < sizeNumber; i++) {

        columns += " auto";
    }

    gridElement.style.gridTemplateColumns = columns;

    for (let i = 0; i < sizeNumber * sizeNumber; i++) {

        let tag = document.createElement("div");
        tag.className = "square";

        gridElement.appendChild(tag);
    }
}

function updateGridElements(gameState, gridElement) {

    for (let i = 0; i < gameState.size; i++) {

        for (let j = 0; j < gameState.size; j++) {

            const element = getTile(gridElement, gameState.size, [i, j]);

            for (let obj in GameObjToAttr) {

                element.removeAttribute(GameObjToAttr[obj]);

                if (gameState.grid[i][j] == obj) {

                    element.setAttribute(GameObjToAttr[obj], "");
                }
            }
        }
    }
}

function generateGrid(sizeNumber) {

    let result = [];

    for (let i = 0; i < sizeNumber; i++) {

        let row = [];

        for (let j = 0; j < sizeNumber; j++) {

            row.push(EMPTY);
        }

        result.push(row);
    }

    return result;
}

function generateSnake(grid, sizeNumber) {

    grid[0][0] = SNAKE;
    grid[0][1] = HEAD

    return { head: [0, 1], body: [[0, 0]], end: [0, 0]};
}

//pos - position - 2 value int array, so: pos[0] - x, pos[1] - y
function getTile(gridElement, sizeNumber, pos) {

    return gridElement.childNodes[pos[0] + pos[1] * sizeNumber];
}

function gameTick(gameState, gridElement, messageElement) {

    gameState = moveSnake(gameState, gridElement, messageElement);
    updateGridElements(gameState, gridElement);

    if (gameState.ended) {
        return;
    }

    sleep(250).then(() => { gameTick(gameState, gridElement, messageElement) });
}

function moveSnake(gameState, gridElement, messageElement) {

    const oldHeadPos = Array.from(gameState.snake.head);
    const newHeadPos = getPositionInDirection(gameState.snake.head, Direction);

    if (isOutsideTheBoard(newHeadPos, gameState.size)) {
        endGame(gameState, messageElement);
        return gameState;
    }

    gameState.snake.body.push(oldHeadPos);

    //if snake hasnt eaten a fruit now, move his end
    gameState.grid[gameState.snake.end[0]][gameState.snake.end[1]] = EMPTY;
    gameState.snake.body.shift();
    gameState.snake.end = gameState.snake.body[0];

    //move snake's head
    gameState.snake.head = newHeadPos;
    gameState.grid[newHeadPos[0]][newHeadPos[1]] = HEAD;

    //part of his body follows where his head was
    gameState.grid[oldHeadPos[0]][oldHeadPos[1]] = SNAKE;

    return gameState;
}

function getPositionInDirection(pos, direction) {

    newPos = Array.from(pos);

    switch (direction) {

        case DOWN:
            newPos[1] += 1;
            break;
        case UP:
            newPos[1] -= 1;
            break;
        case RIGHT:
            newPos[0] += 1;
            break;
        case LEFT:
            newPos[0] -= 1;
    }

    return newPos;
}

function isOutsideTheBoard(pos, size) {

    if (pos[0] < 0)
        return true;

    if (pos[1] < 0)
        return true;

    if (pos[0] >= size)
        return true;

    if (pos[1] >= size)
        return true;

    return false;
}

function endGame(gameState, messageElement) {

    gameState.ended = true;
    messageElement.innerText = "Snake hit his head :(";

    GameInProgess = false;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
