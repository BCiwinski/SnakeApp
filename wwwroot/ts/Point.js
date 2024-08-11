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
var _State_instances, _State_ended, _State_inProgress, _State_gameTick, _State_progressGameState, _State_spawnFruitRandom, _State_isWon, _State_isPointOutsideTheBoard, _State_isPointOnSnake, _State_posAreEqual, _State_getPositionInDirection;
const EMPTY = 0;
const HEAD = 1;
const SNAKE = 2;
const FRUIT = 3;
export class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
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
export class State extends EventTarget {
    constructor(element, gameMode) {
        super();
        _State_instances.add(this);
        this.tick = new Event("tick");
        this.victory = new Event("victory");
        this.failure = new Event("failure");
        _State_ended.set(this, false);
        _State_inProgress.set(this, false);
        this.currentDirection = "down";
        this.element = element;
        this.mode = gameMode;
        this.grid = new Grid(gameMode.size);
        this.snake = new Snake(this.grid);
        __classPrivateFieldGet(this, _State_instances, "m", _State_spawnFruitRandom).call(this);
    }
    start() {
        if (__classPrivateFieldGet(this, _State_inProgress, "f") || __classPrivateFieldGet(this, _State_ended, "f")) {
            return;
        }
        __classPrivateFieldSet(this, _State_inProgress, true, "f");
        __classPrivateFieldGet(this, _State_instances, "m", _State_gameTick).call(this);
    }
    stop() {
        if (!__classPrivateFieldGet(this, _State_inProgress, "f")) {
            return;
        }
        __classPrivateFieldSet(this, _State_inProgress, false, "f");
    }
}
_State_ended = new WeakMap(), _State_inProgress = new WeakMap(), _State_instances = new WeakSet(), _State_gameTick = function _State_gameTick() {
    if (!__classPrivateFieldGet(this, _State_inProgress, "f")) {
        return;
    }
    __classPrivateFieldGet(this, _State_instances, "m", _State_progressGameState).call(this);
    __classPrivateFieldGet(this, _State_instances, "m", _State_spawnFruitRandom).call(this);
    //updateGridElements(game, grid);
    if (__classPrivateFieldGet(this, _State_ended, "f")) {
        return;
    }
    //if the game isn't ended - call next tick
    //delay next this given delayMs
    new Promise(resolve => setTimeout(resolve, this.mode.tickMiliseconds)).then(() => { __classPrivateFieldGet(this, _State_instances, "m", _State_gameTick).call(this); });
    this.dispatchEvent(this.tick);
}, _State_progressGameState = function _State_progressGameState() {
    if (__classPrivateFieldGet(this, _State_instances, "m", _State_isWon).call(this)) {
        __classPrivateFieldSet(this, _State_ended, true, "f");
        __classPrivateFieldSet(this, _State_inProgress, false, "f");
        this.dispatchEvent(this.victory);
        return;
    }
    const oldHeadPos = new Point(this.snake.head.x, this.snake.head.y);
    const newHeadPos = __classPrivateFieldGet(this, _State_instances, "m", _State_getPositionInDirection).call(this, this.snake.head, this.currentDirection);
    if (__classPrivateFieldGet(this, _State_instances, "m", _State_isPointOutsideTheBoard).call(this, newHeadPos)) {
        __classPrivateFieldSet(this, _State_ended, true, "f");
        __classPrivateFieldSet(this, _State_inProgress, false, "f");
        this.dispatchEvent(this.failure);
    }
    if (__classPrivateFieldGet(this, _State_instances, "m", _State_isPointOnSnake).call(this, newHeadPos) && !__classPrivateFieldGet(this, _State_instances, "m", _State_posAreEqual).call(this, newHeadPos, this.snake.end)) {
        __classPrivateFieldSet(this, _State_ended, true, "f");
        __classPrivateFieldSet(this, _State_inProgress, false, "f");
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
}, _State_spawnFruitRandom = function _State_spawnFruitRandom() {
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
}, _State_isWon = function _State_isWon() {
    for (let i = 0; i < this.grid.size; i++) {
        for (let j = 0; j < this.grid.size; j++) {
            let tile = this.grid.getTile(new Point(i, j));
            if (tile == EMPTY || tile == FRUIT) {
                return false;
            }
        }
    }
    return true;
}, _State_isPointOutsideTheBoard = function _State_isPointOutsideTheBoard(point) {
    if (point.x < 0)
        return true;
    if (point.y < 0)
        return true;
    if (point.x >= this.grid.size)
        return true;
    if (point.y >= this.grid.size)
        return true;
    return false;
}, _State_isPointOnSnake = function _State_isPointOnSnake(position) {
    return this.grid.getTile(position) == 2;
}, _State_posAreEqual = function _State_posAreEqual(first, second) {
    if (first.x != second.x) {
        return false;
    }
    if (first.y != second.y) {
        return false;
    }
    return true;
}, _State_getPositionInDirection = function _State_getPositionInDirection(position, direction) {
    let newPos = Object.assign({}, position);
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
//# sourceMappingURL=Point.js.map