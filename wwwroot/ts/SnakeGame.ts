export type Direction = "down" | "up" | "right" | "left";

type SnakeMoveResult = "ok" | "isOutside" | "bitSelf";

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

    setTile(value: number, atPoint: Point): void {

        this.tiles[atPoint.x][atPoint.y] = value;
    }

    getTile(atPoint: Point): number {

        return this.tiles[atPoint.x][atPoint.y];
    }

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

    move(direction: Direction): SnakeMoveResult {

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

            //add score
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

        return "ok";
    }

    #bitSelf(headPosition: Point): boolean {

        return this.grid.getTile(headPosition) == SNAKE;
    }

    length() : number {

        return this.body.length + 1;
    }
}

export class SnakeGame extends EventTarget {

    tick: Event = new Event("tick");

    victory: Event = new Event("victory");

    failure: Event = new Event("failure");

    element: HTMLElement

    grid: Grid

    snake: Snake

    #ended: boolean = false;

    #inProgress: boolean = false;

    mode: Mode

    currentDirection: Direction = "down";

    constructor(element: HTMLElement, gameMode: Mode) {

        super();

        this.element = element;
        this.mode = gameMode

        this.grid = new Grid(gameMode.size);
        this.snake = new Snake(this.grid);

        this.#spawnFruitRandom();
    }

    start() {

        if (this.#inProgress || this.#ended) {
            return;
        }

        this.#inProgress = true;
        this.#gameTick();
    }

    stop() {

        if (!this.#inProgress) {
            return;
        }

        this.#inProgress = false;
    }

    #gameTick(): void {

        if(!this.#inProgress) {

            return;
        }

        this.#progress();
        this.#spawnFruitRandom();

        if (this.#ended) {
            return;
        }

        //Call next tick delayed
        new Promise<void>(resolve => setTimeout(resolve, this.mode.tickMiliseconds)).then(() => { this.#gameTick() });
        this.dispatchEvent(this.tick);
    }

    #progress(): void {

        if (this.#isWon()) {
            this.#ended = true;
            this.#inProgress = false;
            this.dispatchEvent(this.victory);
            return;
        }

        let result = this.snake.move(this.currentDirection);

        if (result == "isOutside") {

            this.#ended = true;
            this.#inProgress = false;
            this.dispatchEvent(this.failure);
        }

        if (result == "bitSelf") {

            this.#ended = true;
            this.#inProgress = false;
            this.dispatchEvent(this.failure);
        }
    }

    #spawnFruitRandom(): void {

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
}

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
}

export class Mode {

    name: string

    description: string

    size: number

    fruitSpawnChance: number

    fruitSpawnPositionTries: number

    fruitSpawnNumber: number

    tickMiliseconds: number

    constructor(name: string,
        description: string,
        size: number,
        fruitSpawnChance: number,
        fruitSpawnPositionTries: number,
        fruitSpawnNumber: number,
        tickMiliseconds: number) {

        this.name = name;
        this.description = description;
        this.size = size;
        this.fruitSpawnChance = fruitSpawnChance;
        this.fruitSpawnPositionTries = fruitSpawnPositionTries;
        this.fruitSpawnNumber = fruitSpawnNumber;
        this.tickMiliseconds = tickMiliseconds;
    }
}