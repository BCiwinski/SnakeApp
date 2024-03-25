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

    //By default (on DOM load) assume first gamemode button's gamemode (it's value)
    //This should be the most basic/stadard gamemode
    GameMode = JSON.parse($(".gamemode-button")[0].value);
    GameState = prepareGame($('#game-grid')[0], GameMode.Size);

    //Add event listener to all gamemode-controlling buttons for changing gamemodes
    $(".gamemode-button").each(function (index, element) {

        this.addEventListener('click', function (e) {

            //refuse changing gamemode if a game is in progress
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

    //Spawn some fruits before the game begins and updateGird to make the visible
    spawnFruitRandom(grid, sizeNumber, GameMode.FruitSpawnChance, GameMode.FruitSpawnPositionTries, GameMode.FruitSpawnNumber);
    updateGridElements(gameState, gridElement);

    return gameState;
}

//function for removing all tiles/squares the game takes place on
function clearBoard(gridElement) {

    while (gridElement.hasChildNodes()) {

        gridElement.removeChild(gridElement.firstElementChild);
    }
}

//create sizeNumber^2 elements as child nods of gridElement
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

//main function for "rendering" the game
//adds and removes attributes of gridElement's child elements to reflect given gameState
function updateGridElements(gameState, gridElement) {

    for (let i = 0; i < gameState.size; i++) {

        for (let j = 0; j < gameState.size; j++) {

            const element = getTile(gridElement, gameState.size, { x: i, y: j });

            for (let obj in GameObjToAttr) {

                element.removeAttribute(GameObjToAttr[obj]);

                if (gameState.grid[i][j] == obj) {

                    element.setAttribute(GameObjToAttr[obj], "");
                }
            }
        }
    }
}

//crates a 2D sizeNumber x sizeNumber int array of zeros (EMPTY)
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

//creats a snake obj:
//{ head: { x: 0, y: 1 }, body: [{ x: 0, y: 0 }], end: { x: 0, y: 0 } }
//where body is an array of {x: int, y: int} containing all snake's segements excluding its head, but including its end
//end is the last segement of snake's body ~ furthest from head
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

//retrive a tile/square element at position x - right, y - down
//position is {x: int, y: int}
function getTile(gridElement, sizeNumber, position) {

    return gridElement.childNodes[position.x + position.y * sizeNumber];
}

//main game loop
function gameTick(gameState, gridElement, messageElement, nextTickMs) {

    gameState = progressGameState(gameState, gridElement, messageElement);
    spawnFruitRandom(gameState.grid, gameState.size, GameMode.FruitSpawnChance, GameMode.FruitSpawnPositionTries, GameMode.FruitSpawnNumber);
    updateGridElements(gameState, gridElement);

    if (gameState.ended) {
        return;
    }

    sleep(nextTickMs).then(() => { gameTick(gameState, gridElement, messageElement, nextTickMs) });
}

//function for simulating gameState progression
//also checks if current gameState statisfies conditions for either loss or win
function progressGameState(gameState, gridElement, messageElement) {

    if (isWon(gameState)) {
        endGame(gameState, messageElement, "Snake won!");
        return gameState;
    }

    const oldHeadPos = { ...gameState.snake.head };
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

//find a position {x: int, y: int} this is next to the given position in the give direction
//where direction must be one of DOWN = "down",UP = "up",RIGHT = "right", or  LEFT = "left"
function getPositionInDirection(position, direction) {

    newPos = { ...position };

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

//checks whether a given position is outside a board of given size
function isOutsideTheBoard(position, size) {

    if (position.x < 0)
        return true;

    if (position.y < 0)
        return true;

    if (position.x >= size)
        return true;

    if (position.y >= size)
        return true;

    return false;
}

//checks whether any snake's segement occupies given position
function isOnSnake(position, gameState) {

    return gameState.grid[position.x][position.y] == SNAKE;
}

//checks if a given gameState satisfies conditions for victory
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

//checks if two given positions have the same value
function posAreEqual(position1, position2) {

    if (position1.x != position2.x) {

        return false;
    }

    if (position1.y != position2.y) {

        return false;
    }

    return true;
}

//marks the game (gameState) as ended, sets the message in messageElement
//resets necassary variables to allow for preparing of the next game
function endGame(gameState, messageElement, message) {

    gameState.ended = true;
    messageElement.innerText = message;

    Direction = DOWN;
    GameInProgess = false;
}

//used for delay between game ticks
//TODO: remove
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
