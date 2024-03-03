const DOWN = "down";
const UP = "up";
const RIGHT = "right";
const LEFT = "left";

const HEAD_ATTR = "head";
const SNAKE_ATTR = "snake";
function startGame(gridTag, sizeNumber) {

    clearBoard(gridTag);
    generateBoard(gridTag, sizeNumber);

    let snake = generateSnake(gridTag, sizeNumber);

    let gameState = { grid: gridTag, size: sizeNumber, snake: snake, direction: DOWN};

    gameTick(gameState);
}

function clearBoard(gridTag) {

    while (gridTag.hasChildNodes()) {

        gridTag.removeChild(gridTag.firstElementChild);
    }
}

function generateBoard(gridTag, sizeNumber) {

    let columns = "auto";

    for (let i = 1; i < sizeNumber; i++) {

        columns += " auto";
    }

    gridTag.style.gridTemplateColumns = columns;

    for (let i = 0; i < sizeNumber * sizeNumber; i++) {

        let tag = document.createElement("div");
        tag.className = "square";

        gridTag.appendChild(tag);
    }
}

function generateSnake(gridTag, sizeNumber) {

    let bodyTile = getTile(gridTag, sizeNumber, [0, 0]);
    let headTile = getTile(gridTag, sizeNumber, [0, 1]);

    bodyTile.setAttribute(SNAKE_ATTR, "");
    headTile.setAttribute(HEAD_ATTR, "");

    return { head: [0, 1], body: [[0, 0]], end: [0, 0]};
}

//pos - position - 2 value int array, so: pos[0] - x, pos[1] - y
function getTile(gridTag, sizeNumber, pos) {

    return gridTag.childNodes[pos[0] + pos[1] * sizeNumber];
}

function gameTick(gameState) {

    gameState = moveSnake(gameState);
    sleep(1000).then(() => { gameTick(gameState) });
}

function moveSnake(gamestate) {

    const oldHeadPos = Array.from(gamestate.snake.head);
    const newHeadPos = getPositionInDirection(gamestate.snake.head, gamestate.direction);

    //check if snake can move there
    //fail the game if not

    const endPosTile = getTile(gamestate.grid, gamestate.size, gamestate.snake.end);
    const oldHeadPosTile = getTile(gamestate.grid, gamestate.size, gamestate.snake.head);
    const newHeadPosTile = getTile(gamestate.grid, gamestate.size, newHeadPos);

    gamestate.snake.body.push(oldHeadPos);

    //if snake hasnt eaten a fruit now, move his end too
    gamestate.snake.body.shift();
    gamestate.snake.end = gamestate.snake.body[0];

    gamestate.snake.head = newHeadPos;

    newHeadPosTile.setAttribute(HEAD_ATTR, "");
    oldHeadPosTile.setAttribute(SNAKE_ATTR, "");
    oldHeadPosTile.removeAttribute(HEAD_ATTR);

    //if snake hasnt eaten a friut now, move his end too (visually)
    endPosTile.removeAttribute(SNAKE_ATTR);

    return gamestate;
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


function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
