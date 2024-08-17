const EMPTY = 0;
const HEAD = 1;
const SNAKE = 2;
const FRUIT = 3;

export type Direction = "down" | "up" | "right" | "left";

export type SnakeMoveResult = "ok" | "ateFruit" | "isOutside" | "bitSelf";

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
    equals(other: Point): boolean {

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

export class Snake {

    grid: Grid

    head: Point;
    end: Point;

    body: Array<Point>

    constructor(grid: Grid) {

        this.grid = grid;
        this.body = new Array<Point>;

        this.end = new Point(0, 0);
        this.body.push(this.end);
        this.body.push(new Point(0, 1));
        this.head = new Point(0, 2);

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

        let result: SnakeMoveResult = "ok";

        const oldHeadPos: Point = new Point(this.head.x, this.head.y);
        const newHeadPos: Point = this.grid.getPositionInDirection(this.head, direction);

        if (this.grid.isOutside(newHeadPos)) {
            return "isOutside";
        }

        if (this.#bitSelf(newHeadPos) && !(newHeadPos.equals(this.end))) {
            result = "bitSelf";
        }

        this.body.push(oldHeadPos);

        //see if snake's head will be on a tile containing fruit
        if (this.grid.getTile(newHeadPos) == FRUIT) {
            
            result = "ateFruit";
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

        return result;
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
    length(): number {

        return this.body.length;
    }
}