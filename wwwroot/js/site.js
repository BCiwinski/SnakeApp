const DOWN = "down";
const UP = "up";
const RIGHT = "right";
const LEFT = "left";

const HEAD_ATTR = "head";
const SNAKE_ATTR = "snake";
const FRUIT_ATTR = "fruit";

const EMPTY = 0;
const HEAD = 1;
const SNAKE = 2;
const FRUIT = 3;

const GameObjToAttr =
{
    1: HEAD_ATTR,
    2: SNAKE_ATTR,
    3: FRUIT_ATTR
}

var Direction = DOWN;
var GameInProgess = false;

$(function () {
    prepareGame($('#game-grid')[0], 10);
})

$(window.addEventListener('keydown', function (e) {

    //Change direction-controlling var depending on user input
    //Refuse changing the direction to the opposite - snake cant move that way

    switch (e.key) {
        case 's':
            Direction = Direction == UP ? UP : DOWN;
            break;
        case 'w':
            Direction = Direction == DOWN ? DOWN : UP;
            break;
        case 'd':
            Direction = Direction == LEFT ? LEFT : RIGHT;
            break;
        case 'a':
            Direction = Direction == RIGHT ? RIGHT : LEFT;
            break;
    }

    if ((e.key == 's' || 'a' || 's' || 'd') && !GameInProgess) {

        startGame($('#game-grid')[0], 10, $('#game-message')[0]);
    }

}, false))

function startGame(gridElement, sizeNumber, messageElement) {

    GameInProgess = true;
    let gameState = prepareGame(gridElement, sizeNumber);

    sleep(1000).then(() => { gameTick(gameState, gridElement, messageElement) });
}

function prepareGame(gridElement, sizeNumber) {

    clearBoard(gridElement);
    generateBoardElements(gridElement, sizeNumber);

    let grid = generateGrid(sizeNumber);

    let snake = generateSnake(grid, sizeNumber);

    let gameState = { gridElement: gridElement, grid: grid, size: sizeNumber, snake: snake, ended: false };

    spawnFruitRandom(grid, sizeNumber, 1, 1, 3);

    updateGridElements(gameState, gridElement);

    return gameState;
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

/*A function for spawning a fruit on the grid
PARAMETERS:
gird - the grid to spawn fruit on - two dimensional int array
sizeNumber - size of the grid - int
chanceInvertedNumber - inverted chance to spawn a fruit with one run - int
positionTriesNumber - number of tries to find an empty spot - int
spawnTriesNumber - number of runs of the whole func - int
*/
function spawnFruitRandom(grid, sizeNumber, chanceInvertedNumber, positionTriesNumber, spawnTriesNumber) {

    for (let i = 0; i < spawnTriesNumber; i++) {

        let rand = Math.random() * chanceInvertedNumber;

        if (rand > 1.0) {
            return;
        }

        for (let j = 0; j < positionTriesNumber; j++) {

            let rand_x = Math.floor(Math.random() * (sizeNumber - 1));
            let rand_y = Math.round(Math.random() * (sizeNumber - 1));

            if (grid[rand_x][rand_y] == EMPTY) {

                grid[rand_x][rand_y] = FRUIT;
                break;
            }

        }
    }
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
        endGame(gameState, messageElement, "Snake hit his head :(");
        return gameState;
    }

    if (isOnSnake(newHeadPos, gameState) && !posAreEqual(newHeadPos, gameState.snake.end)) {
        endGame(gameState, messageElement, "Snake bit his tail :(");
        return gameState;
    }

    gameState.snake.body.push(oldHeadPos);

    //see if snake's head will be on a tile containing fruit
    if (gameState.grid[newHeadPos[0]][newHeadPos[1]] == FRUIT) {

        //add score
    }
    else {

        //if snake wont be eating a frunt, move his end (remove one part)
        gameState.grid[gameState.snake.end[0]][gameState.snake.end[1]] = EMPTY;
        gameState.snake.body.shift();
        gameState.snake.end = gameState.snake.body[0];
    }

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

function isOnSnake(pos, gameState) {

    return gameState.grid[pos[0]][pos[1]] == SNAKE;
}

function posAreEqual(pos1, pos2) {

    if (pos1[0] != pos2[0]) {

        return false;
    }

    if (pos1[1] != pos2[1]) {

        return false;
    }

    return true;
}

function endGame(gameState, messageElement, message) {

    gameState.ended = true;
    messageElement.innerText = message;

    GameInProgess = false;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
