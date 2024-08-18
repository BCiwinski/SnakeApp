var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _Snake_instances, _Snake_bitSelf;
const EMPTY = 0;
const HEAD = 1;
const SNAKE = 2;
const FRUIT = 3;
export class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    /**
     * Checks whether this point is exaclty the same as the other.
     * @param other - the other tile.
     * @returns
     */
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
    /**
     * Sets value for a tile at a give position.
     * @param value - the value to set the tile to.
     * @param atPoint - position of the tile.
     */
    setTile(value, atPoint) {
        this.tiles[atPoint.x][atPoint.y] = value;
    }
    /**
     * Gets value for a tile at a given position.
     * @param atPoint - postition of the tile.
     * @returns
     */
    getTile(atPoint) {
        return this.tiles[atPoint.x][atPoint.y];
    }
    /**
     * Check whetehr given point is outside of the grid.
     * @param point
     * @returns
     */
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
    /**
     * Gets a position next to a given one, in a given direction.
     * @param position - given position.
     * @param direction - direction from give position.
     * @returns
     */
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
export class Snake {
    constructor(grid) {
        _Snake_instances.add(this);
        this.grid = grid;
        this.body = new Array;
        this.end = new Point(0, 0);
        this.body.push(this.end);
        this.body.push(new Point(0, 1));
        this.head = new Point(0, 2);
        this.body.forEach(function (value) { grid.setTile(SNAKE, value); });
        grid.setTile(HEAD, this.head);
    }
    /**
     * Moves the snake in a given direction. The snake's head moves in the given direction and the rest of the body follows.
     * Makes the snake longer when his head is moved into a tile containing fruit. Sets grid's values for the snake.
     * @param direction - the direction sanke's head moves in.
     * @returns
     */
    move(direction) {
        let result = "ok";
        const oldHeadPos = new Point(this.head.x, this.head.y);
        const newHeadPos = this.grid.getPositionInDirection(this.head, direction);
        if (this.grid.isOutside(newHeadPos)) {
            return "isOutside";
        }
        if (__classPrivateFieldGet(this, _Snake_instances, "m", _Snake_bitSelf).call(this, newHeadPos) && !(newHeadPos.equals(this.end))) {
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
     * Gives current length of the snake, including its head.
     * @returns
     */
    length() {
        return this.body.length;
    }
}
_Snake_instances = new WeakSet(), _Snake_bitSelf = function _Snake_bitSelf(headPosition) {
    return this.grid.getTile(headPosition) == SNAKE;
};
//# sourceMappingURL=SnakeGameTypes.js.map