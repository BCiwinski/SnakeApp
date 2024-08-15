﻿export type Direction = "down" | "up" | "right" | "left";

type SnakeMoveResult = "ok" | "ateFruit" | "isOutside" | "bitSelf";

const EMPTY = 0;
const HEAD = 1;
const SNAKE = 2;
const FRUIT = 3;

export class Point {
    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    /**
     * Checks whether this point is exaclty the same as the other.
     * @param other - the other tile.
     * @returns
     */
    equals(other: Point) : boolean {

        if (this.x != other.x) {

            return false;
        }

        if (this.y != other.y) {

            return false;
        }

        return true;
    }
}

export class Grid{

    tiles: Array<Array<number>>;

    size: number;

    constructor(size: number) {

        this.size = size;
        this.tiles = new Array<Array<number>>;


        for (let i = 0; i < size; i++) {

            let row = [];

            for (let j = 0; j < size; j++) {

                row.push(EMPTY);
            }

            this.tiles.push(row);
        }
    }

    /**
     * Sets value for a tile at a give position.
     * @param value - the value to set the tile to.
     * @param atPoint - position of the tile.
     */
    setTile(value: number, atPoint: Point): void {

        this.tiles[atPoint.x][atPoint.y] = value;
    }

    /**
     * Gets value for a tile at a given position.
     * @param atPoint - postition of the tile.
     * @returns
     */
    getTile(atPoint: Point): number {

        return this.tiles[atPoint.x][atPoint.y];
    }

    /**
     * Check whetehr given point is outside of the grid.
     * @param point
     * @returns
     */
    isOutside(point: Point): boolean {

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

    /**
     * Gets a position next to a given one, in a given direction.
     * @param position - given position.
     * @param direction - direction from give position.
     * @returns
     */
    getPositionInDirection(position: Point, direction: Direction): Point {

        let newPos: Point = new Point(position.x, position.y);

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

    grid: Grid

    head: Point;
    end: Point;

    body: Array<Point>

    constructor(grid : Grid) {

        this.grid = grid;
        this.body = new Array<Point>;

        this.end = new Point(0, 0);
        this.body.push(this.end);
        this.head = new Point(0, 1);

        this.body.forEach(function (value: Point) { grid.setTile(SNAKE, value) })
        grid.setTile(HEAD, this.head);
    }

    /**
     * Moves the snake in a given direction. The snake's head moves in the given direction and the rest of the body follows.
     * Makes the snake longer when his head is moved into a tile containing fruit. Sets grid's values for the snake.
     * @param direction - the direction sanke's head moves in.
     * @returns
     */
    move(direction: Direction): SnakeMoveResult {

        let ateFruit: boolean = false;

        const oldHeadPos: Point = new Point(this.head.x, this.head.y);
        const newHeadPos: Point = this.grid.getPositionInDirection(this.head, direction);

        if (this.grid.isOutside(newHeadPos)) {
            return "isOutside";
        }

        if (this.#bitSelf(newHeadPos) && !(newHeadPos.equals(this.end))) {
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

    /**
     * Check whether a snakes head, in a given position would result in a snake biting itself.
     * @param headPosition - the position to test.
     * @returns
     */
    #bitSelf(headPosition: Point): boolean {

        return this.grid.getTile(headPosition) == SNAKE;
    }

    /**
     * Gives current length of the snake, including its head.
     * @returns
     */
    length() : number {

        return this.body.length + 1;
    }
}

export class SnakeGame extends EventTarget {

    tick: Event = new Event("tick");

    element: HTMLElement

    grid: Grid

    snake: Snake

    #tick: number = 0;

    #ended: boolean = false;

    #inProgress: boolean = false;

    #fruitAmount: number = 0;

    mode: Mode

    #currentDirection: Direction = "down";

    #input: Direction = "down";

    #bufferedInput: Direction = "down";

    #inputConsumed: boolean = true;

    #bufferedInputConsumed: boolean = true;

    constructor(element: HTMLElement, gameMode: Mode) {

        super();

        this.element = element;
        this.mode = gameMode

        this.grid = new Grid(gameMode.size);
        this.snake = new Snake(this.grid);

        this.#spawnFruitRandom();
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

            this.#fruitAmount--;
        }
    }

    /**
     * Spawns fruits using random number generator and values from Mode.
     */
    #spawnFruitRandom(): void {

        for (let i = 0; i < this.mode.fruitSpawnNumber && (this.#fruitAmount < this.mode.fruitMaxAmount || this.mode.fruitMaxAmount == 0); i++) {

            let rand = Math.random() * this.mode.fruitSpawnChance;

            if (rand > 1.0) {
                continue;
            }

            for (let j = 0; j < this.mode.fruitSpawnPositionTries; j++) {

                let rand_x = Math.round(Math.random() * (this.grid.size - 1));
                let rand_y = Math.round(Math.random() * (this.grid.size - 1));

                let rand_point = new Point(rand_x, rand_y);

                if (this.grid.getTile(rand_point) == EMPTY) {

                    this.#fruitAmount++;
                    this.grid.setTile(FRUIT, rand_point);
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