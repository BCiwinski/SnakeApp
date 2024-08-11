var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var _SnakeGame_instances, _SnakeGame_ended, _SnakeGame_inProgress, _SnakeGame_gameTick, _SnakeGame_progressGameState, _SnakeGame_spawnFruitRandom, _SnakeGame_isWon, _SnakeGame_isPointOutsideTheBoard, _SnakeGame_isPointOnSnake, _SnakeGame_getPositionInDirection;
const EMPTY = 0;
const HEAD = 1;
const SNAKE = 2;
const FRUIT = 3;
export class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    equals(other) {
        if (this.x != other.x) {
            return false;
        }
        if (this.y != other.y) {
            return false;
        }
        return true;
    }
}
export class Grid {
    constructor(size) {
        this.size = size;
        this.tiles = new Array;
        for (let i = 0; i < size; i++) {
            let row = [];
            for (let j = 0; j < size; j++) {
                row.push(0);
            }
            this.tiles.push(row);
        }
    }
    setTile(value, atPoint) {
        this.tiles[atPoint.x][atPoint.y] = value;
    }
    getTile(atPoint) {
        return this.tiles[atPoint.x][atPoint.y];
    }
}
export class Snake {
    constructor(grid) {
        this.grid = grid;
        this.body = new Array;
        this.end = new Point(0, 0);
        this.body.push(this.end);
        this.head = new Point(0, 1);
        this.body.forEach(function (value) { grid.setTile(2, value); });
        grid.setTile(1, this.head);
    }
}
export class SnakeGame extends EventTarget {
    constructor(element, gameMode) {
        super();
        _SnakeGame_instances.add(this);
        this.tick = new Event("tick");
        this.victory = new Event("victory");
        this.failure = new Event("failure");
        _SnakeGame_ended.set(this, false);
        _SnakeGame_inProgress.set(this, false);
        this.currentDirection = "down";
        this.element = element;
        this.mode = gameMode;
        this.grid = new Grid(gameMode.size);
        this.snake = new Snake(this.grid);
        __classPrivateFieldGet(this, _SnakeGame_instances, "m", _SnakeGame_spawnFruitRandom).call(this);
    }
    start() {
        if (__classPrivateFieldGet(this, _SnakeGame_inProgress, "f") || __classPrivateFieldGet(this, _SnakeGame_ended, "f")) {
            return;
        }
        __classPrivateFieldSet(this, _SnakeGame_inProgress, true, "f");
        __classPrivateFieldGet(this, _SnakeGame_instances, "m", _SnakeGame_gameTick).call(this);
    }
    stop() {
        if (!__classPrivateFieldGet(this, _SnakeGame_inProgress, "f")) {
            return;
        }
        __classPrivateFieldSet(this, _SnakeGame_inProgress, false, "f");
    }
}
_SnakeGame_ended = new WeakMap(), _SnakeGame_inProgress = new WeakMap(), _SnakeGame_instances = new WeakSet(), _SnakeGame_gameTick = function _SnakeGame_gameTick() {
    if (!__classPrivateFieldGet(this, _SnakeGame_inProgress, "f")) {
        return;
    }
    __classPrivateFieldGet(this, _SnakeGame_instances, "m", _SnakeGame_progressGameState).call(this);
    __classPrivateFieldGet(this, _SnakeGame_instances, "m", _SnakeGame_spawnFruitRandom).call(this);
    if (__classPrivateFieldGet(this, _SnakeGame_ended, "f")) {
        return;
    }
    //Call next tick delayed
    new Promise(resolve => setTimeout(resolve, this.mode.tickMiliseconds)).then(() => { __classPrivateFieldGet(this, _SnakeGame_instances, "m", _SnakeGame_gameTick).call(this); });
    this.dispatchEvent(this.tick);
}, _SnakeGame_progressGameState = function _SnakeGame_progressGameState() {
    if (__classPrivateFieldGet(this, _SnakeGame_instances, "m", _SnakeGame_isWon).call(this)) {
        __classPrivateFieldSet(this, _SnakeGame_ended, true, "f");
        __classPrivateFieldSet(this, _SnakeGame_inProgress, false, "f");
        this.dispatchEvent(this.victory);
        return;
    }
    const oldHeadPos = new Point(this.snake.head.x, this.snake.head.y);
    const newHeadPos = __classPrivateFieldGet(this, _SnakeGame_instances, "m", _SnakeGame_getPositionInDirection).call(this, this.snake.head, this.currentDirection);
    if (__classPrivateFieldGet(this, _SnakeGame_instances, "m", _SnakeGame_isPointOutsideTheBoard).call(this, newHeadPos)) {
        __classPrivateFieldSet(this, _SnakeGame_ended, true, "f");
        __classPrivateFieldSet(this, _SnakeGame_inProgress, false, "f");
        this.dispatchEvent(this.failure);
    }
    if (__classPrivateFieldGet(this, _SnakeGame_instances, "m", _SnakeGame_isPointOnSnake).call(this, newHeadPos) && !(newHeadPos.equals(this.snake.end))) {
        __classPrivateFieldSet(this, _SnakeGame_ended, true, "f");
        __classPrivateFieldSet(this, _SnakeGame_inProgress, false, "f");
        this.dispatchEvent(this.failure);
    }
    this.snake.body.push(oldHeadPos);
    //see if snake's head will be on a tile containing fruit
    if (this.grid.getTile(newHeadPos) == FRUIT) {
        //add score
    }
    else {
        //if snake wont be eating a fruit, move his end (remove one part)
        this.grid.setTile(EMPTY, this.snake.end);
        this.snake.body.shift();
        this.snake.end = this.snake.body[0];
    }
    //move snake's head
    this.snake.head = newHeadPos;
    this.grid.setTile(HEAD, newHeadPos);
    //part of his body follows where his head was
    this.grid.setTile(SNAKE, oldHeadPos);
}, _SnakeGame_spawnFruitRandom = function _SnakeGame_spawnFruitRandom() {
    for (let i = 0; i < this.mode.fruitSpawnNumber; i++) {
        let rand = Math.random() * this.mode.fruitSpawnChance;
        if (rand > 1.0) {
            continue;
        }
        for (let j = 0; j < this.mode.fruitSpawnPositionTries; j++) {
            let rand_x = Math.round(Math.random() * (this.grid.size - 1));
            let rand_y = Math.round(Math.random() * (this.grid.size - 1));
            let rand_point = new Point(rand_x, rand_y);
            if (this.grid.getTile(rand_point) == EMPTY) {
                this.grid.setTile(FRUIT, rand_point);
                break;
            }
        }
    }
}, _SnakeGame_isWon = function _SnakeGame_isWon() {
    for (let i = 0; i < this.grid.size; i++) {
        for (let j = 0; j < this.grid.size; j++) {
            let tile = this.grid.getTile(new Point(i, j));
            if (tile == EMPTY || tile == FRUIT) {
                return false;
            }
        }
    }
    return true;
}, _SnakeGame_isPointOutsideTheBoard = function _SnakeGame_isPointOutsideTheBoard(point) {
    if (point.x < 0)
        return true;
    if (point.y < 0)
        return true;
    if (point.x >= this.grid.size)
        return true;
    if (point.y >= this.grid.size)
        return true;
    return false;
}, _SnakeGame_isPointOnSnake = function _SnakeGame_isPointOnSnake(position) {
    return this.grid.getTile(position) == 2;
}, _SnakeGame_getPositionInDirection = function _SnakeGame_getPositionInDirection(position, direction) {
    let newPos = new Point(position.x, position.y);
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
};
export class Mode {
    constructor(name, description, size, fruitSpawnChance, fruitSpawnPositionTries, fruitSpawnNumber, tickMiliseconds) {
        this.name = name;
        this.description = description;
        this.size = size;
        this.fruitSpawnChance = fruitSpawnChance;
        this.fruitSpawnPositionTries = fruitSpawnPositionTries;
        this.fruitSpawnNumber = fruitSpawnNumber;
        this.tickMiliseconds = tickMiliseconds;
    }
}
//# sourceMappingURL=SnakeGame.js.map