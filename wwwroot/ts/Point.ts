export type Direction = "down" | "up" | "right" | "left";

export class Point {
    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
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

                row.push(0);
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
}

export class Snake {

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

        this.body.forEach(function (value: Point) { grid.setTile(2, value) })
        grid.setTile(1, this.head);
    }
}

export class State {

    element: HTMLElement

    grid: Grid

    snake: Snake

    ended: boolean = false;

    constructor(element: HTMLElement, grid: Grid, snake: Snake) {

        this.element = element;
        this.grid = grid;
        this.snake = snake;
    }

    isPointOutsideTheBoard(point: Point): boolean {

        if (point.x < 0)
            return true;

        if (point.y < 0)
            return true;

        if (point.x >= this.grid.size)
            return true;

        if (point.y >= this.grid.size)
            return true;

        return false;
    }

    isPointOnSnake(position: Point): boolean {

        return this.grid.getTile(position) == 2;
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