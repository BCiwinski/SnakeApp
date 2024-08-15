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
var _Snake_instances, _Snake_bitSelf, _SnakeGame_instances, _SnakeGame_tick, _SnakeGame_ended, _SnakeGame_inProgress, _SnakeGame_fruitAmount, _SnakeGame_gameTick, _SnakeGame_progress, _SnakeGame_spawnFruitRandom, _SnakeGame_isWon, _SnakeGame_score;
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
                row.push(EMPTY);
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
    isOutside(point) {
        if (point.x < 0)
            return true;
        if (point.y < 0)
            return true;
        if (point.x >= this.size)
            return true;
        if (point.y >= this.size)
            return true;
        return false;
    }
    getPositionInDirection(position, direction) {
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
    }
}
class Snake {
    constructor(grid) {
        _Snake_instances.add(this);
        this.grid = grid;
        this.body = new Array;
        this.end = new Point(0, 0);
        this.body.push(this.end);
        this.head = new Point(0, 1);
        this.body.forEach(function (value) { grid.setTile(SNAKE, value); });
        grid.setTile(HEAD, this.head);
    }
    move(direction) {
        let ateFruit = false;
        const oldHeadPos = new Point(this.head.x, this.head.y);
        const newHeadPos = this.grid.getPositionInDirection(this.head, direction);
        if (this.grid.isOutside(newHeadPos)) {
            return "isOutside";
        }
        if (__classPrivateFieldGet(this, _Snake_instances, "m", _Snake_bitSelf).call(this, newHeadPos) && !(newHeadPos.equals(this.end))) {
            return "bitSelf";
        }
        this.body.push(oldHeadPos);
        //see if snake's head will be on a tile containing fruit
        if (this.grid.getTile(newHeadPos) == FRUIT) {
            ateFruit = true;
        }
        else {
            //if snake wont be eating a fruit, move his end (remove one part)
            this.grid.setTile(EMPTY, this.end);
            this.body.shift();
            this.end = this.body[0];
        }
        //move snake's head
        this.head = newHeadPos;
        this.grid.setTile(HEAD, newHeadPos);
        //part of his body follows where his head was
        this.grid.setTile(SNAKE, oldHeadPos);
        if (ateFruit) {
            return "ateFruit";
        }
        return "ok";
    }
    length() {
        return this.body.length + 1;
    }
}
_Snake_instances = new WeakSet(), _Snake_bitSelf = function _Snake_bitSelf(headPosition) {
    return this.grid.getTile(headPosition) == SNAKE;
};
export class SnakeGame extends EventTarget {
    constructor(element, gameMode) {
        super();
        _SnakeGame_instances.add(this);
        this.tick = new Event("tick");
        _SnakeGame_tick.set(this, 0);
        _SnakeGame_ended.set(this, false);
        _SnakeGame_inProgress.set(this, false);
        _SnakeGame_fruitAmount.set(this, 0);
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
_SnakeGame_tick = new WeakMap(), _SnakeGame_ended = new WeakMap(), _SnakeGame_inProgress = new WeakMap(), _SnakeGame_fruitAmount = new WeakMap(), _SnakeGame_instances = new WeakSet(), _SnakeGame_gameTick = function _SnakeGame_gameTick() {
    if (!__classPrivateFieldGet(this, _SnakeGame_inProgress, "f")) {
        return;
    }
    __classPrivateFieldSet(this, _SnakeGame_tick, __classPrivateFieldGet(this, _SnakeGame_tick, "f") + 1, "f");
    __classPrivateFieldGet(this, _SnakeGame_instances, "m", _SnakeGame_progress).call(this);
    __classPrivateFieldGet(this, _SnakeGame_instances, "m", _SnakeGame_spawnFruitRandom).call(this);
    if (__classPrivateFieldGet(this, _SnakeGame_ended, "f")) {
        return;
    }
    //Call next tick delayed
    new Promise(resolve => setTimeout(resolve, this.mode.tickMiliseconds)).then(() => { __classPrivateFieldGet(this, _SnakeGame_instances, "m", _SnakeGame_gameTick).call(this); });
    this.dispatchEvent(this.tick);
}, _SnakeGame_progress = function _SnakeGame_progress() {
    var _a;
    if (__classPrivateFieldGet(this, _SnakeGame_instances, "m", _SnakeGame_isWon).call(this)) {
        __classPrivateFieldSet(this, _SnakeGame_ended, true, "f");
        __classPrivateFieldSet(this, _SnakeGame_inProgress, false, "f");
        this.dispatchEvent(new CustomEvent("victory", { detail: new VictoryEventDetail(__classPrivateFieldGet(this, _SnakeGame_instances, "m", _SnakeGame_score).call(this), this.mode.name) }));
        return;
    }
    let result = this.snake.move(this.currentDirection);
    if (result == "isOutside") {
        __classPrivateFieldSet(this, _SnakeGame_ended, true, "f");
        __classPrivateFieldSet(this, _SnakeGame_inProgress, false, "f");
        this.dispatchEvent(new CustomEvent("failure", { detail: new FailureEventDetail("isOutside") }));
    }
    if (result == "bitSelf") {
        __classPrivateFieldSet(this, _SnakeGame_ended, true, "f");
        __classPrivateFieldSet(this, _SnakeGame_inProgress, false, "f");
        this.dispatchEvent(new CustomEvent("failure", { detail: new FailureEventDetail("bitSelf") }));
    }
    if (result == "ateFruit") {
        __classPrivateFieldSet(this, _SnakeGame_fruitAmount, (_a = __classPrivateFieldGet(this, _SnakeGame_fruitAmount, "f"), _a--, _a), "f");
    }
}, _SnakeGame_spawnFruitRandom = function _SnakeGame_spawnFruitRandom() {
    var _a;
    for (let i = 0; i < this.mode.fruitSpawnNumber && (__classPrivateFieldGet(this, _SnakeGame_fruitAmount, "f") < this.mode.fruitMaxAmount || this.mode.fruitMaxAmount == 0); i++) {
        let rand = Math.random() * this.mode.fruitSpawnChance;
        if (rand > 1.0) {
            continue;
        }
        for (let j = 0; j < this.mode.fruitSpawnPositionTries; j++) {
            let rand_x = Math.round(Math.random() * (this.grid.size - 1));
            let rand_y = Math.round(Math.random() * (this.grid.size - 1));
            let rand_point = new Point(rand_x, rand_y);
            if (this.grid.getTile(rand_point) == EMPTY) {
                __classPrivateFieldSet(this, _SnakeGame_fruitAmount, (_a = __classPrivateFieldGet(this, _SnakeGame_fruitAmount, "f"), _a++, _a), "f");
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
}, _SnakeGame_score = function _SnakeGame_score() {
    if (__classPrivateFieldGet(this, _SnakeGame_tick, "f") == 0) {
        return 0;
    }
    let lengthMultiplier = 10;
    let quotient = Math.sqrt(__classPrivateFieldGet(this, _SnakeGame_tick, "f"));
    return Math.ceil((this.snake.length() * lengthMultiplier) / quotient);
};
export class VictoryEventDetail {
    constructor(score, gameMode) {
        this.score = score;
        this.gameMode = gameMode;
    }
}
export class FailureEventDetail {
    constructor(outcome) {
        this.outcome = outcome;
    }
}
export class Mode {
    constructor(name, description, size, fruitSpawnChance, fruitSpawnPositionTries, fruitSpawnNumber, fruitMaxAmount, tickMiliseconds) {
        this.name = name;
        this.description = description;
        this.size = size;
        this.fruitSpawnChance = fruitSpawnChance;
        this.fruitSpawnPositionTries = fruitSpawnPositionTries;
        this.fruitSpawnNumber = fruitSpawnNumber;
        this.fruitMaxAmount = fruitMaxAmount;
        this.tickMiliseconds = tickMiliseconds;
    }
}
//# sourceMappingURL=SnakeGame.js.map