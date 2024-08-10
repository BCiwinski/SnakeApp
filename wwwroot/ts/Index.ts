import {Point, Grid} from "./Point.js";

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
    GameMode = JSON.parse(($(".gamemode-button")[0] as HTMLInputElement).value);
    GameState = prepareGame($('#game-grid')[0], GameMode.Size);

    //Add event listener to all gamemode-controlling buttons for changing gamemodes
    $(".gamemode-button").each(function (index: number, element : HTMLInputElement) {

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

$(function () {
    window.addEventListener("keydown", function (e) {

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
    })
})

function startGame(grid: HTMLElement, size: Number, message: HTMLElement, gameMode) : void{

    GameInProgess = true;
    message.innerText = "It's snake o'Clock!";

    //start the game main loop by calling first gameTick()
    //delay first tick a bit
    new Promise<void>(resolve => setTimeout(resolve, 1000)).then(() => { gameTick(GameState, grid, message, gameMode.TickMiliseconds) });
}

function prepareGame(grid: HTMLElement, size: number){

    clearBoard(grid);
    generateBoardElements(grid, size);

    let gridModel: Grid = new Grid(size);
    let snake = generateSnake(gridModel, size);
    let gameState = { gridElement: grid, grid: gridModel, size: size, snake: snake, ended: false };

    //Spawn some fruits before the game begins and updateGird to make the visible
    spawnFruitRandom(gridModel, size, GameMode.FruitSpawnChance, GameMode.FruitSpawnPositionTries, GameMode.FruitSpawnNumber);
    updateGridElements(gameState, grid);

    return gameState;
}

//function for removing all tiles/squares the game takes place on
function clearBoard(grid : HTMLElement) {

    while (grid.hasChildNodes()) {

        grid.removeChild(grid.firstElementChild);
    }
}

//create sizeNumber^2 elements as child nods of gridElement
function generateBoardElements(grid : HTMLElement, size : number) {

    let columns = "auto";

    for (let i = 1; i < size; i++) {

        columns += " auto";
    }

    grid.style.gridTemplateColumns = columns;

    for (let i = 0; i < size * size; i++) {

        let tag = document.createElement("div");
        tag.className = "square";

        grid.appendChild(tag);
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

                if (gameState.grid.getTile(new Point(i, j)) == obj) {

                    element.setAttribute(GameObjToAttr[obj], "");
                }
            }
        }
    }
}

function generateSnake(grid : Grid, sizeNumber) {

    let body: Point = new Point(0, 0);
    let head: Point = new Point(0, 1);

    grid.setTile(SNAKE, body);
    grid.setTile(HEAD, head);

    return { head: head, body: [body], end: body };
}

/*A function for spawning a fruit on the grid
PARAMETERS:
gird - the grid to spawn fruit on - two dimensional int array
sizeNumber - size of the grid - int
chanceInvertedNumber - inverted chance to spawn a fruit with one run - int
positionTriesNumber - number of tries to find an empty spot - int
spawnTriesNumber - number of runs of the whole func - int
*/
function spawnFruitRandom(grid : Grid, sizeNumber, chanceInvertedNumber, positionTriesNumber, spawnTriesNumber) {

    for (let i = 0; i < spawnTriesNumber; i++) {

        let rand = Math.random() * chanceInvertedNumber;

        if (rand > 1.0) {
            continue;
        }

        for (let j = 0; j < positionTriesNumber; j++) {

            let rand_x = Math.round(Math.random() * (sizeNumber - 1));
            let rand_y = Math.round(Math.random() * (sizeNumber - 1));

            let rand_point = new Point(rand_x, rand_y);

            if (grid.getTile(rand_point) == EMPTY) {

                grid.setTile(FRUIT, rand_point);
                break;
            }

        }
    }
}

//retrive a tile/square element at position x - right, y - down
//position is {x: int, y: int}
function getTile(gridElement, size : number, position) {

    return gridElement.childNodes[position.x + position.y * size];
}

//main game loop
function gameTick(gameState, grid : HTMLElement, message : HTMLElement, delayMs : number) : void {

    gameState = progressGameState(gameState, grid, message);
    spawnFruitRandom(gameState.grid, gameState.size, GameMode.FruitSpawnChance, GameMode.FruitSpawnPositionTries, GameMode.FruitSpawnNumber);
    updateGridElements(gameState, grid);

    if (gameState.ended) {
        return;
    }

    //if the game isn't ended - call next tick
    //delay next this given delayMs
    new Promise<void>(resolve => setTimeout(resolve, delayMs)).then(() => { gameTick(gameState, grid, message, delayMs) });
}

//function for simulating gameState progression
//also checks if current gameState statisfies conditions for either loss or win
function progressGameState(gameState, gridElement, message : HTMLElement) {

    if (isWon(gameState)) {
        endGame(gameState, message, "Snake won!");
        return gameState;
    }

    const oldHeadPos: Point = new Point(gameState.snake.head.x, gameState.snake.head.y);
    const newHeadPos : Point = getPositionInDirection(gameState.snake.head, Direction);

    if (isOutsideTheBoard(newHeadPos, gameState.size)) {
        endGame(gameState, message, "Snake hit his head :(");
        return gameState;
    }

    if (isOnSnake(newHeadPos, gameState) && !posAreEqual(newHeadPos, gameState.snake.end)) {
        endGame(gameState, message, "Snake bit his tail :(");
        return gameState;
    }

    gameState.snake.body.push(oldHeadPos);

    //see if snake's head will be on a tile containing fruit
    if (gameState.grid.getTile(newHeadPos) == FRUIT) {

        //add score
    }
    else {

        //if snake wont be eating a frunt, move his end (remove one part)
        gameState.grid.setTile(EMPTY, gameState.snake.end);
        gameState.snake.body.shift();
        gameState.snake.end = gameState.snake.body[0];
    }

    //move snake's head
    gameState.snake.head = newHeadPos;
    gameState.grid.setTile(HEAD, newHeadPos);

    //part of his body follows where his head was
    gameState.grid.setTile(SNAKE, oldHeadPos);

    return gameState;
}

//find a position {x: int, y: int} this is next to the given position in the give direction
//where direction must be one of DOWN = "down",UP = "up",RIGHT = "right", or  LEFT = "left"
function getPositionInDirection(position : Point, direction) : Point {

    let newPos : Point = { ...position };

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
function isOutsideTheBoard(position : Point, size: number) : boolean {

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
function isOnSnake(position : Point, gameState) : boolean {

    return gameState.grid.getTile(position) == SNAKE;
}

//checks if a given gameState satisfies conditions for victory
function isWon(gameState) : boolean {

    for (let i = 0; i < gameState.size; i++) {

        for (let j = 0; j < gameState.size; j++) {

            let tile = gameState.grid.getTile(new Point(i, j));

            if (tile == EMPTY || tile == FRUIT) {

                return false;
            }
        }
    }

    return true;
}

//checks if two given positions have the same value
function posAreEqual(first : Point, second : Point) : boolean {

    if (first.x != second.x) {

        return false;
    }

    if (first.y != second.y) {

        return false;
    }

    return true;
}

//marks the game (gameState) as ended, sets the message in messageElement
//resets necassary variables to allow for preparing of the next game
function endGame(gameState, message :HTMLElement, text : string) : void {

    gameState.ended = true;
    message.innerText = text;

    Direction = DOWN;
    GameInProgess = false;
}