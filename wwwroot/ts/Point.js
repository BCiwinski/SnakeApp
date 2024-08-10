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
//# sourceMappingURL=Point.js.map