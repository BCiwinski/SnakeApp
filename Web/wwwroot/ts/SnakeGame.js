var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _SnakeGame_instances, _SnakeGame_tick, _SnakeGame_ended, _SnakeGame_inProgress, _SnakeGame_fruitAmount, _SnakeGame_currentDirection, _SnakeGame_input, _SnakeGame_bufferedInput, _SnakeGame_inputConsumed, _SnakeGame_bufferedInputConsumed, _SnakeGame_renderer, _SnakeGame_isInputProper, _SnakeGame_gameTick, _SnakeGame_progress, _SnakeGame_spawnFruitRandom, _SnakeGame_isWon, _SnakeGame_score;
import { Point, Grid, Snake } from "./SnakeGameTypes.js";
import Renderer from "./SnakeRenderer.js";
const EMPTY = 0;
const HEAD = 1;
const SNAKE = 2;
const FRUIT = 3;
export class SnakeGame extends EventTarget {
    constructor(gameMode, renderingContext, atlas) {
        super();
        _SnakeGame_instances.add(this);
        this.tick = new Event("tick");
        _SnakeGame_tick.set(this, 0);
        _SnakeGame_ended.set(this, false);
        _SnakeGame_inProgress.set(this, false);
        _SnakeGame_fruitAmount.set(this, 0);
        _SnakeGame_currentDirection.set(this, "down");
        _SnakeGame_input.set(this, "down");
        _SnakeGame_bufferedInput.set(this, "down");
        _SnakeGame_inputConsumed.set(this, true);
        _SnakeGame_bufferedInputConsumed.set(this, true);
        _SnakeGame_renderer.set(this, void 0);
        this.mode = gameMode;
        this.grid = new Grid(gameMode.size);
        this.snake = new Snake(this.grid);
        __classPrivateFieldSet(this, _SnakeGame_renderer, new Renderer(renderingContext, this.snake, atlas, this.grid), "f");
        __classPrivateFieldGet(this, _SnakeGame_instances, "m", _SnakeGame_spawnFruitRandom).call(this);
        __classPrivateFieldGet(this, _SnakeGame_renderer, "f").update();
    }
    /**
     * Starts the game. Can be use to unpause it. Does nothing, if the game has already ended.
     * @returns
     */
    start() {
        if (__classPrivateFieldGet(this, _SnakeGame_inProgress, "f") || __classPrivateFieldGet(this, _SnakeGame_ended, "f")) {
            return;
        }
        __classPrivateFieldSet(this, _SnakeGame_inProgress, true, "f");
        __classPrivateFieldGet(this, _SnakeGame_instances, "m", _SnakeGame_gameTick).call(this);
    }
    /**
     * Pauses the game. Can be unpaused by start().
     * @returns
     */
    stop() {
        if (!__classPrivateFieldGet(this, _SnakeGame_inProgress, "f")) {
            return;
        }
        __classPrivateFieldSet(this, _SnakeGame_inProgress, false, "f");
    }
    /**
     * A method for handling user input.
     * @param newDirection - the direction for the snake to move in.
     * @returns
     */
    input(newDirection) {
        let input;
        let bufferedInput;
        if (__classPrivateFieldGet(this, _SnakeGame_inputConsumed, "f")) {
            input = newDirection;
        }
        else {
            if (!__classPrivateFieldGet(this, _SnakeGame_bufferedInputConsumed, "f")) {
                //ignore input
                return;
            }
            input = newDirection;
        }
        let proper = __classPrivateFieldGet(this, _SnakeGame_instances, "m", _SnakeGame_isInputProper).call(this, input, !__classPrivateFieldGet(this, _SnakeGame_inputConsumed, "f"));
        if (!proper) {
            //ignore input
            return;
        }
        if (__classPrivateFieldGet(this, _SnakeGame_inputConsumed, "f")) {
            __classPrivateFieldSet(this, _SnakeGame_input, input, "f");
            __classPrivateFieldSet(this, _SnakeGame_inputConsumed, false, "f");
            return;
        }
        else {
            __classPrivateFieldSet(this, _SnakeGame_bufferedInput, input, "f");
            __classPrivateFieldSet(this, _SnakeGame_bufferedInputConsumed, false, "f");
            return;
        }
    }
}
_SnakeGame_tick = new WeakMap(), _SnakeGame_ended = new WeakMap(), _SnakeGame_inProgress = new WeakMap(), _SnakeGame_fruitAmount = new WeakMap(), _SnakeGame_currentDirection = new WeakMap(), _SnakeGame_input = new WeakMap(), _SnakeGame_bufferedInput = new WeakMap(), _SnakeGame_inputConsumed = new WeakMap(), _SnakeGame_bufferedInputConsumed = new WeakMap(), _SnakeGame_renderer = new WeakMap(), _SnakeGame_instances = new WeakSet(), _SnakeGame_isInputProper = function _SnakeGame_isInputProper(input, buffered) {
    let against = buffered ? __classPrivateFieldGet(this, _SnakeGame_input, "f") : __classPrivateFieldGet(this, _SnakeGame_currentDirection, "f");
    if (input == "up" && against == "down") {
        return false;
    }
    if (input == "down" && against == "up") {
        return false;
    }
    if (input == "left" && against == "right") {
        return false;
    }
    if (input == "right" && against == "left") {
        return false;
    }
    return true;
}, _SnakeGame_gameTick = function _SnakeGame_gameTick() {
    if (!__classPrivateFieldGet(this, _SnakeGame_inProgress, "f")) {
        return;
    }
    if (!__classPrivateFieldGet(this, _SnakeGame_inputConsumed, "f")) {
        __classPrivateFieldSet(this, _SnakeGame_currentDirection, __classPrivateFieldGet(this, _SnakeGame_input, "f"), "f");
        __classPrivateFieldSet(this, _SnakeGame_input, __classPrivateFieldGet(this, _SnakeGame_bufferedInput, "f"), "f");
        __classPrivateFieldSet(this, _SnakeGame_inputConsumed, __classPrivateFieldGet(this, _SnakeGame_bufferedInputConsumed, "f"), "f");
        __classPrivateFieldSet(this, _SnakeGame_bufferedInputConsumed, true, "f");
    }
    __classPrivateFieldSet(this, _SnakeGame_tick, __classPrivateFieldGet(this, _SnakeGame_tick, "f") + 1, "f");
    __classPrivateFieldGet(this, _SnakeGame_instances, "m", _SnakeGame_progress).call(this);
    __classPrivateFieldGet(this, _SnakeGame_instances, "m", _SnakeGame_spawnFruitRandom).call(this);
    __classPrivateFieldGet(this, _SnakeGame_renderer, "f").update();
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
    let result = this.snake.move(__classPrivateFieldGet(this, _SnakeGame_currentDirection, "f"));
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