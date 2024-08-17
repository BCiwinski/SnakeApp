import { Point, Direction, Grid, Snake, SnakeMoveResult } from "./SnakeGameTypes.js";
import Renderer from "./SnakeRenderer.js";

const EMPTY = 0;
const HEAD = 1;
const SNAKE = 2;
const FRUIT = 3;

export class SnakeGame extends EventTarget {

    tick: Event = new Event("tick");

    element: HTMLElement

    grid: Grid

    snake: Snake

    #tick: number = 0;

    #ended: boolean = false;

    #inProgress: boolean = false;

    #fruits: Array<Point>

    mode: Mode

    #currentDirection: Direction = "down";

    #input: Direction = "down";

    #bufferedInput: Direction = "down";

    #inputConsumed: boolean = true;

    #bufferedInputConsumed: boolean = true;

    #renderer: Renderer

    constructor(gameMode: Mode, renderingContext : CanvasRenderingContext2D, atlas: HTMLImageElement) {

        super();
        this.mode = gameMode

        this.grid = new Grid(gameMode.size);
        this.snake = new Snake(this.grid);
        this.#fruits = new Array<Point>();

        this.#renderer = new Renderer(renderingContext, this.snake, atlas, this.#fruits, this.grid);

        this.#spawnFruitRandom();
        this.#renderer.update();
    }

    /**
     * Starts the game. Can be use to unpause it. Does nothing, if the game has already ended.
     * @returns
     */
    start() {

        if (this.#inProgress || this.#ended) {
            return;
        }

        this.#inProgress = true;
        this.#gameTick();
    }

    /**
     * Pauses the game. Can be unpaused by start().
     * @returns
     */
    stop() {

        if (!this.#inProgress) {
            return;
        }

        this.#inProgress = false;
    }

    /**
     * A method for handling user input.
     * @param newDirection - the direction for the snake to move in.
     * @returns
     */
    input(newDirection: Direction)
    {
        let input: Direction;
        let bufferedInput: Direction;

        if (this.#inputConsumed) {

            input = newDirection;
        }
        else {

            if (!this.#bufferedInputConsumed) {
                //ignore input
                return;
            }

            input = newDirection;
        }

        let proper: boolean = this.#isInputProper(input, !this.#inputConsumed);

        if (!proper) {
            //ignore input
            return;
        }

        if (this.#inputConsumed) {

            this.#input = input;
            this.#inputConsumed = false;
            return;
        }
        else {

            this.#bufferedInput = input;
            this.#bufferedInputConsumed = false;
            return;
        }
    }

    /**
     * Checks whether given input can be performed. Snake cannot immedietly change direction from up/down and left/right.
     * @param input - given Direction, to check.
     * @param buffered - whether a given input is to be checked as buffered or non-buffered.
     * @returns
     */
    #isInputProper(input: Direction, buffered: boolean) : boolean {

        let against = buffered ? this.#input : this.#currentDirection;

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
    }

    /**
     * Game's main loop, handling all main logic. Calls itself with a certain delay, to progress the game until it reaches end
     * or until it's paused.
     * @returns
     */
    #gameTick(): void {

        if(!this.#inProgress) {

            return;
        }

        if (!this.#inputConsumed) {

            this.#currentDirection = this.#input;
            this.#input = this.#bufferedInput;

            this.#inputConsumed = this.#bufferedInputConsumed;
            this.#bufferedInputConsumed = true;
        }

        this.#tick += 1;
        this.#progress();
        this.#spawnFruitRandom();
        this.#renderer.update();

        if (this.#ended) {
            return;
        }

        //Call next tick delayed
        new Promise<void>(resolve => setTimeout(resolve, this.mode.tickMiliseconds)).then(() => { this.#gameTick() });
        this.dispatchEvent(this.tick);
    }

    /**
     * Handles snake's movement and tests for failure or victory.
     * Publishes failure and victory events.
     * @returns
     */
    #progress(): void {

        if (this.#isWon()) {
            this.#ended = true;
            this.#inProgress = false;
            this.dispatchEvent(new CustomEvent("victory", { detail: new VictoryEventDetail(this.#score(), this.mode.name) }));
            return;
        }

        let result = this.snake.move(this.#currentDirection);

        if (result == "isOutside") {

            this.#ended = true;
            this.#inProgress = false;
            this.dispatchEvent(new CustomEvent("failure", { detail: new FailureEventDetail("isOutside") }));
        }

        if (result == "bitSelf") {

            this.#ended = true;
            this.#inProgress = false;
            this.dispatchEvent(new CustomEvent("failure", { detail: new FailureEventDetail("bitSelf") }));
        }

        if (result == "ateFruit") {

            const toRemove = this.#fruits.find(p => p.equals(this.snake.head))
            const index = this.#fruits.indexOf(toRemove);
            this.#fruits[index] = this.#fruits[this.#fruits.length - 1];
            this.#fruits.pop();
        }
    }

    /**
     * Spawns fruits using random number generator and values from Mode.
     */
    #spawnFruitRandom(): void {

        for (let i = 0; i < this.mode.fruitSpawnNumber && (this.#fruits.length < this.mode.fruitMaxAmount || this.mode.fruitMaxAmount == 0); i++) {

            let rand = Math.random() * this.mode.fruitSpawnChance;

            if (rand > 1.0) {
                continue;
            }

            for (let j = 0; j < this.mode.fruitSpawnPositionTries; j++) {

                let rand_x = Math.round(Math.random() * (this.grid.size - 1));
                let rand_y = Math.round(Math.random() * (this.grid.size - 1));

                let point = new Point(rand_x, rand_y);

                if (this.grid.getTile(point) == EMPTY) {

                    this.#fruits.push(point);
                    this.grid.setTile(FRUIT, point);
                    break;
                }

            }
        }
    }

    /**
     * Tests whether the game is won.
     * @returns
     */
    #isWon(): boolean {

    for (let i = 0; i < this.grid.size; i++) {

        for (let j = 0; j < this.grid.size; j++) {

            let tile = this.grid.getTile(new Point(i, j));

            if (tile == EMPTY || tile == FRUIT) {

                return false;
            }
        }
    }

    return true;
    }

    /**
     * Computes a number representing how "well" the game was played. It balances amount of fruit eaten (more -> higher score)
     * and amount of ticks passed (more -> lower score).
     * @returns
     */
    #score() : number {

        if (this.#tick == 0) {
            return 0;
        }

        let lengthMultiplier = 10;
        let quotient = Math.sqrt(this.#tick);

        return Math.ceil((this.snake.length() * lengthMultiplier) / quotient);
    }
}

export type GameOutcome = "victory" | "bitSelf" | "isOutside";

export class VictoryEventDetail {
    
    score: number

    gameMode: string

    constructor(score: number, gameMode: string) {

        this.score = score;
        this.gameMode = gameMode;
    }
}

export class FailureEventDetail {

    outcome: GameOutcome

    constructor(outcome: GameOutcome) {

        this.outcome = outcome;
    }
}

export class Mode {

    name: string

    description: string

    size: number

    fruitSpawnChance: number

    fruitSpawnPositionTries: number

    fruitSpawnNumber: number

    fruitMaxAmount: number

    tickMiliseconds: number

    constructor(name: string,
        description: string,
        size: number,
        fruitSpawnChance: number,
        fruitSpawnPositionTries: number,
        fruitSpawnNumber: number,
        fruitMaxAmount: number,
        tickMiliseconds: number) {

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