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
var GameState;
var GameMode;

$(function () {
    GameMode = JSON.parse($(".gamemode-button")[0].value);
    GameState = prepareGame($('#game-grid')[0], GameMode.Size);

    $(".gamemode-button").each(function (index, element) {

        this.addEventListener('click', function (e) {

            if (GameInProgess) {
                return;
            }

            GameMode = JSON.parse(element.value);

            GameState = prepareGame($('#game-grid')[0], GameMode.Size);
        })
    })
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

        if (GameState.ended) {

            GameState = prepareGame($('#game-grid')[0], GameMode.Size);
        }

        startGame($('#game-grid')[0], 10, $('#game-message')[0], GameMode);
    }

}, false))

function startGame(gridElement, sizeNumber, messageElement, gameMode) {

    GameInProgess = true;
    messageElement.innerText = "It's snake o'Clock!";

    sleep(1000).then(() => { gameTick(GameState, gridElement, messageElement, gameMode.TickMiliseconds) });
}

function prepareGame(gridElement, sizeNumber) {

    clearBoard(gridElement);
    generateBoardElements(gridElement, sizeNumber);

    let grid = generateGrid(sizeNumber);

    let snake = generateSnake(grid, sizeNumber);

    let gameState = { gridElement: gridElement, grid: grid, size: sizeNumber, snake: snake, ended: false };

    spawnFruitRandom(grid, sizeNumber, GameMode.FruitSpawnChance, GameMode.FruitSpawnPositionTries, GameMode.FruitSpawnNumber);

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

            const element = getTile(gridElement, gameState.size, {x : i, y : j});

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

    return { head: { x: 0, y: 1 }, body: [{ x: 0, y: 0 }], end: { x: 0, y: 0 } };
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
            continue;
        }

        for (let j = 0; j < positionTriesNumber; j++) {

            let rand_x = Math.round(Math.random() * (sizeNumber - 1));
            let rand_y = Math.round(Math.random() * (sizeNumber - 1));

            if (grid[rand_x][rand_y] == EMPTY) {

                grid[rand_x][rand_y] = FRUIT;
                break;
            }

        }
    }
}

//pos - position - {x: int, y: int}
function getTile(gridElement, sizeNumber, pos) {

    return gridElement.childNodes[pos.x + pos.y * sizeNumber];
}

function gameTick(gameState, gridElement, messageElement, nextTickMs) {

    gameState = moveSnake(gameState, gridElement, messageElement);
    spawnFruitRandom(gameState.grid, gameState.size, GameMode.FruitSpawnChance, GameMode.FruitSpawnPositionTries, GameMode.FruitSpawnNumber);
    updateGridElements(gameState, gridElement);

    if (gameState.ended) {
        return;
    }

    sleep(nextTickMs).then(() => { gameTick(gameState, gridElement, messageElement, nextTickMs) });
}

function moveSnake(gameState, gridElement, messageElement) {

    if (isWon(gameState)) {
        endGame(gameState, messageElement, "Snake won!");
        return gameState;
    }

    const oldHeadPos = {...gameState.snake.head };
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
    if (gameState.grid[newHeadPos.x][newHeadPos.y] == FRUIT) {

        //add score
    }
    else {

        //if snake wont be eating a frunt, move his end (remove one part)
        gameState.grid[gameState.snake.end.x][gameState.snake.end.y] = EMPTY;
        gameState.snake.body.shift();
        gameState.snake.end = gameState.snake.body[0];
    }

    //move snake's head
    gameState.snake.head = newHeadPos;
    gameState.grid[newHeadPos.x][newHeadPos.y] = HEAD;

    //part of his body follows where his head was
    gameState.grid[oldHeadPos.x][oldHeadPos.y] = SNAKE;

    return gameState;
}

function getPositionInDirection(pos, direction) {

    newPos = {...pos};

    switch (direction) {

        case DOWN:
            newPos.y += 1;
            break;
        case UP:
            newPos.y -= 1;
            break;
        case RIGHT:
            newPos.x += 1;
            break;
        case LEFT:
            newPos.x -= 1;
    }

    return newPos;
}

function isOutsideTheBoard(pos, size) {

    if (pos.x < 0)
        return true;

    if (pos.y < 0)
        return true;

    if (pos.x >= size)
        return true;

    if (pos.y >= size)
        return true;

    return false;
}

function isOnSnake(pos, gameState) {

    return gameState.grid[pos.x][pos.y] == SNAKE;
}

function isWon(gameState) {

    for (let i = 0; i < gameState.size; i++) {

        for (let j = 0; j < gameState.size; j++) {

            tile = gameState.grid[i][j]

            if (tile == EMPTY || tile == FRUIT) {

                return false;
            }
        }
    }

    return true;
}

function posAreEqual(pos1, pos2) {

    if (pos1.x != pos2.x) {

        return false;
    }

    if (pos1.y != pos2.y) {

        return false;
    }

    return true;
}

function endGame(gameState, messageElement, message) {

    gameState.ended = true;
    messageElement.innerText = message;

    Direction = DOWN;
    GameInProgess = false;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
