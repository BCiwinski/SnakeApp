import {Point, Grid, Snake, State, Direction} from "./Point.js";

const HEAD_ATTR = "head";
const SNAKE_ATTR = "snake";
const FRUIT_ATTR = "fruit";

const EMPTY = 0;
const HEAD = 1;
const SNAKE = 2;
const FRUIT = 3;

const GameObjToAttr = new Map;
GameObjToAttr.set(1, HEAD_ATTR);
GameObjToAttr.set(2, SNAKE_ATTR);
GameObjToAttr.set(3, FRUIT_ATTR);

//const GameObjToAttr =
//{
//    1: HEAD_ATTR,
//    2: SNAKE_ATTR,
//    3: FRUIT_ATTR
//}

var Current: Direction = "down";
var GameInProgess = false;
var GameState: State;
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
                Current = Current == "up" ? "up" : "down";
                break;
            case 'w':
                Current = Current == "down" ? "down" : "up";
                break;
            case 'd':
                Current = Current == "left" ? "left" : "right";
                break;
            case 'a':
                Current = Current == "right" ? "right" : "left";
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

function prepareGame(grid: HTMLElement, size: number) : State{

    clearBoard(grid);
    generateBoardElements(grid, size);

    let gridModel: Grid = new Grid(size);
    let snake: Snake = new Snake(gridModel);
    let gameState = new State(grid, gridModel, snake);

    //Spawn some fruits before the game begins and updateGird to make the visible
    spawnFruitRandom(gridModel, GameMode.FruitSpawnChance, GameMode.FruitSpawnPositionTries, GameMode.FruitSpawnNumber);
    updateGridElements(gameState, grid);

    return gameState;
}

//function for removing all tiles/squares the game takes place on
function clearBoard(grid : HTMLElement) : void {

    while (grid.hasChildNodes()) {

        grid.removeChild(grid.firstElementChild);
    }
}

//create sizeNumber^2 elements as child nods of gridElement
function generateBoardElements(grid : HTMLElement, size : number) : void {

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
function updateGridElements(gameState : State, grid : HTMLElement) {

    for (let i = 0; i < gameState.grid.size; i++) {

        for (let j = 0; j < gameState.grid.size; j++) {

            const element = getTile(grid, gameState.grid.size, { x: i, y: j });

            for (let [obj, attr] of GameObjToAttr) {

                element.removeAttribute(attr);

                if (gameState.grid.getTile(new Point(i, j)) == obj) {

                    element.setAttribute(attr, "");
                }
            }
        }
    }
}

/*A function for spawning a fruit on the grid
PARAMETERS:
gird - the grid to spawn fruit on - two dimensional int array
sizeNumber - size of the grid - int
chanceInvertedNumber - inverted chance to spawn a fruit with one run - int
positionTriesNumber - number of tries to find an empty spot - int
spawnTriesNumber - number of runs of the whole func - int
*/
function spawnFruitRandom(grid : Grid, chanceInverted : number, positionTries : number, spawnTries : number) : void {

    for (let i = 0; i < spawnTries; i++) {

        let rand = Math.random() * chanceInverted;

        if (rand > 1.0) {
            continue;
        }

        for (let j = 0; j < positionTries; j++) {

            let rand_x = Math.round(Math.random() * (grid.size - 1));
            let rand_y = Math.round(Math.random() * (grid.size - 1));

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
function getTile(grid : HTMLElement, size : number, position) : HTMLElement {

    return grid.childNodes[position.x + position.y * size] as HTMLElement;
}

//main game loop
function gameTick(game : State, grid : HTMLElement, message : HTMLElement, delayMs : number) : void {

    game = progressGameState(game, message);
    spawnFruitRandom(game.grid, GameMode.FruitSpawnChance, GameMode.FruitSpawnPositionTries, GameMode.FruitSpawnNumber);
    updateGridElements(game, grid);

    if (game.ended) {
        return;
    }

    //if the game isn't ended - call next tick
    //delay next this given delayMs
    new Promise<void>(resolve => setTimeout(resolve, delayMs)).then(() => { gameTick(game, grid, message, delayMs) });
}

//function for simulating gameState progression
//also checks if current gameState statisfies conditions for either loss or win
function progressGameState(game : State, message : HTMLElement) : State {

    if (isWon(game)) {
        endGame(game, message, "Snake won!");
        return game;
    }

    const oldHeadPos: Point = new Point(game.snake.head.x, game.snake.head.y);
    const newHeadPos : Point = getPositionInDirection(game.snake.head, Current);

    if (isOutsideTheBoard(newHeadPos, game.grid.size)) {
        endGame(game, message, "Snake hit his head :(");
        return game;
    }

    if (isOnSnake(newHeadPos, game) && !posAreEqual(newHeadPos, game.snake.end)) {
        endGame(game, message, "Snake bit his tail :(");
        return game;
    }

    game.snake.body.push(oldHeadPos);

    //see if snake's head will be on a tile containing fruit
    if (game.grid.getTile(newHeadPos) == FRUIT) {

        //add score
    }
    else {

        //if snake wont be eating a frunt, move his end (remove one part)
        game.grid.setTile(EMPTY, game.snake.end);
        game.snake.body.shift();
        game.snake.end = game.snake.body[0];
    }

    //move snake's head
    game.snake.head = newHeadPos;
    game.grid.setTile(HEAD, newHeadPos);

    //part of his body follows where his head was
    game.grid.setTile(SNAKE, oldHeadPos);

    return game;
}

//find a position {x: int, y: int} this is next to the given position in the give direction
//where direction must be one of DOWN = "down",UP = "up",RIGHT = "right", or  LEFT = "left"
function getPositionInDirection(position : Point, direction : Direction) : Point {

    let newPos : Point = { ...position };

    switch (direction) {

        case "down":
            newPos.y += 1;
            break;
        case "up":
            newPos.y -= 1;
            break;
        case "right":
            newPos.x += 1;
            break;
        case "left":
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
function isOnSnake(position : Point, game : State) : boolean {

    return game.grid.getTile(position) == SNAKE;
}

//checks if a given gameState satisfies conditions for victory
function isWon(game : State) : boolean {

    for (let i = 0; i < game.grid.size; i++) {
        
        for (let j = 0; j < game.grid.size; j++) {

            let tile = game.grid.getTile(new Point(i, j));

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
function endGame(game, message :HTMLElement, text : string) : void {

    game.ended = true;
    message.innerText = text;

    Current = "down";
    GameInProgess = false;
}