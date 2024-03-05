const DOWN = "down";
const UP = "up";
const RIGHT = "right";
const LEFT = "left";

const HEAD_ATTR = "head";
const SNAKE_ATTR = "snake";

var direction = DOWN;

$(window.addEventListener('keydown', function (e) {

    switch (e.key) {

        case 's':
            direction = DOWN;
            break;
        case 'w':
            direction = UP;
            break;
        case 'd':
            direction = RIGHT;
            break;
        case 'a':
            direction = LEFT;
    }

}, false))

function startGame(gridElement, sizeNumber, messageElement) {

    clearBoard(gridElement);
    generateBoardElements(gridElement, sizeNumber);

    let snake = generateSnake(gridElement, sizeNumber);

    let gameState = { gridElement: gridElement, size: sizeNumber, snake: snake, ended: false};

    gameTick(gameState, gridElement, messageElement);
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

function generateSnake(gridElement, sizeNumber) {

    let bodyTile = getTile(gridElement, sizeNumber, [0, 0]);
    let headTile = getTile(gridElement, sizeNumber, [0, 1]);

    bodyTile.setAttribute(SNAKE_ATTR, "");
    headTile.setAttribute(HEAD_ATTR, "");

    return { head: [0, 1], body: [[0, 0]], end: [0, 0]};
}

//pos - position - 2 value int array, so: pos[0] - x, pos[1] - y
function getTile(gridElement, sizeNumber, pos) {

    return gridElement.childNodes[pos[0] + pos[1] * sizeNumber];
}

function gameTick(gameState, gridElement, messageElement) {

    gameState = moveSnake(gameState, gridElement, messageElement);

    if (gameState.ended) {
        return;
    }

    sleep(250).then(() => { gameTick(gameState, gridElement, messageElement) });
}

function moveSnake(gamestate, gridElement, messageElement) {

    const oldHeadPos = Array.from(gamestate.snake.head);
    const newHeadPos = getPositionInDirection(gamestate.snake.head, direction);

    if (isOutsideTheBoard(newHeadPos, gamestate.size)) {
        endGame(gamestate, messageElement);
        return gamestate;
    }

    const endPosTile = getTile(gridElement, gamestate.size, gamestate.snake.end);
    const oldHeadPosTile = getTile(gridElement, gamestate.size, gamestate.snake.head);
    const newHeadPosTile = getTile(gridElement, gamestate.size, newHeadPos);

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

function endGame(gamestate, messageElement) {

    gamestate.ended = true;
    messageElement.innerText = "Snake hit his head :(";
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
