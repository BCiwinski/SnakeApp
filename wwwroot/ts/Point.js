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
export class State {
    constructor(element, grid, snake) {
        this.ended = false;
        this.element = element;
        this.grid = grid;
        this.snake = snake;
    }
    isPointOutsideTheBoard(point) {
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
    isPointOnSnake(position) {
        return this.grid.getTile(position) == 2;
    }
}
//# sourceMappingURL=Point.js.map